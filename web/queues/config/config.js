const redisCredentials = (env, redis_url) => {
  return process.env.REDIS_URL;
}

// const redisCredentials = (env, redis_url) => {
//   return process.env.NODE_ENV === "production"
//     ? 
//     {
//       redis: {
//         family: 6,
//         port: 6379,
//         host: 'hubcode-space-inventory-management-redis.internal',
//         password: 'f759fbc7d',
//       }
//     }
//     : process.env.REDIS_URL;
// }

export {
  redisCredentials
}