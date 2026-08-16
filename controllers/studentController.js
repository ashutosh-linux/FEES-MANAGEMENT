import { Student }   from "../models/index.js";
import asyncHandler  from "../utils/asyncHandler.js";
import { sendSuccess, sendError, sendNotFound } from "../utils/apiResponse.js";

// ─────────────────────────────────────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Build a Mongoose filter object from query params.
 * Supports: class, section, isActive, search (name / rollNumber / parentName)
 */
const buildStudentFilter = (query) => {
  const filter = {};

  if (query.class)   filter.class   = query.class.trim();
  if (query.section) filter.section = query.section.trim().toUpperCase();

  // isActive defaults to true unless explicitly set to "false"
  if (query.isActive !== undefined) {
    filter.isActive = query.isActive === "false" ? false : true;
  } else {
    filter.isActive = true;
  }

  // Full-text-style search across name, rollNumber, parentName
  if (query.search) {
    const regex = new RegExp(query.search.trim(), "i");
    filter.$or = [
      { name        : regex },
      { rollNumber  : regex },
      { parentName  : regex },
    ];
  }

  return filter;
};

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/students
//  Query params: class, section, isActive, search, page, limit, sortBy, order
// ─────────────────────────────────────────────────────────────────────────────

export const getStudents = asyncHandler(async (req, res) => {
  const page  = Math.max(1, parseInt(req.query.page)  || 1);
  const limit = Math.min(100, parseInt(req.query.limit) || 20);
  const skip  = (page - 1) * limit;

  const sortField = req.query.sortBy || "createdAt";
  const sortOrder = req.query.order  === "asc" ? 1 : -1;

  const filter = buildStudentFilter(req.query);

  const [students, total] = await Promise.all([
    Student.find(filter)
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean(),
    Student.countDocuments(filter),
  ]);

  sendSuccess(res, {
    message : "Students retrieved successfully",
    data    : students,
    meta    : {
      total,
      page,
      limit,
      totalPages : Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    },
  });
});

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/students/:id
// ─────────────────────────────────────────────────────────────────────────────

export const getStudentById = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id).lean();
  if (!student) return sendNotFound(res, "Student");
  sendSuccess(res, { message: "Student retrieved successfully", data: student });
});

// ─────────────────────────────────────────────────────────────────────────────
//  POST /api/students
// ─────────────────────────────────────────────────────────────────────────────

export const createStudent = asyncHandler(async (req, res) => {
  const student = await Student.create(req.body);
  sendSuccess(res, {
    statusCode : 201,
    message    : "Student created successfully",
    data       : student.toObject(),
  });
});

// ─────────────────────────────────────────────────────────────────────────────
//  PUT /api/students/:id
// ─────────────────────────────────────────────────────────────────────────────

export const updateStudent = asyncHandler(async (req, res) => {
  // Prevent accidentally wiping virtuals / internal fields
  const { _id, __v, createdAt, ...updates } = req.body;

  const student = await Student.findByIdAndUpdate(
    req.params.id,
    { $set: updates },
    { new: true, runValidators: true }
  ).lean();

  if (!student) return sendNotFound(res, "Student");
  sendSuccess(res, { message: "Student updated successfully", data: student });
});

// ─────────────────────────────────────────────────────────────────────────────
//  DELETE /api/students/:id  (soft delete — sets isActive: false)
// ─────────────────────────────────────────────────────────────────────────────

export const deleteStudent = asyncHandler(async (req, res) => {
  const student = await Student.findByIdAndUpdate(
    req.params.id,
    { $set: { isActive: false } },
    { new: true }
  ).lean();

  if (!student) return sendNotFound(res, "Student");
  sendSuccess(res, { message: "Student deactivated (soft-deleted) successfully" });
});

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/students/:id/bills
//  Convenience: fetch all bills for a student (delegates to Bill model)
// ─────────────────────────────────────────────────────────────────────────────

export const getStudentBills = asyncHandler(async (req, res) => {
  // Import Bill lazily to avoid circular dependencies
  const { Bill } = await import("../models/index.js");

  const student = await Student.findById(req.params.id).lean();
  if (!student) return sendNotFound(res, "Student");

  const bills = await Bill.find({ studentId: req.params.id })
    .sort({ createdAt: -1 })
    .lean();

  // Compute totals for the summary
  const totalBilled   = bills.reduce((s, b) => s + b.totalAmount, 0);
  const totalPaid     = bills.reduce((s, b) => s + b.paidAmount,  0);
  const totalBalance  = bills.reduce((s, b) => {
    const net = b.totalAmount + (b.fine || 0) - (b.discount || 0);
    return s + Math.max(0, net - b.paidAmount);
  }, 0);

  sendSuccess(res, {
    message : "Student bills retrieved successfully",
    data    : bills,
    meta    : {
      studentId  : req.params.id,
      totalBills : bills.length,
      totalBilled,
      totalPaid,
      totalBalance,
    },
  });
});

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/students/stats/summary
//  High-level counts for a dashboard widget
// ─────────────────────────────────────────────────────────────────────────────

export const getStudentStats = asyncHandler(async (req, res) => {
  const [total, active, inactive, byClass] = await Promise.all([
    Student.countDocuments(),
    Student.countDocuments({ isActive: true }),
    Student.countDocuments({ isActive: false }),
    Student.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: { class: "$class", section: "$section" }, count: { $sum: 1 } } },
      { $sort: { "_id.class": 1, "_id.section": 1 } },
    ]),
  ]);

  sendSuccess(res, {
    message : "Student statistics retrieved successfully",
    data    : { total, active, inactive, byClass },
  });
});
