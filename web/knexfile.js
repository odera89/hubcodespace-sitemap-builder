import dotenv from "dotenv";

dotenv.config({ path: "../.env" });

// Update with your config settings.

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */

const knexfile = {
  development: {
    client: "pg",
    connection: {
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      port: 5432,
      host: process.env.DB_HOST,
    },
    migrations: {
      directory: "./data/migrations",
    },
    seeds: { directory: "./data/seeds" },
    ssl: { rejectUnauthorized: false },
  },

  production: {
    client: "pg",
    connection: {
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
    },
    migrations: {
      directory: "./data/migrations",
    },
    seeds: { directory: "./data/seeds" },
  },
};

export default knexfile;
