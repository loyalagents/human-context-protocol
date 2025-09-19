export default () => ({
  port: Number.parseInt(process.env.PORT ?? '', 10) || 3004,
  nodeEnv: process.env.NODE_ENV || 'development',
  github: {
    token: process.env.GITHUB_TOKEN,
  },
});
