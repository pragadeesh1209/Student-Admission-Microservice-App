const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Student name is required"],
      trim: true,
    },

    age: {
      type: Number,
      required: [true, "Student age is required"],
    },

    mobile: {
      type: String,
      required: [true, "Parent mobile number is required"],
      match: [/^\d{10}$/, "Mobile number must be exactly 10 digits"],
    },

    dob: {
      type: Date,
      required: [true, "Date of birth is required"],
    },

    admissionStatus: {
      type: String,
      enum: ["Approved", "Rejected"],
      default: "Rejected",
    },

    eligibilityReasons: {
      type: [String],
      default: [],
    },

    admissionDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // createdAt & updatedAt
  }
);

// Index for faster filtering
studentSchema.index({ admissionStatus: 1 });

module.exports = mongoose.model("Student", studentSchema);