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

USER MUTATIONS:
- createUser(email: String!, firstName: String, lastName: String, isActive: Boolean): Create a new user
- updateUser(id: ID!, firstName: String, lastName: String, isActive: Boolean): Update user details
- deactivateUser(id: ID!): Deactivate a user
- deleteUser(id: ID!): Delete a user
- recordUserLogin(id: ID!): Record user login

PREFERENCE MUTATIONS:
- createPreference(userId: ID!, key: String!, data: JSON!, category: String): Create preference
  * data is JSON type - can be any value (string, number, boolean, object, array)
- updatePreference(userId: ID!, key: String!, data: JSON!): Update preference
- deletePreference(userId: ID!, key: String!): Delete preference

LOCATION MUTATIONS:
- createSystemLocation(userId: ID!, locationType: SystemLocationType!, address: String!, coordinates: CoordinatesInput!, nickname: String, notes: String): Add system location (home, work, etc.)
  * locationType: SystemLocationType enum (use WITHOUT quotes). Valid values:
    - home (user's primary residence)
    - work (user's workplace)
    - gym (fitness/gym location)
    - school (educational institution)
  * nickname: Optional display name (defaults based on type if not provided)
  * CRITICAL: Use enum values WITHOUT quotes, e.g., locationType: home NOT locationType: "home"
  * Example: createSystemLocation(userId: "123", locationType: home, address: "123 Main St", coordinates: {lat: 40.7, lng: -74.0}, nickname: "My Home")

- createCustomLocation(userId: ID!, locationName: String!, address: String!, coordinates: CoordinatesInput!, nickname: String!, category: LocationCategory!, features: [LocationFeature!]!, notes: String): Add custom location
  * locationName: Unique identifier slug (e.g., "moms_house", "office_downtown")
  * nickname: Display name shown to user (e.g., "Mom's House", "Downtown Office")
  * category: LocationCategory enum (use WITHOUT quotes). Valid values:
    - residence (residential locations)
    - workplace (work-related locations)
    - fitness (fitness/gym locations)
    - education (educational locations)
    - social (social/entertainment venues)
    - travel (travel destinations)
    - other (other location types)
  * features: REQUIRED array with at least one LocationFeature enum value. Valid enum values (use WITHOUT quotes):
    - food_preferences (location has food preference settings)
    - delivery_support (location supports delivery)
    - scheduling (location has scheduling features)
    - budget_tracking (location has budget tracking)
    - restaurant_favorites (location has restaurant favorites)
    - quick_access (location is marked for quick access)
  * CRITICAL: features cannot be empty! Must include at least one enum value
  * CRITICAL: All enum values must be used WITHOUT quotes
  * Example: createCustomLocation(userId: "123", locationName: "moms_house", address: "456 Oak Ave", coordinates: {lat: 40.7, lng: -74.0}, nickname: "Mom's House", category: residence, features: [food_preferences, delivery_support])

- updateLocation(userId: ID!, locationKey: String!, address: String, coordinates: CoordinatesInput, nickname: String, notes: String): Update location
- deleteLocation(userId: ID!, locationKey: String!): Remove location
- markLocationAsUsed(userId: ID!, locationKey: String!): Mark location as recently used

FOOD PREFERENCE MUTATIONS:
- setDefaultFoodPreferences(userId: ID!, preferences: [FoodPreferenceInput!]!): Set default food preferences
- updateDefaultFoodPreference(userId: ID!, category: String!, level: FoodPreferenceLevel!): Update single default preference
- setLocationFoodPreferences(userId: ID!, locationKey: String!, preferences: [FoodPreferenceInput!]!): Set location-specific food preferences
- updateLocationFoodPreference(userId: ID!, locationKey: String!, category: String!, level: FoodPreferenceLevel!): Update single location preference
- deleteLocationFoodPreferences(userId: ID!, locationKey: String!): Remove all food preferences for a location

ENUMS (all enum values must be used WITHOUT quotes):
- SystemLocationType: home | work | gym | school
- LocationCategory: residence | workplace | fitness | education | social | travel | other
- LocationFeature: food_preferences | delivery_support | scheduling | budget_tracking | restaurant_favorites | quick_access
- FoodPreferenceLevel: love | like | neutral | dislike | hate

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

3. Add a system location (home):
mutation {
  createSystemLocation(
    userId: "USER_ID"
    locationType: "home"
    address: "123 Main St, City, State 12345"
    coordinates: { lat: 40.7128, lng: -74.0060 }
    nickname: "My Home"
  ) {
    key
    nickname
    address
  }
}

4. Add a custom location with features (CORRECT - enum values without quotes):
mutation {
  createCustomLocation(
    userId: "USER_ID"
    locationName: "moms_house"
    address: "456 Oak Ave, City, State 12345"
    coordinates: { lat: 40.7128, lng: -74.0060 }
    nickname: "Mom's House"
    category: "residence"
    features: [food_preferences, delivery_support]
  ) {
    key
    nickname
    address
  }
}

5. Set food preferences:
mutation {
  setDefaultFoodPreferences(
    userId: "USER_ID"
    preferences: [
      { category: "italian", level: love }
      { category: "chinese", level: like }
    ]
  ) {
    category
    level
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
