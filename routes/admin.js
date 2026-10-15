const express = require("express");
const mongoose = require("mongoose");
const rateLimit = require("express-rate-limit");
const Message = require("../models/message");
const { createToken, passwordMatches, requireAdmin } = require("../middleware/auth");

const router = express.Router();

// Max 5 login attempts per 15 minutes per visitor, to stop password guessing
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: "Too many login attempts. Try again in 15 minutes." },
});

// POST /api/admin/login: check the password and return a token
router.post("/login", loginLimiter, (req, res) => {
  const { password } = req.body;
  if (typeof password !== "string" || !passwordMatches(password)) {
    return res.status(401).json({ error: "Wrong password." });
  }
  res.json({ token: createToken() });
});

// GET /api/admin/messages: contact-form messages, newest first
router.get("/messages", requireAdmin, async (req, res, next) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/admin/messages/:id
router.delete("/messages/:id", requireAdmin, async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ error: "Message not found." });
    }
    const deleted = await Message.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Message not found." });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

module.exports = router;