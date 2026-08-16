import { Router } from "express";
import {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentBills,
  getStudentStats,
} from "../controllers/studentController.js";
import {
  createStudentRules,
  updateStudentRules,
  mongoIdParam,
} from "../middleware/validators/studentValidator.js";
import validate from "../middleware/validate.js";

const router = Router();

/**
 * Base path: /api/students
 *
 * NOTE: Static paths (/stats/summary) MUST be declared before dynamic paths
 *       (/:id) so Express does not treat "stats" as a Mongo ObjectId.
 */

// ── Aggregate / collection-level ──────────────────────────────────────────────
router.get(  "/stats/summary",  getStudentStats);
router.get(  "/",               getStudents);
router.post( "/",               createStudentRules, validate, createStudent);

// ── Single resource ───────────────────────────────────────────────────────────
router.get(    "/:id",       mongoIdParam("id"), validate, getStudentById);
router.put(    "/:id",       updateStudentRules, validate, updateStudent);
router.delete( "/:id",       mongoIdParam("id"), validate, deleteStudent);

// ── Nested resource ───────────────────────────────────────────────────────────
router.get(    "/:id/bills", mongoIdParam("id"), validate, getStudentBills);

export default router;
