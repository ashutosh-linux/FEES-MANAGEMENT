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

const router = Router();

/**
 * Base path: /api/bills
 *
 * Static paths declared before dynamic /:id to avoid route conflicts.
 */

// ── Collection-level ──────────────────────────────────────────────────────────
router.get("/", getBills);
router.get("/stats/summary", getBillStats);
router.post("/", createBillRules, validate, createBill);
router.post("/generate", generateBillsFromFeeStructure);

// ── Nested: bills by student ───────────────────────────────────────────────────
router.get("/student/:studentId", getBillsByStudent);

// ── PDF Download (before dynamic /:id) ─────────────────────────────────────────
router.get("/:id/pdf", mongoIdParam("id"), validate, downloadBillPDF);

// ── Single resource ────────────────────────────────────────────────────────────
router.get("/:id", mongoIdParam("id"), validate, getBillById);
router.put("/:id", updateBillRules, validate, updateBill);
router.post("/:id/payments", recordPaymentRules, validate, recordPayment);

export default router;
