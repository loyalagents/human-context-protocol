#!/usr/bin/env node

import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';

import { GraphQLTools } from './tools/graphql.tools';
import { GitHubTools } from './tools/github.tools';
import { GatewayClientService } from './services/gateway-client.service';
import { GraphQLClientService } from './services/graphql-client.service';

// Load environment variables
dotenv.config();

class MCPHttpServer {
  private app: express.Application;
  private port: number;

  constructor() {
    this.app = express();
    this.port = parseInt(process.env.PORT || '3003');

    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware() {
    this.app.use(cors());
    this.app.use(express.json());
  }

  private setupRoutes() {
    // TODO: Re-enable health endpoint with proper routing
    // Currently commented out to simplify Traefik routing for demo.
    // The /health endpoint conflicts with /mcp prefix handling.
    // Future: Either use MCP gateway or fix Traefik path rewriting.

    // Health check endpoint
    // this.app.get('/health', (_req, res) => {
    //   res.json({
    //     status: 'healthy',
    //     service: 'mcp-service',
    //     timestamp: new Date().toISOString()
    //   });
    // });

    // MCP over HTTP endpoint - handles JSON-RPC requests
    this.app.post('/mcp', async (req, res) => {
      try {
        const jsonRpcRequest = req.body;
        console.log('📥 Received MCP request:', JSON.stringify(jsonRpcRequest, null, 2));

        // Extract authentication header
        const authHeader = req.headers.authorization;

        // Validate JSON-RPC request
        const isNotification = jsonRpcRequest.method?.startsWith('notifications/');
        if (!jsonRpcRequest.jsonrpc || !jsonRpcRequest.method || (!isNotification && jsonRpcRequest.id === undefined)) {
          console.error('❌ Invalid MCP request:', jsonRpcRequest);
          return res.status(400).json({
            jsonrpc: '2.0',
            id: jsonRpcRequest.id || null,
            error: {
              code: -32600,
              message: 'Invalid Request'
            }
          });
        }

        // Create authenticated clients and tools for this request
        const gatewayClient = new GatewayClientService(authHeader);
        const graphqlClient = new GraphQLClientService(authHeader);
        const githubTools = new GitHubTools(gatewayClient);
        const graphqlTools = new GraphQLTools(graphqlClient);

        let response;

        switch (jsonRpcRequest.method) {
          case 'tools/list':
            response = {
              jsonrpc: '2.0',
              id: jsonRpcRequest.id,
              result: {
                tools: [
                  ...graphqlTools.getTools(),
                  ...githubTools.getTools()
                ]
              }
            };
            break;

          case 'tools/call':
            const { name, arguments: args } = jsonRpcRequest.params;

            try {
              let result;

              // Route to appropriate tool handler based on tool name
              if (name.startsWith('get_github_') || name.startsWith('get_user_repos')) {
                // GitHub tools still use REST Gateway
                result = await githubTools.handleToolCall(name, args);
                response = {
                  jsonrpc: '2.0',
                  id: jsonRpcRequest.id,
                  result: {
                    content: [
                      {
                        type: 'text',
                        text: JSON.stringify(result, null, 2)
                      }
                    ]
                  }
                };
              } else {
                // All other tools use GraphQL
                result = await graphqlTools.handleToolCall(name, args);
                response = {
                  jsonrpc: '2.0',
                  id: jsonRpcRequest.id,
                  result
                };
              }
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : 'Unknown error';
              response = {
                jsonrpc: '2.0',
                id: jsonRpcRequest.id,
                result: {
                  content: [
                    {
                      type: 'text',
                      text: JSON.stringify({
                        error: errorMessage,
                        tool: name,
                        arguments: args
                      }, null, 2)
                    }
                  ],
                  isError: true
                }
              };
            }
            break;

          case 'initialize':
            response = {
              jsonrpc: '2.0',
              id: jsonRpcRequest.id,
              result: {
                protocolVersion: jsonRpcRequest.params?.protocolVersion || '2024-11-05',
                capabilities: {
                  tools: {}
                },
                serverInfo: {
                  name: 'personal-context-router',
                  version: '1.0.0'
                }
              }
            };
            break;

          case 'notifications/initialized':
            // Handle initialized notification (no response needed)
            response = null;
            break;

          case 'ping':
            response = {
              jsonrpc: '2.0',
              id: jsonRpcRequest.id,
              result: {}
            };
            break;

          default:
            response = {
              jsonrpc: '2.0',
              id: jsonRpcRequest.id,
              error: {
                code: -32601,
                message: 'Method not found'
              }
            };
        }

        if (response) {
          res.json(response);
        } else {
          // For notifications, return 204 No Content
          res.status(204).send();
        }

      } catch (error) {
        console.error('MCP HTTP Server error:', error);
        res.status(500).json({
          jsonrpc: '2.0',
          id: req.body?.id || null,
          error: {
            code: -32603,
            message: 'Internal error'
          }
        });
      }
    });
  }

  async start() {
    // Test gateway connection (without auth for basic connectivity check)
    try {
      const testClient = new GatewayClientService();
      await testClient.healthCheck();
      console.log('✅ Connected to Gateway successfully');
    } catch (error) {
      console.warn('⚠️  Could not connect to Gateway:', error instanceof Error ? error.message : error);
      console.log('Server will start anyway - Gateway connection will be retried on tool calls');
    }

    this.app.listen(this.port, () => {
      console.log(`🚀 MCP HTTP Server started on port ${this.port}`);
      console.log(`📡 MCP endpoint available at http://localhost:${this.port}/mcp`);
      console.log(`⚠️  Health check temporarily disabled for demo`);
    });
  }
}

// Start the server
const mcpServer = new MCPHttpServer();
mcpServer.start().catch((error) => {
  console.error('Failed to start MCP HTTP server:', error);
  process.exit(1);
});