import mongoose from "mongoose";

/**
 * Bill (Transaction) Schema
 *
 * Represents a fee invoice generated for a student.
 * Tracks line items, total, due date, payment status, and a full
 * payment history log — every partial or full payment is appended
 * to `paymentHistory` so receipts can always be reconstructed.
 */

// ── Sub-schemas ───────────────────────────────────────────────────────────────

const lineItemSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: [true, "Line-item description is required"],
      trim: true,
      maxlength: [200, "Description cannot exceed 200 characters"],
    },
    amount: {
      type: Number,
      required: [true, "Line-item amount is required"],
      min: [0, "Amount cannot be negative"],
    },
  },
  { _id: false } // no separate _id for embedded sub-docs
);

const PAYMENT_METHODS = [
  "Cash",
  "UPI",
  "NetBanking",
  "CreditCard",
  "DebitCard",
  "Cheque",
  "DD",            // Demand Draft
  "BankTransfer",
];

const paymentHistorySchema = new mongoose.Schema(
  {
    amountPaid: {
      type: Number,
      required: [true, "Amount paid is required"],
      min: [0.01, "Payment amount must be greater than zero"],
    },
    paymentDate: {
      type: Date,
      required: [true, "Payment date is required"],
      default: Date.now,
    },
    paymentMethod: {
      type: String,
      required: [true, "Payment method is required"],
      enum: {
        values: PAYMENT_METHODS,
        message: `Payment method must be one of: ${PAYMENT_METHODS.join(", ")}`,
      },
    },
    transactionId: {
      type: String,
      trim: true,
      // Optional for Cash; required for digital payments (validated in controller)
    },
    remarks: {
      type: String,
      trim: true,
      maxlength: [300, "Remarks cannot exceed 300 characters"],
    },
    recordedBy: {
      type: String,
      trim: true, // admin / staff who recorded the payment
    },
  },
  { timestamps: true }
);

// ── Bill Statuses ─────────────────────────────────────────────────────────────

const BILL_STATUSES = ["Unpaid", "Partially Paid", "Paid", "Cancelled", "Waived"];

// ── Bill Schema ───────────────────────────────────────────────────────────────

const billSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: [true, "Student reference is required"],
      index: true,
    },

    billNumber: {
      type: String,
      required: [true, "Bill number is required"],
      unique: true,
      trim: true,
      uppercase: true,
      // Recommended format: BILL-YYYYMM-XXXX  e.g. BILL-202406-0001
    },

    // Billing period this invoice covers (optional but useful for monthly cycles)
    billingPeriod: {
      month: { type: Number, min: 1, max: 12 }, // 1 = January
      year:  { type: Number, min: 2000 },
    },

    items: {
      type: [lineItemSchema],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0,
        message: "A bill must have at least one line item",
      },
    },

    totalAmount: {
      type: Number,
      required: [true, "Total amount is required"],
      min: [0, "Total amount cannot be negative"],
    },

    dueDate: {
      type: Date,
      required: [true, "Due date is required"],
    },

    status: {
      type: String,
      enum: {
        values: BILL_STATUSES,
        message: `Status must be one of: ${BILL_STATUSES.join(", ")}`,
      },
      default: "Unpaid",
    },

    paidAmount: {
      type: Number,
      default: 0,
      min: [0, "Paid amount cannot be negative"],
    },

    paymentHistory: {
      type: [paymentHistorySchema],
      default: [],
    },

    discount: {
      type: Number,
      default: 0,
      min: [0, "Discount cannot be negative"],
    },

    fine: {
      type: Number,
      default: 0,
      min: [0, "Fine cannot be negative"],
    },

    notes: {
      type: String,
      trim: true,
      maxlength: [500, "Notes cannot exceed 500 characters"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────

billSchema.index({ status: 1 });
billSchema.index({ dueDate: 1 });
billSchema.index({ studentId: 1, status: 1 });
billSchema.index({ "billingPeriod.year": 1, "billingPeriod.month": 1 });

// ── Virtuals ──────────────────────────────────────────────────────────────────

/** Net payable = total + fine - discount */
billSchema.virtual("netPayable").get(function () {
  return this.totalAmount + (this.fine || 0) - (this.discount || 0);
});

/** Balance remaining on this bill */
billSchema.virtual("balanceDue").get(function () {
  return Math.max(0, this.netPayable - this.paidAmount);
});

/** True when past due date and not fully paid */
billSchema.virtual("isOverdue").get(function () {
  return (
    this.status !== "Paid" &&
    this.status !== "Cancelled" &&
    this.status !== "Waived" &&
    new Date() > this.dueDate
  );
});

// ── Pre-save middleware ───────────────────────────────────────────────────────

/**
 * Automatically derive `status` from `paidAmount` vs `netPayable`
 * so the status field never falls out of sync with actual payments.
 */
billSchema.pre("save", function (next) {
  // Don't override terminal statuses set intentionally
  if (this.status === "Cancelled" || this.status === "Waived") {
    return next();
  }

  const net = this.totalAmount + (this.fine || 0) - (this.discount || 0);

  if (this.paidAmount <= 0) {
    this.status = "Unpaid";
  } else if (this.paidAmount >= net) {
    this.status = "Paid";
  } else {
    this.status = "Partially Paid";
  }

  next();
});

// ── Statics ───────────────────────────────────────────────────────────────────

/**
 * Fetch all unpaid / partially paid bills for a student.
 * Usage: Bill.findPendingByStudent(studentId)
 */
billSchema.statics.findPendingByStudent = function (studentId) {
  return this.find({
    studentId,
    status: { $in: ["Unpaid", "Partially Paid"] },
  }).sort({ dueDate: 1 });
};

// ── Model ─────────────────────────────────────────────────────────────────────

const Bill = mongoose.model("Bill", billSchema);

export default Bill;
