import { Router } from "express";
import {
  getBills,
  getBillById,
  getBillsByStudent,
  createBill,
  generateBillsFromFeeStructure,
  updateBill,
  recordPayment,
  getBillStats,
  downloadBillPDF,
} from "../controllers/billController.js";
import {
  createBillRules,
  recordPaymentRules,
  updateBillRules,
} from "../middleware/validators/billValidator.js";
import { mongoIdParam } from "../middleware/validators/studentValidator.js";
import validate from "../middleware/validate.js";
// Uncomment and import your auth middleware if active:
// import { protect, restrictTo } from "../middleware/authMiddleware.js";

const router = Router();

/**
 * Base path: /api/bills
 *
 * NOTE: All static/sub-path routes MUST be defined above /:id
 * to prevent Express from capturing sub-paths as dynamic MongoDB ObjectIds.
 */

// Global authentication (optional: apply to all bill routes)
// router.use(protect);

// ── 1. Static & Aggregated Routes ───────────────────────────────────────────

// GET /api/bills/stats/summary -> Dashboard revenue & status statistics
router.get(
  "/stats/summary",
  // restrictTo("admin", "accountant"),
  getBillStats
);

// POST /api/bills/generate (or /generate-from-fee-structure) -> Bulk class bill generator
router.post(
  "/generate",
  // restrictTo("admin", "accountant"),
  generateBillsFromFeeStructure
);
router.post(
  "/generate-from-fee-structure",
  // restrictTo("admin", "accountant"),
  generateBillsFromFeeStructure
);

// ── 2. Nested & Filtered Routes ─────────────────────────────────────────────

// GET /api/bills/student/:studentId -> All bills for a single student
router.get(
  "/student/:studentId",
  mongoIdParam("studentId"),
  validate,
  getBillsByStudent
);

// ── 3. Collection Root ───────────────────────────────────────────────────────

// GET /api/bills -> Filtered list of all bills with pagination
router.get("/", getBills);

// POST /api/bills -> Create single manual bill
router.post(
  "/",
  // restrictTo("admin", "accountant"),
  createBillRules,
  validate,
  createBill
);

// ── 4. Parameterized Routes (/:id) ──────────────────────────────────────────

// GET /api/bills/:id/pdf -> Stream/Download styled PDF receipt
router.get(
  "/:id/pdf",
  mongoIdParam("id"),
  validate,
  downloadBillPDF
);

// POST /api/bills/:id/payments -> Record payment against a bill
router.post(
  "/:id/payments",
  // restrictTo("admin", "accountant"),
  mongoIdParam("id"),
  recordPaymentRules,
  validate,
  recordPayment
);

// GET /api/bills/:id -> Fetch single bill details
router.get(
  "/:id",
  mongoIdParam("id"),
  validate,
  getBillById
);

// PUT /api/bills/:id -> Edit fine, discount, dueDate, notes, or cancel/waive
router.put(
  "/:id",
  // restrictTo("admin", "accountant"),
  mongoIdParam("id"),
  updateBillRules,
  validate,
  updateBill
);

export default router;