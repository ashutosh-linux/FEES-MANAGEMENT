import { Router } from "express";
import {
  getFeeStructures,
  getFeeStructureById,
  getFeeStructureByClass,
  createFeeStructure,
  bulkCreateFeeStructures,
  updateFeeStructure,
  deleteFeeStructure,
} from "../controllers/feeStructureController.js";
import {
  createFeeStructureRules,
  updateFeeStructureRules,
} from "../middleware/validators/feeStructureValidator.js";
import { mongoIdParam } from "../middleware/validators/studentValidator.js";
import validate from "../middleware/validate.js";

const router = Router();

/**
 * Base path: /api/fee-structures
 */

// ── Static / collection-level ──────────────────────────────────────────────────
router.get(  "/",                       getFeeStructures);
router.post( "/",                       createFeeStructureRules, validate, createFeeStructure);
router.post( "/bulk",                   bulkCreateFeeStructures);

// ── Lookup by class name (before /:id to avoid clash) ────────────────────────
router.get(  "/class/:className",       getFeeStructureByClass);

// ── Single resource ────────────────────────────────────────────────────────────
router.get(  "/:id", mongoIdParam("id"), validate, getFeeStructureById);
router.put(  "/:id", updateFeeStructureRules, validate, updateFeeStructure);
router.delete("/:id", mongoIdParam("id"), validate, deleteFeeStructure);

export default router;
