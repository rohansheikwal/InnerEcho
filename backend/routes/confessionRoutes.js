const express = require("express");
const router = express.Router();
const Confession = require("../models/Confession");

// CREATE
router.post("/", async (req, res) => {
  try {
    const { text, secretCode } = req.body;

    if (!secretCode || secretCode.length < 4)
      return res.status(400).json({ error: "Secret code must be 4+ characters" });

    if (!req.user)
      return res.status(401).json({ error: "Login required" });

    const confession = await Confession.create({
      text,
      secretCode,
      userId: req.user.id
    });

    res.json(confession);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ ALL
router.get("/", async (req, res) => {
  const confessions = await Confession.find().sort({ createdAt: -1 });
  res.json(confessions);
});

// UPDATE
router.put("/:id", async (req, res) => {
  const { secretCode, text, ownerAuth } = req.body;

  const confession = await Confession.findById(req.params.id);
  if (!confession) return res.status(404).json({ error: "Not found" });

  const isOwner = ownerAuth && req.user && req.user.id === confession.userId;
  if (!isOwner && confession.secretCode !== secretCode)
    return res.status(401).json({ error: "Wrong secret code" });

  confession.text = text;
  await confession.save();

  res.json(confession);
});

// DELETE
router.delete("/:id", async (req, res) => {
  const { secretCode, ownerAuth } = req.body;

  const confession = await Confession.findById(req.params.id);
  if (!confession) return res.status(404).json({ error: "Not found" });

  const isOwner = ownerAuth && req.user && req.user.id === confession.userId;
  if (!isOwner && confession.secretCode !== secretCode)
    return res.status(401).json({ error: "Wrong secret code" });

  await confession.deleteOne();
  res.json({ message: "Deleted successfully" });
});

// REACT
router.post("/:id/react", async (req, res) => {
  const { type } = req.body;

  const confession = await Confession.findById(req.params.id);
  if (!confession) return res.status(404).json({ error: "Not found" });

  if (!["like", "love", "laugh"].includes(type))
    return res.status(400).json({ error: "Invalid reaction type" });

  confession.reactions[type]++;
  await confession.save();

  res.json(confession);
});

// UNREACT (toggle off)
router.delete("/:id/react", async (req, res) => {
  const { type } = req.body;

  const confession = await Confession.findById(req.params.id);
  if (!confession) return res.status(404).json({ error: "Not found" });

  if (!["like", "love", "laugh"].includes(type))
    return res.status(400).json({ error: "Invalid reaction type" });

  confession.reactions[type] = Math.max(0, confession.reactions[type] - 1);
  await confession.save();

  res.json(confession);
});

module.exports = router;
