// ============================================================
// STUDENT DATABASE SERVICE (Port 5000)
// Handles all MongoDB operations for student admissions
// Provides APIs for saving, fetching, and summarizing students
// ============================================================

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const Student = require("./models/Student");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/admission";

// Middleware
app.use(cors());
app.use(express.json());

// ------------------------------------------------------------
// MongoDB Connection
// Uses environment variable for flexible deployment
// ------------------------------------------------------------
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

// ------------------------------------------------------------
// POST /students
// Save a confirmed student admission to the database
// Only called when the user clicks "Confirm Admission"
// ------------------------------------------------------------
app.post("/students", async (req, res) => {
  try {
    const { name, age, mobile, dob, admissionStatus, eligibilityReasons } = req.body;

    const student = new Student({
      name,
      age,
      mobile,
      dob,
      admissionStatus,
      eligibilityReasons: eligibilityReasons || [],
      admissionDate: new Date(),
    });

    await student.save();

    res.status(201).json({
      message: "Student admission saved successfully",
      student,
    });
  } catch (err) {
    console.error("Save error:", err.message);
    res.status(400).json({
      message: "Failed to save student",
      error: err.message,
    });
  }
});

// ------------------------------------------------------------
// GET /students
// Fetch all students sorted by admission date (newest first)
// ------------------------------------------------------------
app.get("/students", async (req, res) => {
  try {
    const students = await Student.find().sort({ admissionDate: -1 });
    res.json(students);
  } catch (err) {
    console.error("Fetch error:", err.message);
    res.status(500).json({
      message: "Failed to fetch students",
      error: err.message,
    });
  }
});

// ------------------------------------------------------------
// GET /students/summary
// Returns admission statistics for the dashboard
// Counts total, approved, and rejected students
// ------------------------------------------------------------
app.get("/students/summary", async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const approvedStudents = await Student.countDocuments({ admissionStatus: "Approved" });
    const rejectedStudents = await Student.countDocuments({ admissionStatus: "Rejected" });

    res.json({
      totalStudents,
      approvedStudents,
      rejectedStudents,
    });
  } catch (err) {
    console.error("Summary error:", err.message);
    res.status(500).json({
      message: "Failed to fetch summary",
      error: err.message,
    });
  }
});

// ------------------------------------------------------------
// DELETE /students/:id
// Remove a student record from the database by ID
// ------------------------------------------------------------
app.delete("/students/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedStudent = await Student.findByIdAndDelete(id);

    if (!deletedStudent) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json({
      message: "Student record deleted successfully",
      student: deletedStudent,
    });
  } catch (err) {
    console.error("Delete error:", err.message);
    res.status(500).json({
      message: "Failed to delete student",
      error: err.message,
    });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "Student Database Service", port: PORT });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Student Database Service running on port ${PORT}`);
});