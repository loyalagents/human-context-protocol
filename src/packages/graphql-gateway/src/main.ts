#!/usr/bin/env node

import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import * as dotenv from 'dotenv';
import { typeDefs } from './schema/typeDefs';
import { createUserResolvers } from './resolvers/user.resolvers';
import { createPreferenceResolvers } from './resolvers/preference.resolvers';
import { locationResolvers } from './resolvers/location.resolvers';
import { UserServiceClient } from './services/user-service.client';
import { PreferenceServiceClient } from './services/preference-service.client';
import { GraphQLJSON } from 'graphql-type-json';

// Load environment variables
dotenv.config();

async function startGateway() {
  console.log('🚀 Starting GraphQL Gateway...');
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);

  // Initialize service clients
  const userService = new UserServiceClient(
    process.env.USER_SERVICE_URL || 'http://localhost:3003'
  );
  const preferenceService = new PreferenceServiceClient(
    process.env.PREFERENCE_SERVICE_URL || 'http://localhost:3001'
  );

  console.log(`🔗 User Service: ${process.env.USER_SERVICE_URL || 'http://localhost:3003'}`);
  console.log(`🔗 Preference Service: ${process.env.PREFERENCE_SERVICE_URL || 'http://localhost:3001'}`);
  console.log(`🔗 REST Gateway (Locations): ${process.env.REST_GATEWAY_URL || 'http://localhost:3000'}`);

  // Create resolvers with service clients
  const userResolvers = createUserResolvers({ userService, preferenceService });
  const preferenceResolvers = createPreferenceResolvers({ preferenceService });

  const resolvers = {
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

  // Create Apollo Server
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    introspection: true, // Enable introspection for development
    includeStacktraceInErrorResponses: process.env.NODE_ENV === 'development',
  });

  // Start standalone server
  const { url } = await startStandaloneServer(server, {
    listen: { port: parseInt(process.env.PORT || '4000') },
    context: async ({ req }) => {
      // Extract authorization header for pass-through to REST Gateway
      const authHeader = req.headers.authorization;

      // Validate service token (internal use only)
      const serviceToken = req.headers['x-service-token'] as string;
      if (serviceToken && serviceToken !== process.env.SERVICE_TOKEN) {
        throw new Error('Unauthorized - invalid service token');
      }

      return {
        authHeader,
        serviceToken,
      };
    },
  });

  console.log(`✅ GraphQL Gateway ready at ${url}`);
  console.log(`📖 Open ${url} in your browser to explore the schema (Apollo Sandbox)`);
  console.log(`🎯 Architecture: Schema Stitching with REST backend services`);
  console.log(`   - User & Preference data: Delegated to microservices`);
  console.log(`   - Location data: Delegated to REST gateway`);
}

// Start the server
startGateway().catch((error) => {
  console.error('❌ Failed to start GraphQL Gateway:', error);
  process.exit(1);
});
