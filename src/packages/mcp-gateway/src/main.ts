#!/usr/bin/env node

import express from 'express';
import cors from 'cors';
import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

interface MCPRequest {
  jsonrpc: string;
  method: string;
  id?: string | number;
  params?: any;
}

interface RequestStats {
  timestamp: string;
  method: string;
  authenticated: boolean;
  responseTime?: number;
  success?: boolean;
  error?: string;
}

class MCPGateway {
  private app: express.Application;
  private port: number;
  private mcpServiceUrl: string;
  private requestStats: RequestStats[] = [];
  private rateLimitMap: Map<string, number[]> = new Map();

  constructor() {
    this.app = express();
    this.port = parseInt(process.env.PORT || '3005');
    this.mcpServiceUrl = process.env.MCP_SERVICE_URL || 'http://mcp-service:3003';

    this.setupMiddleware();
    this.setupRoutes();
    this.startStatsCleanup();
  }

  private setupMiddleware() {
    this.app.use(cors());
    this.app.use(express.json({ limit: '10mb' }));

    // Enhanced request logging middleware
    this.app.use((req, res, next) => {
      const timestamp = new Date().toISOString();
      const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
      const userAgent = req.headers['user-agent'] || 'unknown';

      console.log(`📥 [${timestamp}] ${req.method} ${req.path}`);
      console.log(`🌐 Client: ${clientIP} | Agent: ${userAgent.substring(0, 50)}`);
      console.log(`🔑 Auth: ${req.headers.authorization ? 'Present' : 'Missing'}`);

      // Add timestamp to request for response time calculation
      (req as any).startTime = Date.now();
      next();
    });
  }

  private validateAuthentication(authHeader: string | undefined): boolean {
    if (!authHeader) {
      return false;
    }

    // Extract the expected credentials from environment or use defaults
    const expectedUsername = process.env.AUTH_USERNAME || 'loyal-birds';
    const expectedPassword = process.env.AUTH_PASSWORD || 'c00l-c@ts';
    const expectedAuth = `Basic ${Buffer.from(`${expectedUsername}:${expectedPassword}`).toString('base64')}`;

    return authHeader === expectedAuth;
  }

  private checkRateLimit(clientIP: string): boolean {
    const now = Date.now();
    const windowMs = 60000; // 1 minute window
    const maxRequests = 100; // 100 requests per minute

    if (!this.rateLimitMap.has(clientIP)) {
      this.rateLimitMap.set(clientIP, []);
    }

    const requests = this.rateLimitMap.get(clientIP)!;

    // Remove old requests outside the window
    while (requests.length > 0 && requests[0] < now - windowMs) {
      requests.shift();
    }

    // Check if under limit
    if (requests.length >= maxRequests) {
      return false;
    }

    // Add current request
    requests.push(now);
    return true;
  }

  private logRequest(stats: RequestStats): void {
    this.requestStats.push(stats);

    // Keep only last 1000 requests
    if (this.requestStats.length > 1000) {
      this.requestStats = this.requestStats.slice(-1000);
    }

    const emoji = stats.success ? '✅' : '❌';
    console.log(`${emoji} ${stats.method} | ${stats.responseTime}ms | Auth: ${stats.authenticated}`);
    if (stats.error) {
      console.log(`💥 Error: ${stats.error}`);
    }
  }

  private startStatsCleanup(): void {
    // Clean up old stats and rate limit data every 5 minutes
    setInterval(() => {
      const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;

      // Clean up old rate limit entries
      for (const [ip, requests] of this.rateLimitMap.entries()) {
        const validRequests = requests.filter(time => time > fiveMinutesAgo);
        if (validRequests.length === 0) {
          this.rateLimitMap.delete(ip);
        } else {
          this.rateLimitMap.set(ip, validRequests);
        }
      }

      console.log(`🧹 Cleaned up rate limit data. Active IPs: ${this.rateLimitMap.size}`);
    }, 5 * 60 * 1000);
  }

  private setupRoutes() {
    // Health check endpoint with stats
    this.app.get('/health', (req, res) => {
      const recentStats = this.requestStats.slice(-10);
      const avgResponseTime = recentStats.length > 0
        ? recentStats.reduce((sum, stat) => sum + (stat.responseTime || 0), 0) / recentStats.length
        : 0;

      res.json({
        status: 'healthy',
        service: 'mcp-gateway',
        timestamp: new Date().toISOString(),
        upstreamService: this.mcpServiceUrl,
        stats: {
          totalRequests: this.requestStats.length,
          recentRequests: recentStats.length,
          avgResponseTime: Math.round(avgResponseTime),
          activeIPs: this.rateLimitMap.size
        }
      });
    });

    // Stats endpoint (for monitoring)
    this.app.get('/stats', (req, res) => {
      const recentStats = this.requestStats.slice(-100);
      res.json({
        recentRequests: recentStats,
        activeSessions: this.rateLimitMap.size,
        rateLimits: Array.from(this.rateLimitMap.entries()).map(([ip, requests]) => ({
          ip,
          requestCount: requests.length
        }))
      });
    });

    // MCP endpoint - enhanced with authentication, rate limiting, and logging
    this.app.post('/mcp', async (req, res) => {
      const startTime = (req as any).startTime || Date.now();
      const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
      const jsonRpcRequest: MCPRequest = req.body;

      const requestStats: RequestStats = {
        timestamp: new Date().toISOString(),
        method: jsonRpcRequest.method || 'unknown',
        authenticated: false,
        success: false
      };

      try {
        // 1. Validate JSON-RPC structure
        if (!jsonRpcRequest.jsonrpc || !jsonRpcRequest.method) {
          requestStats.error = 'Invalid JSON-RPC request';
          requestStats.responseTime = Date.now() - startTime;
          this.logRequest(requestStats);

          return res.status(400).json({
            jsonrpc: '2.0',
            id: jsonRpcRequest.id || null,
            error: {
              code: -32600,
              message: 'Invalid Request: Missing jsonrpc or method'
            }
          });
        }

        // 2. Check rate limiting
        if (!this.checkRateLimit(clientIP)) {
          requestStats.error = 'Rate limit exceeded';
          requestStats.responseTime = Date.now() - startTime;
          this.logRequest(requestStats);

          console.log(`🚫 Rate limit exceeded for ${clientIP}`);
          return res.status(429).json({
            jsonrpc: '2.0',
            id: jsonRpcRequest.id || null,
            error: {
              code: -32000,
              message: 'Rate limit exceeded. Maximum 100 requests per minute.'
            }
          });
        }

        // 3. Validate authentication
        const authHeader = req.headers.authorization;
        if (!this.validateAuthentication(authHeader)) {
          requestStats.error = 'Authentication failed';
          requestStats.responseTime = Date.now() - startTime;
          this.logRequest(requestStats);

          console.log(`🔒 Authentication failed for ${clientIP}`);
          return res.status(401).json({
            jsonrpc: '2.0',
            id: jsonRpcRequest.id || null,
            error: {
              code: -32001,
              message: 'Authentication required. Invalid or missing credentials.'
            }
          });
        }

        requestStats.authenticated = true;
        console.log(`🚀 Forwarding MCP request: ${jsonRpcRequest.method} from ${clientIP}`);

        // 4. Forward request to mcp-service
        const response = await axios.post(`${this.mcpServiceUrl}/mcp`, jsonRpcRequest, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': authHeader || ''
          },
          timeout: 30000 // 30 second timeout
        });

        // 5. Success response
        requestStats.success = true;
        requestStats.responseTime = Date.now() - startTime;
        this.logRequest(requestStats);

        console.log(`✅ MCP response received from service (${requestStats.responseTime}ms)`);
        res.json(response.data);

      } catch (error) {
        requestStats.success = false;
        requestStats.responseTime = Date.now() - startTime;

        if (axios.isAxiosError(error)) {
          requestStats.error = `Upstream error: ${error.message}`;
          console.error(`📡 Upstream service error: ${error.message}`);

          res.status(error.response?.status || 500).json({
            jsonrpc: '2.0',
            id: jsonRpcRequest.id || null,
            error: {
              code: -32603,
              message: `Gateway error: ${error.message}`
            }
          });
        } else {
          requestStats.error = 'Internal gateway error';
          console.error('❌ MCP Gateway internal error:', error);

          res.status(500).json({
            jsonrpc: '2.0',
            id: jsonRpcRequest.id || null,
            error: {
              code: -32603,
              message: 'Internal gateway error'
            }
          });
        }

        this.logRequest(requestStats);
      }
    });
  }

  async start() {
    // Test connection to mcp-service
    try {
      const healthCheck = await axios.get(`${this.mcpServiceUrl}/health`, { timeout: 5000 });
      console.log('✅ Connected to MCP service successfully');
    } catch (error) {
      console.warn('⚠️  Could not connect to MCP service:', error instanceof Error ? error.message : error);
      console.log('Gateway will start anyway - MCP service connection will be retried on requests');
    }

    this.app.listen(this.port, '0.0.0.0', () => {
      console.log(`🚀 MCP Gateway started on port ${this.port}`);
      console.log(`📡 Gateway endpoint available at http://localhost:${this.port}/mcp`);
      console.log(`🔗 Forwarding to: ${this.mcpServiceUrl}/mcp`);
      console.log(`❤️  Health check available at http://localhost:${this.port}/health`);
    });
  }
}

// Start the gateway
const mcpGateway = new MCPGateway();
mcpGateway.start().catch((error) => {
  console.error('Failed to start MCP Gateway:', error);
  process.exit(1);
});