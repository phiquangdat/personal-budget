require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

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

async function getAllEnvelopes() {
  const result = await pool.query("SELECT * FROM envelopes");
  return result.rows;
}

async function getEnvelopeById(id) {
  const result = await pool.query(`SELECT * FROM envelopes WHERE id = $1`, [
    id,
  ]);
  return result.rows;
}

async function createEnvelope(name, amount) {
  try {
    const result = await pool.query(
      `INSERT INTO envelopes(name, amount)
   VALUES($1, $2) RETURNING *`,
      [name, amount]
    );
    return result.rows;
  } catch (err) {
    console.error("Error inserting envelope: ", err);
    throw err;
  }
}

async function updateEnvelope(id, name, amount) {
  try {
    const result = await pool.query(
      `UPDATE envelopes SET name = $1, amount = $1 WHERE id = $3 RETURNING *`,
      [id, name, amount]
    );
    return result.rows;
  } catch (err) {
    console.error("Error updating envelope:", err);
    throw err;
  }
}

async function deleteEnvelope(id) {
  try {
    const result = await pool.query(
      `DELETE FROM envelopes WHERE id = $1 RETURNING *`,
      [id]
    );
    return result.rows;
  } catch (err) {
    console.error("Error deleting envelope: ", err);
    throw err;
  }
}

async function transferEnvelope(fromId, toId, amount) {
  try {
    const result = await pool.query(
      `
      UPDATE envelopes 
      SET amount = CASE
        WHEN id = $1 THEN amount - $3
        WHEN id = $2 THEN amount - $3
        ELSE amount
      END
      WHERE id IN ($1, $2)
      RETURNING *
      `,
      [fromId, toId, amount]
    );
    return result.rows;
  } catch (err) {
    console.error("Error transferring data: ", err);
    throw err;
  }
}

const createTransactionTable = `CREATE TABLE IF NOT EXISTS transactions
(
  id SERIAL PRIMARY KEY,
  envelopes_id SERIAL,
  date DATE NOT NULL,
  amount NUMERIC NOT NULL,
  recipient VARCHAR(255) NOT NULL,
  FOREIGN KEY (envelopes_id) REFERENCES envelopes(id)
)`;

pool
  .query(createTransactionTable)
  .then(() => console.log("Transactions table is ready."))
  .catch((err) => console.error("Error creating transaction table:", err));

async function createTransaction(envelopes_id, date, amount, recipient) {
  try {
    const result = await pool.query(
      `INSERT INTO transactions (envelopes_id, date, amount, recipient)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [envelopes_id, date, amount, recipient]
    );
    return result.rows[0];
  } catch (err) {
    console.error("Error inserting transaction: ", err);
    throw err;
  }
}

async function getAllTransactions() {
  const result = await pool.query("SELECT * FROM transactions");
  return result.rows;
}

async function getTransactionsByEnvelope(envelopes_id) {
  const result = await pool.query(
    "SELECT * FROM transactions WHERE envelopes_id = $1",
    [envelopes_id]
  );
  return result.rows;
}

async function updateTransaction(id, date, amount, recipient) {
  try {
    const result = await pool.query(
      "UPDATE transactions SET date = $1, amount = $2, recipient = $3 WHERE id = $4 RETURNING *",
      [date, amount, recipient, id]
    );
    return result.rows;
  } catch (err) {
    console.error("Error updating transaction: ", err);
    throw err;
  }
}

async function deleteTransaction(id) {
  try {
    const result = await pool.query(
      `DELETE FROM transactions WHERE id = $1 RETURNING *`,
      [id]
    );
    return result.rows;
  } catch (err) {
    console.error("Failed to delete transaction: ", err);
    throw err;
  }
}

module.exports = {
  pool,
  getAllEnvelopes,
  getEnvelopeById,
  createEnvelope,
  updateEnvelope,
  deleteEnvelope,
  transferEnvelope,
  createTransaction,
  getAllTransactions,
  getTransactionsByEnvelope,
};
