import { body, param } from "express-validator";

const FEE_TYPES      = ["Tuition","Transport","Lab","Library","Sports","Hostel","Examination","Miscellaneous"];
const BILLING_CYCLES = ["Monthly","Quarterly","Yearly","One-Time"];

export const createFeeStructureRules = [
  body("className")
    .trim()
    .notEmpty().withMessage("Class name is required"),

  body("feeType")
    .trim()
    .notEmpty().withMessage("Fee type is required")
    .isIn(FEE_TYPES).withMessage(`Fee type must be one of: ${FEE_TYPES.join(", ")}`),

  body("amount")
    .notEmpty().withMessage("Amount is required")
    .isFloat({ min: 0 }).withMessage("Amount must be a non-negative number"),

  body("billingCycle")
    .trim()
    .notEmpty().withMessage("Billing cycle is required")
    .isIn(BILLING_CYCLES).withMessage(`Billing cycle must be one of: ${BILLING_CYCLES.join(", ")}`),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage("Description cannot exceed 200 characters"),

  body("effectiveFrom")
    .optional()
    .isISO8601().withMessage("effectiveFrom must be a valid date"),
];

export const updateFeeStructureRules = [
  param("id").isMongoId().withMessage("Invalid fee structure ID"),
  body("className").optional().trim().notEmpty(),
  body("feeType").optional().isIn(FEE_TYPES).withMessage(`Fee type must be one of: ${FEE_TYPES.join(", ")}`),
  body("amount").optional().isFloat({ min: 0 }).withMessage("Amount must be non-negative"),
  body("billingCycle").optional().isIn(BILLING_CYCLES).withMessage(`Billing cycle must be one of: ${BILLING_CYCLES.join(", ")}`),
  body("description").optional().trim().isLength({ max: 200 }),
  body("effectiveFrom").optional().isISO8601(),
  body("isActive").optional().isBoolean().withMessage("isActive must be true or false"),
];
