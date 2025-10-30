import mongoose from 'mongoose';
import { databaseConfig } from '../config/database.config';

export async function connectDatabase(): Promise<void> {
  try {
    await mongoose.connect(databaseConfig.uri, databaseConfig.options);
    console.log('✅ Connected to MongoDB at', databaseConfig.uri);

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);
    throw error;
  }
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
  console.log('🔌 Disconnected from MongoDB');
}
