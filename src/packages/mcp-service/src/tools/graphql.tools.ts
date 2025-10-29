import { GraphQLClientService } from '../services/graphql-client.service';

/**
 * GraphQL Tools
 *
 * Provides 3 flexible GraphQL tools that replace the previous 31 REST-based tools.
 * Accepts an authenticated GraphQL client to enable per-request authentication.
 */
export class GraphQLTools {
  constructor(private graphqlClient: GraphQLClientService) {}

  getTools() {
    return [
      {
        name: 'query_user_context',
        description: `Execute a GraphQL query to fetch user context data from the system.

This tool provides flexible access to user data, preferences, locations, and related information through GraphQL queries. You can query for specific fields and nested relationships.

Available queries include:
- user(id: ID!): Get user by ID with optional nested preferences/locations
- userByEmail(email: String!): Get user by email
- users(isActive: Boolean): List all users
- preferences(userId: ID!, category: String): Get user preferences
- locations(userId: ID!, type: String): Get user locations
- availableSystemLocations: Get all available system locations

Example queries:
1. Get user with preferences and locations:
{
  user(id: "USER_ID") {
    email
    firstName
    preferences { key data category }
    locations { nickname address }
  }
}

2. Get user preferences by category:
{
  preferences(userId: "USER_ID", category: "food") {
    key
    data
  }
}

3. Get available system locations:
{
  availableSystemLocations {
    type
    label
  }
}`,
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'The GraphQL query to execute (in GraphQL query language syntax)',
            },
            variables: {
              type: 'object',
              description: 'Optional variables for the GraphQL query',
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'mutate_user_context',
        description: `Execute a GraphQL mutation to create, update, or delete user context data.

This tool provides flexible access to modify user data, preferences, locations, and related information through GraphQL mutations.

Available mutations include:
- createUser(email, firstName, lastName, isActive): Create a new user
- updateUser(id, firstName, lastName, isActive): Update user details
- deactivateUser(id): Deactivate a user
- deleteUser(id): Delete a user
- createPreference(userId, key, data, category): Create preference
- updatePreference(userId, key, data): Update preference
- deletePreference(userId, key): Delete preference
- addSystemLocation(userId, locationType): Add system location
- addCustomLocation(userId, nickname, address, coordinates): Add custom location
- updateLocationNickname(userId, key, nickname): Update location nickname
- removeLocation(userId, key): Remove location
- addFoodPreference(userId, name, category, ...): Add food preference
- updateFoodPreference(locationKey, foodPreferenceKey, ...): Update food preference
- removeFoodPreference(locationKey, foodPreferenceKey): Remove food preference

Example mutations:
1. Create a new user:
mutation {
  createUser(email: "user@example.com", firstName: "John", lastName: "Doe") {
    id
    email
  }
}

2. Add a preference:
mutation {
  createPreference(userId: "USER_ID", key: "theme", data: "dark", category: "ui") {
    id
    key
    data
  }
}

3. Add a custom location:
mutation {
  addCustomLocation(
    userId: "USER_ID"
    nickname: "Home"
    address: "123 Main St"
    coordinates: { lat: 40.7128, lng: -74.0060 }
  ) {
    key
    nickname
  }
}`,
        inputSchema: {
          type: 'object',
          properties: {
            mutation: {
              type: 'string',
              description: 'The GraphQL mutation to execute (in GraphQL mutation language syntax)',
            },
            variables: {
              type: 'object',
              description: 'Optional variables for the GraphQL mutation',
            },
          },
          required: ['mutation'],
        },
      },
      {
        name: 'get_schema',
        description: `Get the GraphQL schema to understand all available queries, mutations, and types.

This tool returns the full schema of the GraphQL API, including:
- All available queries and their arguments
- All available mutations and their arguments
- All types and their fields
- Descriptions for all operations

Use this tool to discover what operations are available before executing queries or mutations.`,
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ];
  }

  async handleToolCall(name: string, args: any) {
    switch (name) {
      case 'query_user_context':
        return await this.queryUserContext(args);
      case 'mutate_user_context':
        return await this.mutateUserContext(args);
      case 'get_schema':
        return await this.getSchema();
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }

  private async queryUserContext(args: { query: string; variables?: Record<string, any> }) {
    try {
      const result = await this.graphqlClient.query(args.query, args.variables);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text',
            text: `Error executing GraphQL query: ${error.message || 'Unknown error'}`,
          },
        ],
        isError: true,
      };
    }
  }

  private async mutateUserContext(args: { mutation: string; variables?: Record<string, any> }) {
    try {
      const result = await this.graphqlClient.mutate(args.mutation, args.variables);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text',
            text: `Error executing GraphQL mutation: ${error.message || 'Unknown error'}`,
          },
        ],
        isError: true,
      };
    }
  }

  private async getSchema() {
    try {
      const schema = await this.graphqlClient.getSchema();
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(schema, null, 2),
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text',
            text: `Error fetching GraphQL schema: ${error.message || 'Unknown error'}`,
          },
        ],
        isError: true,
      };
    }
  }
}
