import type { Tool } from '@modelcontextprotocol/sdk/types.js' with { "resolution-mode": "import" };
import { GatewayClientService } from '../services/gateway-client.service';

export class LocationTools {
  constructor(private gatewayClient: GatewayClientService) {}

  getTools(): Tool[] {
    return [
      {
        name: 'get_user_locations',
        description: 'Get all locations for a specific user, with optional filtering by type',
        inputSchema: {
          type: 'object',
          properties: {
            userId: {
              type: 'string',
              description: 'The user ID to get locations for'
            },
            type: {
              type: 'string',
              description: 'Filter by location type: system, custom, or all',
              enum: ['system', 'custom', 'all']
            }
          },
          required: ['userId']
        }
      },
      {
        name: 'get_location',
        description: 'Get a specific location by its key',
        inputSchema: {
          type: 'object',
          properties: {
            userId: {
              type: 'string',
              description: 'The user ID who owns the location'
            },
            locationKey: {
              type: 'string',
              description: 'The location key (e.g., home, work, user_defined.moms_house)'
            }
          },
          required: ['userId', 'locationKey']
        }
      },
      {
        name: 'create_system_location',
        description: 'Create a system location (home, work, gym, school)',
        inputSchema: {
          type: 'object',
          properties: {
            userId: {
              type: 'string',
              description: 'The user ID to create the location for'
            },
            locationType: {
              type: 'string',
              description: 'The type of system location to create',
              enum: ['home', 'work', 'gym', 'school']
            },
            address: {
              type: 'string',
              description: 'The full address of the location'
            },
            coordinates: {
              type: 'object',
              properties: {
                lat: {
                  type: 'number',
                  description: 'Latitude coordinate',
                  minimum: -90,
                  maximum: 90
                },
                lng: {
                  type: 'number',
                  description: 'Longitude coordinate',
                  minimum: -180,
                  maximum: 180
                }
              },
              required: ['lat', 'lng']
            },
            nickname: {
              type: 'string',
              description: 'Optional custom nickname for the location'
            },
            notes: {
              type: 'string',
              description: 'Optional notes about the location'
            }
          },
          required: ['userId', 'locationType', 'address', 'coordinates']
        }
      },
      {
        name: 'create_custom_location',
        description: 'Create a user-defined custom location',
        inputSchema: {
          type: 'object',
          properties: {
            userId: {
              type: 'string',
              description: 'The user ID to create the location for'
            },
            locationName: {
              type: 'string',
              description: 'Unique name for this custom location (e.g., moms_house, vacation_home)'
            },
            address: {
              type: 'string',
              description: 'The full address of the location'
            },
            coordinates: {
              type: 'object',
              properties: {
                lat: {
                  type: 'number',
                  description: 'Latitude coordinate',
                  minimum: -90,
                  maximum: 90
                },
                lng: {
                  type: 'number',
                  description: 'Longitude coordinate',
                  minimum: -180,
                  maximum: 180
                }
              },
              required: ['lat', 'lng']
            },
            nickname: {
              type: 'string',
              description: 'Display name for the location'
            },
            category: {
              type: 'string',
              description: 'Location category',
              enum: ['residence', 'workplace', 'fitness', 'education', 'social', 'travel', 'other']
            },
            features: {
              type: 'array',
              items: {
                type: 'string',
                enum: ['food_preferences', 'delivery_support', 'scheduling', 'budget_tracking', 'restaurant_favorites', 'quick_access']
              },
              description: 'Features available at this location'
            },
            parentCategory: {
              type: 'string',
              description: 'Optional parent category for inheritance',
              enum: ['residence', 'workplace', 'fitness', 'education', 'social', 'travel', 'other']
            },
            notes: {
              type: 'string',
              description: 'Optional notes about the location'
            }
          },
          required: ['userId', 'locationName', 'address', 'coordinates', 'nickname', 'category', 'features']
        }
      },
      {
        name: 'update_location',
        description: 'Update an existing location',
        inputSchema: {
          type: 'object',
          properties: {
            userId: {
              type: 'string',
              description: 'The user ID who owns the location'
            },
            locationKey: {
              type: 'string',
              description: 'The location key to update'
            },
            address: {
              type: 'string',
              description: 'Updated address'
            },
            coordinates: {
              type: 'object',
              properties: {
                lat: {
                  type: 'number',
                  description: 'Updated latitude coordinate',
                  minimum: -90,
                  maximum: 90
                },
                lng: {
                  type: 'number',
                  description: 'Updated longitude coordinate',
                  minimum: -180,
                  maximum: 180
                }
              },
              required: ['lat', 'lng']
            },
            nickname: {
              type: 'string',
              description: 'Updated nickname'
            },
            notes: {
              type: 'string',
              description: 'Updated notes'
            }
          },
          required: ['userId', 'locationKey']
        }
      },
      {
        name: 'delete_location',
        description: 'Delete a location',
        inputSchema: {
          type: 'object',
          properties: {
            userId: {
              type: 'string',
              description: 'The user ID who owns the location'
            },
            locationKey: {
              type: 'string',
              description: 'The location key to delete'
            }
          },
          required: ['userId', 'locationKey']
        }
      },
      {
        name: 'get_available_system_locations',
        description: 'Get system location types that haven\'t been created yet for a user',
        inputSchema: {
          type: 'object',
          properties: {
            userId: {
              type: 'string',
              description: 'The user ID to check available locations for'
            }
          },
          required: ['userId']
        }
      },
      {
        name: 'mark_location_as_used',
        description: 'Mark a location as recently used (updates last used timestamp)',
        inputSchema: {
          type: 'object',
          properties: {
            userId: {
              type: 'string',
              description: 'The user ID who owns the location'
            },
            locationKey: {
              type: 'string',
              description: 'The location key to mark as used'
            }
          },
          required: ['userId', 'locationKey']
        }
      }
    ];
  }

  async handleTool(name: string, args: any): Promise<any> {
    switch (name) {
      case 'get_user_locations':
        return this.getUserLocations(args.userId, args.type);

      case 'get_location':
        return this.getLocation(args.userId, args.locationKey);

      case 'create_system_location':
        return this.createSystemLocation(args);

      case 'create_custom_location':
        return this.createCustomLocation(args);

      case 'update_location':
        return this.updateLocation(args);

      case 'delete_location':
        return this.deleteLocation(args.userId, args.locationKey);

      case 'get_available_system_locations':
        return this.getAvailableSystemLocations(args.userId);

      case 'mark_location_as_used':
        return this.markLocationAsUsed(args.userId, args.locationKey);

      default:
        throw new Error(`Unknown location tool: ${name}`);
    }
  }

  private async getUserLocations(userId: string, type?: string): Promise<any> {
    return await this.gatewayClient.getUserLocations(userId, type);
  }

  private async getLocation(userId: string, locationKey: string): Promise<any> {
    return await this.gatewayClient.getLocation(userId, locationKey);
  }

  private async createSystemLocation(args: any): Promise<any> {
    const { userId, ...createDto } = args;
    return await this.gatewayClient.createSystemLocation(userId, createDto);
  }

  private async createCustomLocation(args: any): Promise<any> {
    const { userId, ...createDto } = args;
    return await this.gatewayClient.createCustomLocation(userId, createDto);
  }

  private async updateLocation(args: any): Promise<any> {
    const { userId, locationKey, ...updateDto } = args;
    return await this.gatewayClient.updateLocation(userId, locationKey, updateDto);
  }

  private async deleteLocation(userId: string, locationKey: string): Promise<any> {
    return await this.gatewayClient.deleteLocation(userId, locationKey);
  }

  private async getAvailableSystemLocations(userId: string): Promise<any> {
    return await this.gatewayClient.getAvailableSystemLocations(userId);
  }

  private async markLocationAsUsed(userId: string, locationKey: string): Promise<any> {
    return await this.gatewayClient.markLocationAsUsed(userId, locationKey);
  }
}