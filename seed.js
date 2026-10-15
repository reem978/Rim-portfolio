// Run once with: npm.cmd run seed
// Fills the database with your six projects. Re-running it replaces them.
require("dotenv").config();
const mongoose = require("mongoose");
const Project = require("./models/Project");

// Add a real link in "url" later; do not invent one
const projects = [
  { title: "JavaScript Calculator", description: "A calculator that handles basic operations and shows clear messages for invalid input.", technologies: ["HTML", "CSS", "JavaScript", "ES6 Modules", "Error Handling"], url: "https://reem978.github.io/JavaScript-Calculator/" },
  { title: "Mini Shopping Cart", description: "Add and review items, with the list kept in JavaScript arrays and objects.", technologies: ["JavaScript", "DOM", "Arrays", "Objects"], url: "" },
  { title: "Student Management System", description: "Manage student records: add, view and organize them in the browser.", technologies: ["JavaScript", "Objects", "Arrays", "DOM"], url: "" },
  { title: "Library Management System", description: "Keep track of books and their status using functions and objects.", technologies: ["JavaScript", "Objects", "Functions", "DOM"], url: "" },
].map((project, index) => ({ ...project, order: index }));

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  await Project.deleteMany({});
  await Project.insertMany(projects);
  console.log(`Seeded ${projects.length} projects`);
  await mongoose.disconnect();
}

seed().catch((error) => {
  console.error(error.message);
  process.exit(1);
});