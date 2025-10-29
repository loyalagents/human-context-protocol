import { userResolvers } from './user.resolvers';
import { preferenceResolvers } from './preference.resolvers';
import { locationResolvers } from './location.resolvers';
import { GraphQLJSON } from 'graphql-type-json';

export const resolvers = {
  // Custom scalar for JSON
  JSON: GraphQLJSON,

  Query: {
    ...userResolvers.Query,
    ...preferenceResolvers.Query,
    ...locationResolvers.Query,
  },

  Mutation: {
    ...userResolvers.Mutation,
    ...preferenceResolvers.Mutation,
    ...locationResolvers.Mutation,
  },

  // Field resolvers
  User: userResolvers.User,
};
