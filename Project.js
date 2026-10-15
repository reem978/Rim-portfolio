const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, "Title is required"], trim: true, maxlength: 100 },
    description: { type: String, required: [true, "Description is required"], trim: true, maxlength: 500 },
    technologies: { type: [String], default: [] },
    // Leave empty until you have a real link; the website shows a disabled button
    url: {
      type: String,
      default: "",
      trim: true,
      validate: {
        validator: (value) => value === "" || /^https?:\/\/\S+$/i.test(value),
        message: "The link must start with http:// or https://",
      },
    },
    order: { type: Number, default: 0 }, // smaller numbers appear first
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);