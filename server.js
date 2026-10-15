// Entry point: connects to MongoDB, then starts the Express server
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const rateLimit = require("express-rate-limit");

const contactRoutes = require("./routes/contact");
const projectRoutes = require("./routes/projects");
const adminRoutes = require("./routes/admin");

// The dashboard needs these two settings. Stop early with a clear message if they are missing.
if (!process.env.ADMIN_PASSWORD || !process.env.TOKEN_SECRET) {
  console.error("Missing ADMIN_PASSWORD or TOKEN_SECRET in .env (see .env.example).");
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;

// Allow the portfolio page (Live Server runs on port 5500) to call this API
app.use(cors({ origin: (process.env.CLIENT_ORIGIN || "http://127.0.0.1:5500").split(",") }));
app.use(express.json({ limit: "10kb" }));

// Basic spam protection: max 10 contact messages per 15 minutes per visitor
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: "Too many messages. Please try again later." },
});

app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.use("/api/contact", contactLimiter, contactRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/admin", adminRoutes);

// Unknown routes
app.use((req, res) => res.status(404).json({ error: "Not found" }));

// Any unexpected error ends up here
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Something went wrong on the server." });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => console.log(`API running at http://localhost:${PORT}`));
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  });