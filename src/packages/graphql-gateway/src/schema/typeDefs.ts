import { gql } from 'graphql-tag';

export const typeDefs = gql`
  # Scalar for JSON data (used for preference data and other flexible fields)
  scalar JSON

  # User type
  type User {
    id: ID!
    email: String!
    firstName: String
    lastName: String
    isActive: Boolean!
    lastLoginAt: String
    createdAt: String!
    updatedAt: String!

    # Nested fields - resolved from Preference Service via REST
    preferences(category: String): [Preference!]!
    locations(type: String): [Location!]!
  }

  # Preference type
  type Preference {
    id: ID!
    userId: ID!
    key: String!
    data: JSON!
    locationKey: String
    category: String
    type: String
    createdAt: String!
    updatedAt: String!
  }

  # Location type
  type Location {
    key: String!
    userId: ID!
    type: String!
    address: String!
    coordinates: Coordinates!
    nickname: String
    category: String
    features: [LocationFeature!]
    notes: String
    data: JSON
  }

  # Coordinates type
  type Coordinates {
    lat: Float!
    lng: Float!
  }

  # System location type enum
  enum SystemLocationType {
    home
    work
    gym
    school
  }

  # Location category enum
  enum LocationCategory {
    residence
    workplace
    fitness
    education
    social
    travel
    other
  }

  # Location feature enum
  enum LocationFeature {
    food_preferences
    delivery_support
    scheduling
    budget_tracking
    restaurant_favorites
    quick_access
  }

  # Food preference level enum
  enum FoodPreferenceLevel {
    love
    like
    neutral
    dislike
    hate
  }

  # Food preference type
  type FoodPreference {
    category: String!
    level: FoodPreferenceLevel!
  }

  # Queries
  type Query {
    # User queries
    user(id: ID!): User
    userByEmail(email: String!): User
    users(isActive: Boolean): [User!]!

    # Preference queries
    preferences(userId: ID!, category: String): [Preference!]!
    preference(userId: ID!, key: String!): Preference

    # Location queries
    locations(userId: ID!, type: String): [Location!]!
    location(userId: ID!, key: String!): Location
    availableSystemLocations(userId: ID!): [String!]!

    # Food preference queries
    defaultFoodPreferences(userId: ID!): [FoodPreference!]!
    locationFoodPreferences(userId: ID!, locationKey: String!): [FoodPreference!]!
    effectiveFoodPreferences(userId: ID!, locationKey: String): [FoodPreference!]!
  }

  # Mutations
  type Mutation {
    # User mutations
    createUser(
      email: String!
      firstName: String
      lastName: String
      isActive: Boolean
    ): User!

    updateUser(
      id: ID!
      firstName: String
      lastName: String
      isActive: Boolean
    ): User!

    deactivateUser(id: ID!): User!
    recordUserLogin(id: ID!): User!
    deleteUser(id: ID!): Boolean!

    # Preference mutations
    createPreference(
      userId: ID!
      key: String!
      data: JSON!
      category: String
    ): Preference!

    updatePreference(
      userId: ID!
      key: String!
      data: JSON!
    ): Preference!

    deletePreference(
      userId: ID!
      key: String!
    ): Boolean!

    # Location mutations
    createSystemLocation(
      userId: ID!
      locationType: SystemLocationType!
      address: String!
      coordinates: CoordinatesInput!
      nickname: String
      notes: String
    ): Location!

    createCustomLocation(
      userId: ID!
      locationName: String!
      address: String!
      coordinates: CoordinatesInput!
      nickname: String!
      category: LocationCategory!
      features: [LocationFeature!]!
      notes: String
    ): Location!

    updateLocation(
      userId: ID!
      locationKey: String!
      address: String
      coordinates: CoordinatesInput
      nickname: String
      notes: String
    ): Location!

    deleteLocation(
      userId: ID!
      locationKey: String!
    ): Boolean!

    markLocationAsUsed(
      userId: ID!
      locationKey: String!
    ): Location!

    # Food preference mutations
    setDefaultFoodPreferences(
      userId: ID!
      preferences: [FoodPreferenceInput!]!
    ): [FoodPreference!]!

    updateDefaultFoodPreference(
      userId: ID!
      category: String!
      level: FoodPreferenceLevel!
    ): [FoodPreference!]!

    setLocationFoodPreferences(
      userId: ID!
      locationKey: String!
      preferences: [FoodPreferenceInput!]!
    ): [FoodPreference!]!

    updateLocationFoodPreference(
      userId: ID!
      locationKey: String!
      category: String!
      level: FoodPreferenceLevel!
    ): [FoodPreference!]!

    deleteLocationFoodPreferences(
      userId: ID!
      locationKey: String!
    ): Boolean!
  }

  # Input types
  input CoordinatesInput {
    lat: Float!
    lng: Float!
  }

  input FoodPreferenceInput {
    category: String!
    level: FoodPreferenceLevel!
  }
`;
