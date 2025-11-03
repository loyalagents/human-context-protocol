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
1. Call query_schema to discover available queries, arguments, and types
2. Construct your GraphQL query
3. Execute via this tool

API DOMAINS (use query_schema for full details):
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
        description: `Execute GraphQL mutations to modify user context data.

WORKFLOW:
1. Call query_schema to discover mutations, arguments, and enum values
2. Construct your mutation following GraphQL syntax
3. Execute via this tool

GRAPHQL SYNTAX RULES:
- Enums are unquoted identifiers: locationType: home NOT "home" or "HOME"
- Required fields marked with !: userId: ID! means required
- Non-null lists [Type!]! cannot be empty or contain nulls
- Input objects use braces: coordinates: { lat: 40.7, lng: -74.0 }
- Always request return fields you need

API DOMAINS (use query_schema for full details):
- users: Create, update, deactivate, delete users
- preferences: Manage user preferences (key-value with categories)
- locations: System locations (home/work/gym/school) and custom locations
- food_preferences: Default and location-specific food preferences

EXAMPLE MUTATION PATTERN:
mutation {
  createSystemLocation(
    userId: "123"
    locationType: home  # ← enum, no quotes (use query_schema to get valid values)
    address: "123 Main St"
    coordinates: { lat: 40.7, lng: -74.0 }
  ) {
    key
    address
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
        name: 'query_schema',
        description: `Query the schema structure dynamically using introspection.

Discover types, enums, mutations, queries, and fields without fetching the entire schema.
This tool is protocol-agnostic and works with any schema system that supports introspection.

COMMON INTROSPECTION PATTERNS:
- List all types: __schema { types { name kind } }
- Get enum values: __type(name: "EnumName") { enumValues { name description } }
- Get mutation details: __type(name: "Mutation") { fields { name description args { name type { name kind ofType { name kind } } } } }
- Get type fields: __type(name: "TypeName") { fields { name description type { name kind } } }

EXAMPLES:
1. Find all enums:
   query { __schema { types(kind: ENUM) { name } } }

2. Get FoodCategory values:
   query { __type(name: "FoodCategory") { enumValues { name description } } }

3. Get mutation signature for updateDefaultFoodPreference:
   query {
     __type(name: "Mutation") {
       fields {
         name
         description
         args {
           name
           description
           type {
             name
             kind
             ofType { name kind }
           }
         }
       }
     }
   }

4. Explore available mutations:
   query { __type(name: "Mutation") { fields { name description } } }

RESTRICTIONS:
- Only introspection queries (__schema, __type) are allowed
- Cannot execute mutations or data queries via this tool
- Maximum query size: 5000 characters

WHEN TO USE:
- First call: Discover available types and operations
- Before mutations: Get enum values and mutation signatures
- During development: Explore schema structure incrementally`,
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Introspection query using __schema or __type syntax',
            },
          },
          required: ['query'],
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
      case 'query_schema':
        return await this.querySchema(args);
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

  private async querySchema(args: { query: string }) {
    try {
      // Validate that the query is introspection-only
      this.validateIntrospectionQuery(args.query);

      // Execute the introspection query
      const result = await this.graphqlClient.query(args.query);

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
            text: `Error executing schema query: ${error.message || 'Unknown error'}`,
          },
        ],
        isError: true,
      };
    }
  }

  /**
   * Validates that a query is an introspection query only
   * Prevents execution of mutations or data queries through this tool
   */
  private validateIntrospectionQuery(query: string): void {
    // Check if query contains introspection keywords
    const hasIntrospection = query.includes('__schema') || query.includes('__type');
    if (!hasIntrospection) {
      throw new Error('Query must be an introspection query using __schema or __type');
    }

    // Prevent mutations
    const hasMutation = /mutation\s*{/i.test(query);
    if (hasMutation) {
      throw new Error('Mutations are not allowed in schema queries. Use mutate_user_context instead');
    }

    // Prevent data queries (queries that don't use introspection)
    // This regex looks for query patterns that query actual data, not schema
    const hasDataQuery = /query\s*{\s*[a-z]/i.test(query) && !hasIntrospection;
    if (hasDataQuery) {
      throw new Error('Data queries are not allowed in schema queries. Use query_user_context instead');
    }

    // Size limit to prevent abuse
    if (query.length > 5000) {
      throw new Error('Query too large (maximum 5000 characters)');
    }
  }
}
