import mongoose from "mongoose";

/**
 * Student Schema
 *
 * Represents a student enrolled in the school. Roll numbers are
 * unique per class+section combination — enforced at the DB level
 * via a compound index.
 */
const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Student name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },

    rollNumber: {
      type: String,
      required: [true, "Roll number is required"],
      trim: true,
    },

    class: {
      type: String,
      required: [true, "Class is required"],
      trim: true,
      // e.g. "1", "2", … "12", or "Nursery", "KG"
    },

    section: {
      type: String,
      required: [true, "Section is required"],
      trim: true,
      uppercase: true,
      maxlength: [5, "Section cannot exceed 5 characters"],
    },

    parentName: {
      type: String,
      required: [true, "Parent/Guardian name is required"],
      trim: true,
      maxlength: [100, "Parent name cannot exceed 100 characters"],
    },

    contactNumber: {
      type: String,
      required: [true, "Contact number is required"],
      trim: true,
      match: [/^\+?[\d\s\-().]{7,20}$/, "Please enter a valid contact number"],
    },

    address: {
      type: String,
      trim: true,
      maxlength: [300, "Address cannot exceed 300 characters"],
    },

    admissionDate: {
      type: Date,
      required: [true, "Admission date is required"],
      default: Date.now,
    },

    isActive: {
      type: Boolean,
      default: true, // soft-delete / TC flag
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt automatically
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ── Indexes ──────────────────────────────────────────────────────────────────

// Roll number must be unique within the same class-section combination
studentSchema.index({ rollNumber: 1, class: 1, section: 1 }, { unique: true });

// Frequently filtered fields
studentSchema.index({ class: 1, section: 1 });
studentSchema.index({ isActive: 1 });

// ── Virtuals ─────────────────────────────────────────────────────────────────

studentSchema.virtual("fullClassLabel").get(function () {
  return `Class ${this.class} - ${this.section}`;
});

// ── Model ─────────────────────────────────────────────────────────────────────

const Student = mongoose.model("Student", studentSchema);

export default Student;
