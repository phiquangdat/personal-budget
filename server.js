require("dotenv").config();
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const bodyParser = require("body-parser");
const {
  getAllEnvelopes,
  getEnvelopeById,
  createEnvelope,
  updateEnvelope,
  deleteEnvelope,
  transferEnvelope,
  createTransaction,
  getAllTransactions,
  getTransactionsByEnvelope,
  updateTransaction,
  deleteTransaction,
} = require("./db");

app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.get("/envelopes", async (req, res) => {
  try {
    const envelopes = await getAllEnvelopes();
    res.json(envelopes);
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

app.get("/envelopes/:id", async (req, res) => {
  const id = Number(req.params.id);
  try {
    const envelope = await getEnvelopeById(id);
    if (!envelope) {
      return res.status(404).json({ error: "Envelope not found" });
    }
    res.status(200).json(envelope);
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

app.post("/envelopes", async (req, res) => {
  const { name, amount } = req.body;
  if (!name || !amount) {
    return res.status(400).json({ error: "Name and amount are required" });
  }
  try {
    const envelope = await createEnvelope(name, amount);
    res.status(201).json(envelope);
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

app.post("/envelopes/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { name, amount } = req.body;
  if (!amount || !name) {
    return res.status(404).json({ error: "Amount or name is not found" });
  }
  try {
    const envelope = await updateEnvelope(id, name, amount);
    if (!envelope) {
      return res
        .status(404)
        .json({ error: "Envelope not found or insufficient amount" });
    }
    res.status(200).json(envelope);
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

app.post("/envelopes/transfer/:from/:to", async (req, res) => {
  const fromId = Number(req.params.from);
  const toId = Number(req.params.to);
  const { amount } = req.body;
  if (typeof amount !== "number" || amount <= 0) {
    return res
      .status(400)
      .json({ error: "A positive amount is required to transfer." });
  }
  try {
    const result = await transferEnvelope(fromId, toId, amount);
    if (result.error) {
      return res.status(400).json({ error: result.error });
    }
    res.status(200).json({ message: "Transfer successful" });
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

app.delete("/envelopes/:id", async (req, res) => {
  const id = Number(req.params.id);
  try {
    const envelope = await deleteEnvelope(id);
    if (!envelope) {
      return res.status(404).json({ error: "Envelope not found" });
    }
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

app.post("/envelopes/:id/transactions", async (req, res) => {
  const envelopes_id = Number(req.params.id);
  const date = new Date().toISOString().split("T")[0];
  const { amount, recipient } = req.body;
  try {
    const transaction = await createTransaction(
      envelopes_id,
      date,
      amount,
      recipient
    );
    if (!transaction) {
      return res.status(404).json({ error: "Envelope not found" });
    }
    res.status(201).json(transaction);
  } catch (err) {
    console.error("Failed to create transaction: ", err);
    res.status(500).json({ error: "Database error" });
  }
});

app.get("/transactions", async (req, res) => {
  try {
    const transactions = await getAllTransactions();
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

app.get("/envelopes/:id/transactions", async (req, res) => {
  const envelopes_id = Number(req.params.id);
  try {
    const transactions = await getTransactionsByEnvelope(envelopes_id);
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

app.put("/transactions/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { date, amount, recipient } = req.body;
  try {
    const updated = await updateTransaction(id, date, amount, recipient);
    if (!updated || updated.length === 0) {
      return res.status(404).json({ error: "Transaction not found" });
    }
    res.status(200).json(updated[0]);
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

app.delete("/transactions/:id", async (req, res) => {
  const id = Number(req.params.id);
  try {
    const deleted = await deleteTransaction(id);
    if (!deleted || deleted.length === 0) {
      return res.status(404).json({ error: "Transaction not found" });
    }
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
