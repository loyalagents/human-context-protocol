#!/usr/bin/env node

import express from 'express';
import cors from 'cors';
import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

class MCPGateway {
  private app: express.Application;
  private port: number;
  private mcpServiceUrl: string;

  constructor() {
    this.app = express();
    this.port = parseInt(process.env.PORT || '3005');
    this.mcpServiceUrl = process.env.MCP_SERVICE_URL || 'http://mcp-service:3003';

    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware() {
    this.app.use(cors());
    this.app.use(express.json());

    // Request logging middleware
    this.app.use((req, res, next) => {
      const timestamp = new Date().toISOString();
      console.log(`📥 [${timestamp}] ${req.method} ${req.path}`);
      console.log(`🔑 Auth: ${req.headers.authorization ? 'Present' : 'Missing'}`);
      next();
    });
  }

  private setupRoutes() {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        service: 'mcp-gateway',
        timestamp: new Date().toISOString(),
        upstreamService: this.mcpServiceUrl
      });
    });

    // MCP endpoint - forwards to mcp-service
    this.app.post('/mcp', async (req, res) => {
      try {
        const jsonRpcRequest = req.body;
        console.log(`🚀 Forwarding MCP request: ${jsonRpcRequest.method}`);

        // Forward request to mcp-service
        const response = await axios.post(`${this.mcpServiceUrl}/mcp`, jsonRpcRequest, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': req.headers.authorization || ''
          }
        });

        console.log(`✅ MCP response received from service`);
        res.json(response.data);

      } catch (error) {
        console.error('❌ MCP Gateway error:', error);

        if (axios.isAxiosError(error)) {
          console.error('📡 Upstream service error:', error.message);
          res.status(error.response?.status || 500).json({
            jsonrpc: '2.0',
            id: req.body?.id || null,
            error: {
              code: -32603,
              message: `Gateway error: ${error.message}`
            }
          });
        } else {
          res.status(500).json({
            jsonrpc: '2.0',
            id: req.body?.id || null,
            error: {
              code: -32603,
              message: 'Internal gateway error'
            }
          });
        }
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