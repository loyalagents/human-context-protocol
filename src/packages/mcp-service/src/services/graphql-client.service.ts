// Import cross-fetch to polyfill fetch and Headers for Node.js < 18
import 'cross-fetch/polyfill';

/**
 * GraphQL Client Service
 *
 * Provides a simple wrapper around graphql-request for making queries
 * and mutations to the GraphQL Gateway with authentication support.
 */
export class GraphQLClientService {
  private client: any;
  private clientPromise: Promise<any>;

  /**
   * Create a GraphQL client with optional authentication
   * @param authHeader - Optional Authorization header value (e.g., "Bearer token")
   */
  constructor(authHeader?: string) {
    const graphqlUrl = process.env.GRAPHQL_GATEWAY_URL || 'http://localhost:4000';
    const serviceToken = process.env.SERVICE_TOKEN;

    // Build headers object
    const headers: Record<string, string> = {};

    // Add service token if available (for internal service-to-service auth)
    if (serviceToken) {
      headers['x-service-token'] = serviceToken;
    }

    // Add user authorization if provided (for user-specific requests)
    if (authHeader) {
      headers['authorization'] = authHeader;
    }

    // Initialize GraphQL client with dynamic import (graphql-request is ESM)
    this.clientPromise = import('graphql-request').then(({ GraphQLClient }) => {
      this.client = new GraphQLClient(graphqlUrl, { headers });
      console.log(`✅ GraphQL Client initialized for ${graphqlUrl}${authHeader ? ' (with auth)' : ''}`);
      return this.client;
    });
  }

  /**
   * Ensure the client is initialized before use
   */
  private async ensureClient() {
    if (!this.client) {
      await this.clientPromise;
    }
    return this.client;
  }

  /**
   * Execute a GraphQL query
   */
  async query(query: string, variables?: Record<string, any>): Promise<any> {
    try {
      const client = await this.ensureClient();
      return await client.request(query, variables);
    } catch (error) {
      console.error('GraphQL Query Error:', error);
      throw error;
    }
  }

  /**
   * Execute a GraphQL mutation
   */
  async mutate(mutation: string, variables?: Record<string, any>): Promise<any> {
    try {
      const client = await this.ensureClient();
      return await client.request(mutation, variables);
    } catch (error) {
      console.error('GraphQL Mutation Error:', error);
      throw error;
    }
  }

  /**
   * Get the GraphQL schema via introspection
   */
  async getSchema(): Promise<any> {
    const introspectionQuery = `
      query IntrospectionQuery {
        __schema {
          queryType {
            name
            fields {
              name
              description
              args {
                name
                type {
                  name
                  kind
                }
              }
            }
          }
          mutationType {
            name
            fields {
              name
              description
              args {
                name
                type {
                  name
                  kind
                }
              }
            }
          }
          types {
            name
            kind
            description
            fields {
              name
              description
              type {
                name
                kind
              }
            }
          }
        }
      }
    `;

    try {
      const client = await this.ensureClient();
      return await client.request(introspectionQuery);
    } catch (error) {
      console.error('GraphQL Schema Introspection Error:', error);
      throw error;
    }
  }
}
