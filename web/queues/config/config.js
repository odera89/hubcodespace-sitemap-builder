const redisCredentials = (env, redis_url) => {
  return process.env.REDIS_URL;
};

const redisOptions =
  process?.env?.NODE_ENV === "development"
    ? {}
    : {
        redis: {
          tls: {
            rejectUnauthorized: false,
          },
        },
      };

export { redisCredentials, redisOptions };
