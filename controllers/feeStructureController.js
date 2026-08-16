import { FeeStructure } from "../models/index.js";
import asyncHandler      from "../utils/asyncHandler.js";
import { sendSuccess, sendNotFound } from "../utils/apiResponse.js";

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/fee-structures
//  Query params: className, feeType, billingCycle, isActive, page, limit
// ─────────────────────────────────────────────────────────────────────────────

export const getFeeStructures = asyncHandler(async (req, res) => {
  const page  = Math.max(1, parseInt(req.query.page)  || 1);
  const limit = Math.min(100, parseInt(req.query.limit) || 50);
  const skip  = (page - 1) * limit;

  const filter = {};
  if (req.query.className)    filter.className    = req.query.className.trim();
  if (req.query.feeType)      filter.feeType      = req.query.feeType.trim();
  if (req.query.billingCycle) filter.billingCycle = req.query.billingCycle.trim();

  // Default to active only; pass isActive=false or isActive=all to override
  if (req.query.isActive === "all") {
    // no filter — return everything
  } else if (req.query.isActive === "false") {
    filter.isActive = false;
  } else {
    filter.isActive = true;
  }

  const [structures, total] = await Promise.all([
    FeeStructure.find(filter)
      .sort({ className: 1, feeType: 1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    FeeStructure.countDocuments(filter),
  ]);

  sendSuccess(res, {
    message : "Fee structures retrieved successfully",
    data    : structures,
    meta    : { total, page, limit, totalPages: Math.ceil(total / limit) },
  });
});

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/fee-structures/:id
// ─────────────────────────────────────────────────────────────────────────────

export const getFeeStructureById = asyncHandler(async (req, res) => {
  const structure = await FeeStructure.findById(req.params.id).lean();
  if (!structure) return sendNotFound(res, "Fee structure");
  sendSuccess(res, { message: "Fee structure retrieved successfully", data: structure });
});

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/fee-structures/class/:className
//  Return all active fee structures grouped for a specific class
// ─────────────────────────────────────────────────────────────────────────────

export const getFeeStructureByClass = asyncHandler(async (req, res) => {
  const { className } = req.params;
  const structures    = await FeeStructure.findByClass(className);  // static method

  // Compute total annual liability per billing cycle for quick display
  const summary = structures.reduce((acc, s) => {
    acc[s.billingCycle] = (acc[s.billingCycle] || 0) + s.amount;
    return acc;
  }, {});

  sendSuccess(res, {
    message : `Fee structures for class ${className}`,
    data    : structures,
    meta    : { className, count: structures.length, amountByCycle: summary },
  });
});

// ─────────────────────────────────────────────────────────────────────────────
//  POST /api/fee-structures
// ─────────────────────────────────────────────────────────────────────────────

export const createFeeStructure = asyncHandler(async (req, res) => {
  const structure = await FeeStructure.create(req.body);
  sendSuccess(res, {
    statusCode : 201,
    message    : "Fee structure created successfully",
    data       : structure.toObject(),
  });
});

// ─────────────────────────────────────────────────────────────────────────────
//  POST /api/fee-structures/bulk
//  Create multiple fee structures at once (e.g. seed a new academic year)
//  Body: { structures: [ {...}, {...} ] }
// ─────────────────────────────────────────────────────────────────────────────

export const bulkCreateFeeStructures = asyncHandler(async (req, res) => {
  const { structures } = req.body;

  if (!Array.isArray(structures) || structures.length === 0) {
    return res.status(422).json({
      success : false,
      message : "Body must contain a non-empty `structures` array",
    });
  }

  if (structures.length > 100) {
    return res.status(422).json({
      success : false,
      message : "Cannot insert more than 100 fee structures at once",
    });
  }

  // insertMany with ordered:false continues past individual duplicates
  const result = await FeeStructure.insertMany(structures, {
    ordered       : false,    // don't stop on duplicate-key errors
    rawResult     : true,
  });

  sendSuccess(res, {
    statusCode : 201,
    message    : `${result.insertedCount} fee structure(s) created`,
    data       : { insertedCount: result.insertedCount },
  });
});

// ─────────────────────────────────────────────────────────────────────────────
//  PUT /api/fee-structures/:id
// ─────────────────────────────────────────────────────────────────────────────

export const updateFeeStructure = asyncHandler(async (req, res) => {
  const { _id, __v, createdAt, ...updates } = req.body;

  const structure = await FeeStructure.findByIdAndUpdate(
    req.params.id,
    { $set: updates },
    { new: true, runValidators: true }
  ).lean();

  if (!structure) return sendNotFound(res, "Fee structure");
  sendSuccess(res, { message: "Fee structure updated successfully", data: structure });
});

// ─────────────────────────────────────────────────────────────────────────────
//  DELETE /api/fee-structures/:id  (soft delete)
// ─────────────────────────────────────────────────────────────────────────────

export const deleteFeeStructure = asyncHandler(async (req, res) => {
  const structure = await FeeStructure.findByIdAndUpdate(
    req.params.id,
    { $set: { isActive: false } },
    { new: true }
  ).lean();

  if (!structure) return sendNotFound(res, "Fee structure");
  sendSuccess(res, { message: "Fee structure deactivated successfully" });
});
