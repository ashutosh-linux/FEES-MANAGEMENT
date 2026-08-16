import { body, param } from "express-validator";

// ── Reusable field rules ──────────────────────────────────────────────────────

const nameRule = body("name")
  .trim()
  .notEmpty().withMessage("Student name is required")
  .isLength({ max: 100 }).withMessage("Name cannot exceed 100 characters");

const rollNumberRule = body("rollNumber")
  .trim()
  .notEmpty().withMessage("Roll number is required");

const classRule = body("class")
  .trim()
  .notEmpty().withMessage("Class is required");

const sectionRule = body("section")
  .trim()
  .notEmpty().withMessage("Section is required")
  .isLength({ max: 5 }).withMessage("Section cannot exceed 5 characters");

const parentNameRule = body("parentName")
  .trim()
  .notEmpty().withMessage("Parent/Guardian name is required")
  .isLength({ max: 100 }).withMessage("Parent name cannot exceed 100 characters");

const contactNumberRule = body("contactNumber")
  .trim()
  .notEmpty().withMessage("Contact number is required")
  .matches(/^\+?[\d\s\-().]{7,20}$/).withMessage("Please enter a valid contact number");

const addressRule = body("address")
  .optional()
  .trim()
  .isLength({ max: 300 }).withMessage("Address cannot exceed 300 characters");

const admissionDateRule = body("admissionDate")
  .optional()
  .isISO8601().withMessage("Admission date must be a valid date (ISO 8601)");

// ── Exported rule sets ────────────────────────────────────────────────────────

/** POST /api/students — all required fields */
export const createStudentRules = [
  nameRule,
  rollNumberRule,
  classRule,
  sectionRule,
  parentNameRule,
  contactNumberRule,
  addressRule,
  admissionDateRule,
];

/** PUT /api/students/:id — all fields optional (partial update) */
export const updateStudentRules = [
  param("id").isMongoId().withMessage("Invalid student ID"),
  body("name").optional().trim().notEmpty().isLength({ max: 100 }),
  body("rollNumber").optional().trim().notEmpty(),
  body("class").optional().trim().notEmpty(),
  body("section").optional().trim().notEmpty().isLength({ max: 5 }),
  body("parentName").optional().trim().notEmpty().isLength({ max: 100 }),
  body("contactNumber")
    .optional()
    .trim()
    .matches(/^\+?[\d\s\-().]{7,20}$/).withMessage("Please enter a valid contact number"),
  addressRule,
  admissionDateRule,
  body("isActive").optional().isBoolean().withMessage("isActive must be true or false"),
];

export const mongoIdParam = (paramName = "id") => [
  param(paramName).isMongoId().withMessage(`Invalid ${paramName}`),
];
