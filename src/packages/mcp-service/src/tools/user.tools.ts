import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { GatewayClientService } from '../services/gateway-client.service';

/**
 * WARNING: User management tools are exposed for development and testing purposes only.
 *
 * SECURITY CONSIDERATION:
 * These tools should be removed or heavily restricted in production environments for security reasons:
 * - User creation/deletion capabilities could be misused
 * - Personal data access may violate privacy regulations
 * - Administrative functions should require proper authentication and authorization
 *
 * TODO: Consider removing these tools in production or implementing proper access controls
 */
export class UserTools {
  constructor(private gatewayClient: GatewayClientService) {}

  getTools(): Tool[] {
    return [
      {
        name: 'create_user',
        description: 'Create a new user account (DEV/TEST ONLY - Consider removing in production for security)',
        inputSchema: {
          type: 'object',
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address (must be unique)'
            },
            firstName: {
              type: 'string',
              description: 'User first name (optional)'
            },
            lastName: {
              type: 'string',
              description: 'User last name (optional)'
            },
            isActive: {
              type: 'boolean',
              description: 'Whether the user account is active (default: true)',
              default: true
            }
          },
          required: ['email']
        }
      },
      {
        name: 'get_user',
        description: 'Get user details by ID (DEV/TEST ONLY - Consider removing in production for security)',
        inputSchema: {
          type: 'object',
          properties: {
            userId: {
              type: 'string',
              description: 'The user ID (MongoDB ObjectId)'
            }
          },
          required: ['userId']
        }
      },
      {
        name: 'get_user_by_email',
        description: 'Get user details by email address (DEV/TEST ONLY - Consider removing in production for security)',
        inputSchema: {
          type: 'object',
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address'
            }
          },
          required: ['email']
        }
      },
      {
        name: 'update_user',
        description: 'Update user information (DEV/TEST ONLY - Consider removing in production for security)',
        inputSchema: {
          type: 'object',
          properties: {
            userId: {
              type: 'string',
              description: 'The user ID to update'
            },
            firstName: {
              type: 'string',
              description: 'Updated first name (optional)'
            },
            lastName: {
              type: 'string',
              description: 'Updated last name (optional)'
            },
            isActive: {
              type: 'boolean',
              description: 'Updated active status (optional)'
            }
          },
          required: ['userId']
        }
      },
      {
        name: 'deactivate_user',
        description: 'Deactivate a user account (DEV/TEST ONLY - Consider removing in production for security)',
        inputSchema: {
          type: 'object',
          properties: {
            userId: {
              type: 'string',
              description: 'The user ID to deactivate'
            }
          },
          required: ['userId']
        }
      },
      {
        name: 'list_users',
        description: 'List all users (DEV/TEST ONLY - Should definitely be removed in production for privacy)',
        inputSchema: {
          type: 'object',
          properties: {
            isActive: {
              type: 'boolean',
              description: 'Filter by active status (optional)'
            }
          }
        }
      },
      {
        name: 'record_user_login',
        description: 'Record a login timestamp for a user',
        inputSchema: {
          type: 'object',
          properties: {
            userId: {
              type: 'string',
              description: 'The user ID that logged in'
            }
          },
          required: ['userId']
        }
      }
    ];
  }

  async handleToolCall(name: string, args: any): Promise<any> {
    try {
      switch (name) {
        case 'create_user':
          return await this.gatewayClient.createUser({
            email: args.email,
            firstName: args.firstName,
            lastName: args.lastName,
            isActive: args.isActive ?? true
          });

        case 'get_user':
          return await this.gatewayClient.getUser(args.userId);

        case 'get_user_by_email':
          return await this.gatewayClient.getUserByEmail(args.email);

        case 'update_user':
          return await this.gatewayClient.updateUser(args.userId, {
            firstName: args.firstName,
            lastName: args.lastName,
            isActive: args.isActive
          });

        case 'deactivate_user':
          return await this.gatewayClient.deactivateUser(args.userId);

        case 'list_users':
          return await this.gatewayClient.getAllUsers();

        case 'record_user_login':
          return await this.gatewayClient.recordUserLogin(args.userId);

        default:
          throw new Error(`Unknown user tool: ${name}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to execute ${name}: ${errorMessage}`);
    }
  }
}