import mongoose from "mongoose";

/**
 * FeeStructure Schema
 *
 * Defines the fee schedule for a specific class + fee-type combination.
 * One class can have multiple fee types (Tuition, Transport, Lab, etc.).
 * These records act as the "price list" from which Bills are generated.
 */

const FEE_TYPES = [
  "Tuition",
  "Transport",
  "Lab",
  "Library",
  "Sports",
  "Hostel",
  "Examination",
  "Miscellaneous",
];

const BILLING_CYCLES = ["Monthly", "Quarterly", "Yearly", "One-Time"];

const feeStructureSchema = new mongoose.Schema(
  {
    className: {
      type: String,
      required: [true, "Class name is required"],
      trim: true,
    },

    feeType: {
      type: String,
      required: [true, "Fee type is required"],
      enum: {
        values: FEE_TYPES,
        message: `Fee type must be one of: ${FEE_TYPES.join(", ")}`,
      },
    },

    amount: {
      type: Number,
      required: [true, "Fee amount is required"],
      min: [0, "Amount cannot be negative"],
    },

    billingCycle: {
      type: String,
      required: [true, "Billing cycle is required"],
      enum: {
        values: BILLING_CYCLES,
        message: `Billing cycle must be one of: ${BILLING_CYCLES.join(", ")}`,
      },
    },

    description: {
      type: String,
      trim: true,
      maxlength: [200, "Description cannot exceed 200 characters"],
    },

    effectiveFrom: {
      type: Date,
      required: [true, "Effective date is required"],
      default: Date.now,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// ── Indexes ──────────────────────────────────────────────────────────────────

// Prevent duplicate fee-type entries for the same class in the same cycle
feeStructureSchema.index(
  { className: 1, feeType: 1, billingCycle: 1 },
  { unique: true }
);

feeStructureSchema.index({ className: 1 });
feeStructureSchema.index({ isActive: 1 });

// ── Statics ───────────────────────────────────────────────────────────────────

/**
 * Get all active fee structures for a given class.
 * Usage: FeeStructure.findByClass("10")
 */
feeStructureSchema.statics.findByClass = function (className) {
  return this.find({ className, isActive: true }).sort({ feeType: 1 });
};

// ── Model ─────────────────────────────────────────────────────────────────────

const FeeStructure = mongoose.model("FeeStructure", feeStructureSchema);

export default FeeStructure;
