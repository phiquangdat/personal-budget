require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Create envelopes table if it doesn't exist
const createTableQuery = `
CREATE TABLE IF NOT EXISTS envelopes (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  amount NUMERIC NOT NULL
);`;

pool
  .query(createTableQuery)
  .then(() => console.log("Envelopes table is ready."))
  .catch((err) => console.error("Error creating envelopes table:", err));

module.exports = pool;
