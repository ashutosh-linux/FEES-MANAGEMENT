import mongoose from "mongoose";
import { Bill, Student, FeeStructure } from "../models/index.js";
import asyncHandler from "../utils/asyncHandler.js";
import generateBillNumber from "../utils/generateBillNumber.js";
import { sendSuccess, sendError, sendNotFound } from "../utils/apiResponse.js";
import { generateBillPDF } from "../utils/pdfGenerator.js";

// ─────────────────────────────────────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Sum line-item amounts */
const calcTotal = (items = []) =>
  items.reduce((sum, item) => sum + Number(item.amount), 0);

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/bills
//  Query: studentId, status, month, year, overdue, page, limit, sortBy, order
// ─────────────────────────────────────────────────────────────────────────────

export const getBills = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, parseInt(req.query.limit) || 20);
  const skip = (page - 1) * limit;

  const sortField = req.query.sortBy || "createdAt";
  const sortOrder = req.query.order === "asc" ? 1 : -1;

  const filter = {};

  if (req.query.studentId) {
    if (!mongoose.isValidObjectId(req.query.studentId)) {
      return sendError(res, { statusCode: 400, message: "Invalid studentId" });
    }
    filter.studentId = req.query.studentId;
  }

  if (req.query.status) filter.status = req.query.status;

  if (req.query.month) filter["billingPeriod.month"] = parseInt(req.query.month);
  if (req.query.year) filter["billingPeriod.year"] = parseInt(req.query.year);

  // Overdue = dueDate in the past AND status not terminal
  if (req.query.overdue === "true") {
    filter.dueDate = { $lt: new Date() };
    filter.status = { $in: ["Unpaid", "Partially Paid"] };
  }

  const [bills, total] = await Promise.all([
    Bill.find(filter)
      .populate("studentId", "name rollNumber class section")   // join student info
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean({ virtuals: true }),
    Bill.countDocuments(filter),
  ]);

  sendSuccess(res, {
    message: "Bills retrieved successfully",
    data: bills,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    },
  });
});

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/bills/:id
// ─────────────────────────────────────────────────────────────────────────────

export const getBillById = asyncHandler(async (req, res) => {
  const bill = await Bill.findById(req.params.id)
    .populate("studentId", "name rollNumber class section parentName contactNumber")
    .lean({ virtuals: true });

  if (!bill) return sendNotFound(res, "Bill");
  sendSuccess(res, { message: "Bill retrieved successfully", data: bill });
});

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/bills/student/:studentId
// ─────────────────────────────────────────────────────────────────────────────

export const getBillsByStudent = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.studentId)) {
    return sendError(res, { statusCode: 400, message: "Invalid student ID" });
  }

  const student = await Student.findById(req.params.studentId).lean();
  if (!student) return sendNotFound(res, "Student");

  const bills = await Bill.find({ studentId: req.params.studentId })
    .sort({ createdAt: -1 })
    .lean({ virtuals: true });

  const totalBilled = bills.reduce((s, b) => s + b.totalAmount, 0);
  const totalPaid = bills.reduce((s, b) => s + b.paidAmount, 0);
  const totalBalance = bills.reduce((s, b) => s + (b.balanceDue || 0), 0);
  const overdueCount = bills.filter((b) => b.isOverdue).length;

  sendSuccess(res, {
    message: "Bills for student retrieved successfully",
    data: bills,
    meta: { student: { id: student._id, name: student.name }, totalBilled, totalPaid, totalBalance, overdueCount },
  });
});

// ─────────────────────────────────────────────────────────────────────────────
//  POST /api/bills
//  Auto-computes totalAmount from items; auto-generates billNumber
// ─────────────────────────────────────────────────────────────────────────────

export const createBill = asyncHandler(async (req, res) => {
  const { studentId, items, dueDate, discount, fine, billingPeriod, notes } = req.body;

  // Verify the student exists and is active
  const student = await Student.findById(studentId).lean();
  if (!student) return sendNotFound(res, "Student");
  if (!student.isActive) {
    return sendError(res, { statusCode: 400, message: "Cannot create a bill for an inactive student" });
  }

  const totalAmount = calcTotal(items);
  const billNumber = await generateBillNumber();

  const bill = await Bill.create({
    studentId,
    billNumber,
    items,
    totalAmount,
    dueDate,
    discount: discount || 0,
    fine: fine || 0,
    billingPeriod,
    notes,
  });

  sendSuccess(res, {
    statusCode: 201,
    message: "Bill created successfully",
    data: bill.toObject({ virtuals: true }),
  });
});

// ─────────────────────────────────────────────────────────────────────────────
//  POST /api/bills/generate-from-fee-structure
//  Generates bills for an entire class from the stored fee structure
//  Body: { className, section (optional), month, year, dueDate }
// ─────────────────────────────────────────────────────────────────────────────

export const generateBillsFromFeeStructure = asyncHandler(async (req, res) => {
  const { className, section, month, year, dueDate } = req.body;

  if (!className || !month || !year || !dueDate) {
    return sendError(res, {
      statusCode: 422,
      message: "className, month, year, and dueDate are required",
    });
  }

  // 1. Find all active fee structures for this class
  const feeStructures = await FeeStructure.findByClass(className);
  if (feeStructures.length === 0) {
    return sendError(res, {
      statusCode: 404,
      message: `No active fee structures found for class ${className}`,
    });
  }

  // 2. Find all active students in this class (optionally filtered by section)
  const studentFilter = { class: className, isActive: true };
  if (section) studentFilter.section = section.toUpperCase();
  const students = await Student.find(studentFilter).lean();

  if (students.length === 0) {
    return sendError(res, {
      statusCode: 404,
      message: `No active students found for class ${className}${section ? ` section ${section}` : ""}`,
    });
  }

  // 3. Filter fee structures applicable for this month's billing cycle
  //    (Monthly: all; Quarterly: Jan/Apr/Jul/Oct; Yearly: Jun)
  const applicableFees = feeStructures.filter((fs) => {
    if (fs.billingCycle === "Monthly") return true;
    if (fs.billingCycle === "Quarterly") return [1, 4, 7, 10].includes(parseInt(month));
    if (fs.billingCycle === "Yearly") return parseInt(month) === 6; // June
    if (fs.billingCycle === "One-Time") return false; // handled separately
    return false;
  });

  if (applicableFees.length === 0) {
    return sendError(res, {
      statusCode: 400,
      message: `No fee structures apply for month ${month} (billing cycle mismatch)`,
    });
  }

  // 4. Build bill documents for each student
  const items = applicableFees.map((fs) => ({ description: `${fs.feeType} Fee`, amount: fs.amount }));
  const totalAmount = calcTotal(items);

  const billDocs = await Promise.all(
    students.map(async (student) => ({
      studentId: student._id,
      billNumber: await generateBillNumber(),
      items,
      totalAmount,
      dueDate: new Date(dueDate),
      billingPeriod: { month: parseInt(month), year: parseInt(year) },
    }))
  );

  // 5. Bulk insert — skip students who already have a bill for this period
  const result = await Bill.insertMany(billDocs, { ordered: false, rawResult: true });

  sendSuccess(res, {
    statusCode: 201,
    message: `${result.insertedCount} bill(s) generated for class ${className}`,
    data: {
      insertedCount: result.insertedCount,
      totalAmount,
      studentsCount: students.length,
      feeItems: items,
    },
  });
});

// ─────────────────────────────────────────────────────────────────────────────
//  PUT /api/bills/:id
//  Allowed manual edits: dueDate, discount, fine, notes, status (cancel/waive)
//  totalAmount is always re-computed if items are provided
// ─────────────────────────────────────────────────────────────────────────────

export const updateBill = asyncHandler(async (req, res) => {
  const bill = await Bill.findById(req.params.id);
  if (!bill) return sendNotFound(res, "Bill");

  if (bill.status === "Paid") {
    return sendError(res, { statusCode: 400, message: "Cannot edit a fully paid bill" });
  }

  const { dueDate, discount, fine, notes, status } = req.body;

  if (dueDate !== undefined) bill.dueDate = new Date(dueDate);
  if (discount !== undefined) bill.discount = Number(discount);
  if (fine !== undefined) bill.fine = Number(fine);
  if (notes !== undefined) bill.notes = notes;

  // Only allow manual override to terminal statuses
  if (status === "Cancelled" || status === "Waived") {
    bill.status = status;
  }

  await bill.save(); // pre-save hook re-derives status unless Cancelled/Waived

  sendSuccess(res, {
    message: "Bill updated successfully",
    data: bill.toObject({ virtuals: true }),
  });
});

// ─────────────────────────────────────────────────────────────────────────────
//  POST /api/bills/:id/payments
//  Append a payment to paymentHistory; pre-save hook updates status
// ─────────────────────────────────────────────────────────────────────────────

export const recordPayment = asyncHandler(async (req, res) => {
  const bill = await Bill.findById(req.params.id);
  if (!bill) return sendNotFound(res, "Bill");

  if (bill.status === "Paid") {
    return sendError(res, { statusCode: 400, message: "This bill is already fully paid" });
  }
  if (bill.status === "Cancelled" || bill.status === "Waived") {
    return sendError(res, {
      statusCode: 400,
      message: `Cannot record a payment on a ${bill.status.toLowerCase()} bill`,
    });
  }

  const { amountPaid, paymentMethod, paymentDate, transactionId, remarks, recordedBy } = req.body;
  const amount = Number(amountPaid);

  // Guard: digital payments should carry a transactionId
  const digitalMethods = ["UPI", "NetBanking", "CreditCard", "DebitCard", "BankTransfer"];
  if (digitalMethods.includes(paymentMethod) && !transactionId) {
    return sendError(res, {
      statusCode: 422,
      message: `transactionId is required for ${paymentMethod} payments`,
    });
  }

  // Guard: don't allow overpayment
  const netPayable = bill.totalAmount + (bill.fine || 0) - (bill.discount || 0);
  const balanceDue = Math.max(0, netPayable - bill.paidAmount);
  if (amount > balanceDue + 0.001) { // float tolerance
    return sendError(res, {
      statusCode: 400,
      message: `Payment amount (${amount}) exceeds the outstanding balance (${balanceDue.toFixed(2)})`,
    });
  }

  // Append to history and update cumulative paidAmount
  bill.paymentHistory.push({
    amountPaid: amount,
    paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
    paymentMethod,
    transactionId,
    remarks,
    recordedBy,
  });

  bill.paidAmount = parseFloat((bill.paidAmount + amount).toFixed(2));
  // pre-save hook will set status based on new paidAmount

  await bill.save();

  // Return the latest payment entry as a receipt
  const latestPayment = bill.paymentHistory[bill.paymentHistory.length - 1];

  sendSuccess(res, {
    message: "Payment recorded successfully",
    data: {
      bill: bill.toObject({ virtuals: true }),
      receipt: {
        billNumber: bill.billNumber,
        amountPaid: amount,
        paymentMethod,
        transactionId,
        paymentDate: latestPayment.paymentDate,
        balanceDue: Math.max(0, netPayable - bill.paidAmount),
        billStatus: bill.status,
      },
    },
  });
});

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/bills/:id/pdf
//  Generates and streams a PDF invoice for the bill
// ─────────────────────────────────────────────────────────────────────────────

export const downloadBillPDF = asyncHandler(async (req, res) => {
  const bill = await Bill.findById(req.params.id)
    .populate("studentId", "name rollNumber class section parentName contactNumber address admissionDate")
    .lean({ virtuals: true });

  if (!bill) return sendNotFound(res, "Bill");

  const student = bill.studentId;

  try {
    // Generate PDF document
    const pdfDoc = generateBillPDF(bill, student);

    // Set response headers for PDF download/viewing
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="Bill_${bill.billNumber}.pdf"`
    );

    // Pipe PDF to response
    pdfDoc.pipe(res);

    // Finalize the PDF
    pdfDoc.end();

    // Handle errors during PDF generation
    pdfDoc.on("error", (err) => {
      console.error("PDF Generation Error:", err);
      if (!res.headersSent) {
        sendError(res, {
          statusCode: 500,
          message: "Error generating PDF",
        });
      }
    });
  } catch (error) {
    console.error("PDF Download Error:", error);
    sendError(res, {
      statusCode: 500,
      message: "Failed to generate PDF",
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/bills/stats/summary
//  Dashboard aggregations: totals, status breakdown, overdue count
// ─────────────────────────────────────────────────────────────────────────────

export const getBillStats = asyncHandler(async (req, res) => {
  const [statusSummary, overdueSummary, monthlyCollection] = await Promise.all([

    // Total billed / paid / balance by status
    Bill.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalBilled: { $sum: "$totalAmount" },
          totalPaid: { $sum: "$paidAmount" },
        },
      },
    ]),

    // Overdue bills count + outstanding amount
    Bill.aggregate([
      {
        $match: {
          dueDate: { $lt: new Date() },
          status: { $in: ["Unpaid", "Partially Paid"] },
        },
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          totalOutstanding: {
            $sum: {
              $subtract: [
                { $add: ["$totalAmount", "$fine"] },
                { $add: ["$paidAmount", "$discount"] },
              ],
            },
          },
        },
      },
    ]),

    // Monthly collections for the current year
    Bill.aggregate([
      {
        $match: {
          "billingPeriod.year": new Date().getFullYear(),
          paidAmount: { $gt: 0 },
        },
      },
      {
        $group: {
          _id: "$billingPeriod.month",
          collected: { $sum: "$paidAmount" },
          billCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  sendSuccess(res, {
    message: "Bill statistics retrieved successfully",
    data: {
      byStatus: statusSummary,
      overdue: overdueSummary[0] || { count: 0, totalOutstanding: 0 },
      monthlyCollection,
    },
  });
});
