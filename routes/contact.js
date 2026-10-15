const express = require("express");
const Message = require("../models/message");

const router = express.Router();

// POST /api/contact: save a message from the contact form
router.post("/", async (req, res, next) => {
  try {
    const { name, email, message } = req.body;
    const saved = await Message.create({ name, email, message });
    res.status(201).json({ success: true, id: saved._id });
  } catch (error) {
    // Mongoose validation problems are the visitor's mistake, not a server crash
    if (error.name === "ValidationError") {
      const details = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ error: "Please check your input.", details });
    }
    next(error);
  }
});

module.exports = router;