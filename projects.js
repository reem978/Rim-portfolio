const express = require("express");
const mongoose = require("mongoose");
const Project = require("../models/Project");
const { requireAdmin } = require("../middleware/auth");

const router = express.Router();

// Keep only the fields we allow, and clean them up
function pickProjectFields(body) {
  let technologies = body.technologies;
  if (typeof technologies === "string") technologies = technologies.split(",");
  if (!Array.isArray(technologies)) technologies = [];

  return {
    title: body.title,
    description: body.description,
    technologies: technologies.map((item) => String(item).trim()).filter(Boolean),
    url: typeof body.url === "string" ? body.url.trim() : "",
    order: Number.isFinite(Number(body.order)) ? Number(body.order) : 0,
  };
}

function sendValidationError(error, res, next) {
  if (error.name === "ValidationError") {
    const details = Object.values(error.errors).map((e) => e.message);
    return res.status(400).json({ error: "Please check your input.", details });
  }
  next(error);
}

// GET /api/projects: public, used by the portfolio website
router.get("/", async (req, res, next) => {
  try {
    const projects = await Project.find().sort({ order: 1, createdAt: 1 });
    res.json(projects);
  } catch (error) {
    next(error);
  }
});

// POST /api/projects: add a project (admin only)
router.post("/", requireAdmin, async (req, res, next) => {
  try {
    const project = await Project.create(pickProjectFields(req.body));
    res.status(201).json(project);
  } catch (error) {
    sendValidationError(error, res, next);
  }
});

// PUT /api/projects/:id: update a project (admin only)
router.put("/:id", requireAdmin, async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ error: "Project not found." });
    }
    const project = await Project.findByIdAndUpdate(req.params.id, pickProjectFields(req.body), {
      new: true,
      runValidators: true,
    });
    if (!project) return res.status(404).json({ error: "Project not found." });
    res.json(project);
  } catch (error) {
    sendValidationError(error, res, next);
  }
});

// DELETE /api/projects/:id: remove a project (admin only)
router.delete("/:id", requireAdmin, async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ error: "Project not found." });
    }
    const deleted = await Project.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Project not found." });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

module.exports = router;