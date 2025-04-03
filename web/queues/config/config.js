const redisCredentials = (env, redis_url) => {
  return process.env.NODE_ENV === "production"
    ? {
        redis: {
          family: 6,
          port: 6379,
          host: "fly-hbs-sitemap-builder-redis.upstash.io",
          password: "a7282c2aec0247aaadbd343a8e662bfb",
        },
      }
    : process.env.REDIS_URL;
};

export { redisCredentials };
