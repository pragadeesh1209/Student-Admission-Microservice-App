// ============================================================
// ELIGIBILITY VALIDATOR SERVICE (Port 4000)
// Pure validation microservice — does NOT connect to MongoDB
// Provides eligibility checking via the Reason Engine
// ============================================================

const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// ------------------------------------------------------------
// Helper: Calculate age from Date of Birth
// Returns the precise age in whole years
// ------------------------------------------------------------
function calculateAge(dobString) {
  const dob = new Date(dobString);
  const today = new Date();

  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();

  // Adjust age if birthday hasn't occurred yet this year
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }

  return age;
}

// ------------------------------------------------------------
// POST /check-eligibility
// Eligibility Reason Engine — validates student data and
// returns clear reasons for approval or rejection.
// This is SIMULATION MODE — no data is saved to any database.
// ------------------------------------------------------------
app.post("/check-eligibility", (req, res) => {
  const { name, dob, mobile } = req.body;

  // Array to collect all rejection reasons
  const rejectionReasons = [];

  // Rule 1: Name must not be empty
  if (!name || name.trim() === "") {
    rejectionReasons.push("Student name is required");
  }

  // Rule 2: DOB must be a valid past date
  const dobDate = new Date(dob);
  const isValidDob = dob && !isNaN(dobDate.getTime()) && dobDate < new Date();

  if (!dob || !isValidDob) {
    rejectionReasons.push("Date of Birth must be a valid past date");
  }

  // Rule 3: Age must be between 18 and 35 (only check if DOB is valid)
  let calculatedAge = null;
  if (isValidDob) {
    calculatedAge = calculateAge(dob);

    if (calculatedAge < 18) {
      rejectionReasons.push("Age is below minimum requirement (must be at least 18)");
    } else if (calculatedAge > 35) {
      rejectionReasons.push("Age exceeds maximum limit (must be 35 or below)");
    }
  }

  // Rule 4: Parent mobile number must be exactly 10 digits
  if (!mobile || !/^\d{10}$/.test(mobile)) {
    rejectionReasons.push("Parent mobile number must be exactly 10 digits");
  }

  // Determine eligibility status
  const eligibilityStatus = rejectionReasons.length === 0 ? "Eligible" : "Not Eligible";

  // Send structured response
  res.json({
    eligibilityStatus,
    calculatedAge,
    rejectionReasons,
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "Eligibility Validator", port: PORT });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Eligibility Validator Service running on port ${PORT}`);
});