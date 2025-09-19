import type { Tool } from '@modelcontextprotocol/sdk/types.js' with { "resolution-mode": "import" };
import { GatewayClientService } from '../services/gateway-client.service';

export class PreferenceTools {
  constructor(private gatewayClient: GatewayClientService) {}

  getTools(): Tool[] {
    return [
      {
        name: 'get_user_preferences',
        description: 'Get all preferences for a specific user',
        inputSchema: {
          type: 'object',
          properties: {
            userId: {
              type: 'string',
              description: 'The user ID to get preferences for'
            }
          },
          required: ['userId']
        }
      },
      {
        name: 'get_preference',
        description: 'Get a specific preference value for a user',
        inputSchema: {
          type: 'object',
          properties: {
            userId: {
              type: 'string',
              description: 'The user ID'
            },
            key: {
              type: 'string',
              description: 'The preference key to retrieve'
            }
          },
          required: ['userId', 'key']
        }
      },
      {
        name: 'set_preference',
        description: 'Set or update a preference for a user',
        inputSchema: {
          type: 'object',
          properties: {
            userId: {
              type: 'string',
              description: 'The user ID'
            },
            key: {
              type: 'string',
              description: 'The preference key'
            },
            value: {
              description: 'The preference value (can be string, number, boolean, or object)'
            },
            type: {
              type: 'string',
              enum: ['string', 'number', 'boolean', 'object'],
              description: 'The type of the preference value'
            }
          },
          required: ['userId', 'key', 'value', 'type']
        }
      },
      {
        name: 'update_preference',
        description: 'Update an existing preference for a user',
        inputSchema: {
          type: 'object',
          properties: {
            userId: {
              type: 'string',
              description: 'The user ID'
            },
            key: {
              type: 'string',
              description: 'The preference key to update'
            },
            value: {
              description: 'The new preference value'
            },
            type: {
              type: 'string',
              enum: ['string', 'number', 'boolean', 'object'],
              description: 'The type of the preference value (optional)'
            }
          },
          required: ['userId', 'key', 'value']
        }
      },
      {
        name: 'delete_preference',
        description: 'Delete a preference for a user',
        inputSchema: {
          type: 'object',
          properties: {
            userId: {
              type: 'string',
              description: 'The user ID'
            },
            key: {
              type: 'string',
              description: 'The preference key to delete'
            }
          },
          required: ['userId', 'key']
        }
      },
      {
        name: 'list_preference_keys',
        description: 'List all preference keys for a user (returns just the keys)',
        inputSchema: {
          type: 'object',
          properties: {
            userId: {
              type: 'string',
              description: 'The user ID to list preference keys for'
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
        case 'get_user_preferences':
          return await this.gatewayClient.getUserPreferences(args.userId);

        case 'get_preference':
          return await this.gatewayClient.getPreference(args.userId, args.key);

        case 'set_preference':
          return await this.gatewayClient.createPreference({
            userId: args.userId,
            key: args.key,
            value: args.value,
            type: args.type
          });

        case 'update_preference':
          return await this.gatewayClient.updatePreference(args.userId, args.key, {
            value: args.value,
            type: args.type
          });

        case 'delete_preference':
          await this.gatewayClient.deletePreference(args.userId, args.key);
          return { success: true, message: `Preference '${args.key}' deleted for user ${args.userId}` };

        case 'list_preference_keys':
          const preferences = await this.gatewayClient.getUserPreferences(args.userId);
          return {
            userId: args.userId,
            keys: preferences.map(pref => pref.key),
            count: preferences.length
          };

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to execute ${name}: ${errorMessage}`);
    }
  }
}
