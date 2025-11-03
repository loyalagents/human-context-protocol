export const databaseConfig = {
  uri: process.env.MONGO_URI || 'mongodb://localhost:27017/personal-context',
  options: {
    // Connection pool settings
    maxPoolSize: 10,
    minPoolSize: 2,

    // Timeout settings
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,

    // Retry settings
    retryWrites: true,
    retryReads: true,
  }
};
