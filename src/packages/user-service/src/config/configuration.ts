export default () => ({
  port: parseInt(process.env.PORT, 10) || 3005,
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/user-service',
  },
  microservice: {
    port: parseInt(process.env.MICROSERVICE_PORT, 10) || 3015,
  },
});