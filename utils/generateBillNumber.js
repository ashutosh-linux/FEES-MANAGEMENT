import { Bill } from "../models/index.js";

/**
 * generateBillNumber
 *
 * Generates a sequential, zero-padded bill number in the format:
 *   BILL-YYYYMM-XXXX
 *   e.g. BILL-202406-0001
 *
 * Counts existing bills for the current month to determine the next sequence.
 * Thread-safe enough for typical school volumes; swap for a DB sequence/counter
 * collection if high concurrency is needed.
 */
const generateBillNumber = async () => {
  const now    = new Date();
  const year   = now.getFullYear();
  const month  = String(now.getMonth() + 1).padStart(2, "0");
  const prefix = `BILL-${year}${month}-`;

  // Count bills already issued this month
  const count = await Bill.countDocuments({
    billNumber: { $regex: `^${prefix}` },
  });

  const sequence = String(count + 1).padStart(4, "0");
  return `${prefix}${sequence}`;
};

export default generateBillNumber;
