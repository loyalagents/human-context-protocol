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
        description: `Execute GraphQL queries to fetch user context data.

WORKFLOW:
1. Call get_schema first to discover available queries, arguments, and types
2. Construct your GraphQL query
3. Execute via this tool

API DOMAINS (call get_schema for full details):
- users: User profiles and authentication
- preferences: User preferences (key-value with categories)
- locations: System and custom locations
- food_preferences: Default and location-specific food preferences

EXAMPLE QUERY PATTERN:
{
  user(id: "123") {
    email
    firstName
    locations {
      key
      nickname
      address
    }
  }
}

INTROSPECTION TIPS:
- See all queries: query { __type(name: "Query") { fields { name args { name type { ... } } } } }
- See type fields: query { __type(name: "User") { fields { name type { ... } } } }`,
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
        description: `Execute GraphQL mutations to modify user context data.

WORKFLOW:
1. Call get_schema first to discover mutations, arguments, and enum values
2. Construct your mutation following GraphQL syntax
3. Execute via this tool

GRAPHQL SYNTAX RULES:
- Enums are unquoted identifiers: locationType: home NOT "home" or "HOME"
- Required fields marked with !: userId: ID! means required
- Non-null lists [Type!]! cannot be empty or contain nulls
- Input objects use braces: coordinates: { lat: 40.7, lng: -74.0 }
- Always request return fields you need

API DOMAINS (call get_schema for full details):
- users: Create, update, deactivate, delete users
- preferences: Manage user preferences (key-value with categories)
- locations: System locations (home/work/gym/school) and custom locations
- food_preferences: Default and location-specific food preferences

EXAMPLE MUTATION PATTERN:
mutation {
  createSystemLocation(
    userId: "123"
    locationType: home  # ← enum, no quotes (see get_schema for valid values)
    address: "123 Main St"
    coordinates: { lat: 40.7, lng: -74.0 }
  ) {
    key
    address
    nickname
  }
}

INTROSPECTION TIPS:
- See all mutations: query { __type(name: "Mutation") { fields { name args { name type { ... } } } } }
- See enum values: query { __type(name: "SystemLocationType") { enumValues { name } } }
- See input types: query { __type(name: "CoordinatesInput") { inputFields { name type { ... } } } }`,
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
        description: `Get the complete GraphQL schema via introspection.

Returns comprehensive schema information including:
- All queries and mutations with their arguments
- All types, enums, and input types
- Enum values for each enum type
- Field types and nullability requirements

ALWAYS call this tool first before executing queries or mutations to discover:
- Available operations and their signatures
- Valid enum values (e.g., SystemLocationType: home, work, gym, school)
- Required vs optional fields
- Input object structures`,
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
