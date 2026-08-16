import { body, param } from "express-validator";

const PAYMENT_METHODS = ["Cash","UPI","NetBanking","CreditCard","DebitCard","Cheque","DD","BankTransfer"];

export const createBillRules = [
  body("studentId")
    .notEmpty().withMessage("Student ID is required")
    .isMongoId().withMessage("studentId must be a valid Mongo ID"),

  body("items")
    .isArray({ min: 1 }).withMessage("At least one line item is required"),

  body("items.*.description")
    .trim()
    .notEmpty().withMessage("Each line item must have a description")
    .isLength({ max: 200 }).withMessage("Line item description cannot exceed 200 characters"),

  body("items.*.amount")
    .notEmpty().withMessage("Each line item must have an amount")
    .isFloat({ min: 0 }).withMessage("Line item amount must be non-negative"),

  body("dueDate")
    .notEmpty().withMessage("Due date is required")
    .isISO8601().withMessage("Due date must be a valid date"),

  body("discount")
    .optional()
    .isFloat({ min: 0 }).withMessage("Discount must be non-negative"),

  body("fine")
    .optional()
    .isFloat({ min: 0 }).withMessage("Fine must be non-negative"),

  body("billingPeriod.month")
    .optional()
    .isInt({ min: 1, max: 12 }).withMessage("Billing period month must be 1-12"),

  body("billingPeriod.year")
    .optional()
    .isInt({ min: 2000 }).withMessage("Billing period year must be 2000 or later"),

  body("notes")
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage("Notes cannot exceed 500 characters"),
];

export const recordPaymentRules = [
  param("id").isMongoId().withMessage("Invalid bill ID"),

  body("amountPaid")
    .notEmpty().withMessage("Payment amount is required")
    .isFloat({ min: 0.01 }).withMessage("Payment amount must be greater than zero"),

  body("paymentMethod")
    .trim()
    .notEmpty().withMessage("Payment method is required")
    .isIn(PAYMENT_METHODS).withMessage(`Payment method must be one of: ${PAYMENT_METHODS.join(", ")}`),

  body("paymentDate")
    .optional()
    .isISO8601().withMessage("Payment date must be a valid date"),

  body("transactionId")
    .optional()
    .trim(),

  body("remarks")
    .optional()
    .trim()
    .isLength({ max: 300 }).withMessage("Remarks cannot exceed 300 characters"),

  body("recordedBy")
    .optional()
    .trim(),
];

export const updateBillRules = [
  param("id").isMongoId().withMessage("Invalid bill ID"),
  body("dueDate").optional().isISO8601().withMessage("Due date must be a valid date"),
  body("discount").optional().isFloat({ min: 0 }).withMessage("Discount must be non-negative"),
  body("fine").optional().isFloat({ min: 0 }).withMessage("Fine must be non-negative"),
  body("notes").optional().trim().isLength({ max: 500 }),
  body("status")
    .optional()
    .isIn(["Cancelled", "Waived"]).withMessage("Only Cancelled or Waived can be set manually"),
];
