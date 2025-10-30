#!/usr/bin/env node

import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import * as dotenv from 'dotenv';
import { typeDefs } from './schema/typeDefs';
import { resolvers } from './resolvers';
import { connectDatabase } from './db/connection';

// Load environment variables
dotenv.config();

async function startGateway() {
  console.log('🚀 Starting GraphQL Gateway...');
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);

  // Connect to MongoDB first
  try {
    await connectDatabase();
  } catch (error) {
    console.error('❌ Failed to connect to database, exiting...');
    process.exit(1);
  }

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
  console.log(`🔗 Phase 2: Using direct database access for queries and mutations`);
}

// Start the server
startGateway().catch((error) => {
  console.error('❌ Failed to start GraphQL Gateway:', error);
  process.exit(1);
});
