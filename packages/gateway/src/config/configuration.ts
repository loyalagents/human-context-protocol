export default () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  services: {
    preference: {
      host: process.env.PREFERENCE_SERVICE_HOST || 'localhost',
      port: parseInt(process.env.PREFERENCE_SERVICE_PORT || '3002', 10),
      timeout: 5000,
    },
  },
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    credentials: true,
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  },
});