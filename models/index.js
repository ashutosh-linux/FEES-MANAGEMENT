/**
 * Central barrel export for all Mongoose models.
 * Import from here instead of individual files:
 *   import { Student, FeeStructure, Bill } from "../models/index.js";
 */

export { default as Student }      from "./Student.js";
export { default as FeeStructure } from "./FeeStructure.js";
export { default as Bill }         from "./Bill.js";
