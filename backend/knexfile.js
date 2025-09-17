require("dotenv").config();
const path = require("path");

const {
  DATABASE_URL = "",
  DATABASE_URL_DEVELOPMENT = "postgres://postgres:postgres@127.0.0.1:5433/restaurant_dev",
  DATABASE_URL_TEST = "postgres://postgres:postgres@127.0.0.1:5433/restaurant_test",
  DEBUG,
  PGSSL = "false",
} = process.env;

const ssl = PGSSL === "true" ? { ssl: { rejectUnauthorized: false } } : {};

const common = (connection) => ({
  client: "pg",
  connection: { connectionString: connection, ...ssl },
  pool: { min: 1, max: 10 },
  migrations: { directory: path.join(__dirname, "src", "db", "migrations") },
  seeds: { directory: path.join(__dirname, "src", "db", "seeds") },
  debug: !!DEBUG,
});

module.exports = {
  development: common(DATABASE_URL_DEVELOPMENT),
  test: common(DATABASE_URL_TEST),
  production: common(DATABASE_URL),
};