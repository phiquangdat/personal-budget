const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const bodyParser = require("body-parser");

let envelopes = [];

app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.get("/envelopes", (req, res) => {
  res.json(envelopes);
});

app.get("/envelopes/:id", (req, res) => {
  const id = Number(req.params.id);
  const envelope = envelopes.find((envelope) => {
    return envelope.id === id;
  });
  if (!envelope) {
    return res.status(404).json({ error: "Envelope not found" });
  }
  res.status(200).json(envelope);
});

app.post("/envelopes", (req, res) => {
  const { name, amount } = req.body;
  if (!name || !amount) {
    return res.status(400).json({ error: "Name and amount are required" });
  }
  const envelope = { id: envelopes.length + 1, name, amount };
  envelopes.push(envelope);
  res.status(201).json(envelope);
});

app.post("/envelopes/:id", (req, res) => {
  const id = Number(req.params.id);
  const envelope = envelopes.find((envelope) => envelope.id === id);
  const { name, amount } = req.body;
  if (!envelope) {
    return res.status(404).json({ error: "Envelope not found" });
  }
  if (!amount || !name) {
    return res.status(404).json({ error: "Amount or name is not found" });
  }
  if (envelope.amount < amount) {
    return res.status(404).json({ error: "Insufficient amount" });
  }
  envelope.name = name;
  envelope.amount -= amount;
  res.status(200).json(envelope);
});

app.post("/envelopes/transfer/:from/:to", (req, res) => {
  const fromId = Number(req.params.from);
  const toId = Number(req.params.to);
  const { amount } = req.body;
  if (typeof amount !== "number" || amount <= 0) {
    return res
      .status(400)
      .json({ error: "A positive amount is required to transfer." });
  }
  const envelopeFrom = envelopes.find((envelope) => envelope.id === fromId);
  const envelopeTo = envelopes.find((envelope) => envelope.id === toId);
  if (!envelopeFrom || !envelopeTo) {
    return res.status(404).json({ error: "Envelope(s) not found" });
  }
  if (envelopeFrom.amount < amount) {
    return res
      .status(400)
      .json({ error: "Insufficient funds in source envelope." });
  }
  envelopeFrom.amount -= amount;
  envelopeTo.amount += amount;
  res.status(200).json({ from: envelopeFrom, to: envelopeTo });
});

app.delete("/envelopes/:id", (req, res) => {
  const id = Number(req.params.id);
  const found = envelopes.some((envelope) => envelope.id === id);
  if (!found) {
    return res.status(404).json({ error: "Envelope not found" });
  }
  envelopes = envelopes.filter((envelope) => envelope.id !== id);
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
