import PDFDocument from "pdfkit";
import { formatCurrency, formatDate } from "./formatters.js";

/**
 * generateBillPDF
 *
 * Creates a professional school fee invoice PDF with:
 * - School header and metadata
 * - Student information
 * - Itemized fee breakdown
 * - Payment summary
 * - Payment history log
 * - Signature placeholder
 *
 * Returns a PDFDocument that can be piped to response
 */
export const generateBillPDF = (bill, student) => {
    const doc = new PDFDocument({ margin: 40, size: "A4" });

    // ═══════════════════════════════════════════════════════════════════════════
    // 1. School Header
    // ═══════════════════════════════════════════════════════════════════════════

    doc
        .fontSize(20)
        .font("Helvetica-Bold")
        .text("SCHOOL FEE MANAGEMENT SYSTEM", { align: "center" })
        .fontSize(11)
        .font("Helvetica")
        .text("Quality Education | Holistic Development", { align: "center" })
        .text("📞 Phone: +91-XXXX-XXXX-XXXX | 📧 Email: admin@school.edu.in", {
            align: "center",
        })
        .moveTo(40, doc.y + 5)
        .lineTo(555, doc.y + 5)
        .stroke();

    doc.moveDown(0.5);

    // ═══════════════════════════════════════════════════════════════════════════
    // 2. Bill Header & Metadata
    // ═══════════════════════════════════════════════════════════════════════════

    // Left side: Bill Number, Issue Date
    doc.fontSize(10).font("Helvetica-Bold").text("BILL NUMBER", 40, doc.y + 10);
    doc.fontSize(12).font("Helvetica").text(bill.billNumber, 40, doc.y);

    doc
        .fontSize(10)
        .font("Helvetica-Bold")
        .text("ISSUE DATE", 280, 95);
    doc.fontSize(12).font("Helvetica").text(formatDate(bill.createdAt), 280, doc.y);

    // Right side: Due Date, Status Badge
    doc.fontSize(10).font("Helvetica-Bold").text("DUE DATE", 450, 95);
    doc.fontSize(12).font("Helvetica").text(formatDate(bill.dueDate), 450, doc.y);

    // Status Badge
    const statusColors = {
        Unpaid: { bg: "#FEE2E2", text: "#991B1B" },
        "Partially Paid": { bg: "#FEF3C7", text: "#92400E" },
        Paid: { bg: "#DCFCE7", text: "#15803D" },
        Cancelled: { bg: "#E5E7EB", text: "#374151" },
        Waived: { bg: "#E0E7FF", text: "#3730A3" },
    };

    const statusColor = statusColors[bill.status] || statusColors.Unpaid;
    const statusX = 450;
    const statusY = doc.y + 20;

    // Draw status badge background (hex colors converted to RGB)
    const hexToRgb = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result
            ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16),
            }
            : { r: 0, g: 0, b: 0 };
    };

    const bgRgb = hexToRgb(statusColor.bg);
    const textRgb = hexToRgb(statusColor.text);

    doc.rect(statusX, statusY, 100, 25).fill(
        `rgb(${bgRgb.r}, ${bgRgb.g}, ${bgRgb.b})`
    );
    doc
        .fontSize(10)
        .font("Helvetica-Bold")
        .fillColor(`rgb(${textRgb.r}, ${textRgb.g}, ${textRgb.b})`)
        .text(bill.status.toUpperCase(), statusX, statusY + 5, {
            width: 100,
            align: "center",
        });

    doc.fillColor("black");
    doc.moveDown(2);

    // ═══════════════════════════════════════════════════════════════════════════
    // 3. Student Information Block
    // ═══════════════════════════════════════════════════════════════════════════

    doc.fontSize(11).font("Helvetica-Bold").text("STUDENT INFORMATION", 40, doc.y);
    doc
        .moveTo(40, doc.y + 2)
        .lineTo(555, doc.y + 2)
        .stroke();
    doc.moveDown(0.3);

    const studentInfoY = doc.y;
    doc.fontSize(10).font("Helvetica");

    // Column 1
    doc.text("Name:", 40, studentInfoY);
    doc.font("Helvetica-Bold").text(student.name, 120, studentInfoY);

    doc.font("Helvetica").text("Roll Number:", 40, doc.y + 3);
    doc.font("Helvetica-Bold").text(student.rollNumber, 120, doc.y);

    doc.font("Helvetica").text("Class:", 40, doc.y + 3);
    doc.font("Helvetica-Bold").text(student.class, 120, doc.y);

    // Column 2
    doc.font("Helvetica").text("Section:", 280, studentInfoY);
    doc.font("Helvetica-Bold").text(student.section, 360, studentInfoY);

    doc.font("Helvetica").text("Parent/Guardian:", 280, doc.y + 3);
    doc.font("Helvetica-Bold").text(student.parentName, 360, doc.y);

    doc.font("Helvetica").text("Contact:", 280, doc.y + 3);
    doc.font("Helvetica-Bold").text(student.contactNumber, 360, doc.y);

    doc.moveDown(1);

    // ═══════════════════════════════════════════════════════════════════════════
    // 4. Itemized Fee Table
    // ═══════════════════════════════════════════════════════════════════════════

    const tableTop = doc.y + 10;
    const col1X = 40;   // Description
    const col2X = 420;  // Amount

    // Table Header
    doc.fontSize(10).font("Helvetica-Bold");
    doc.text("DESCRIPTION", col1X, tableTop);
    doc.text("AMOUNT", col2X, tableTop, { align: "right" });

    // Separator line
    doc
        .moveTo(col1X, tableTop + 15)
        .lineTo(555, tableTop + 15)
        .stroke();

    doc.font("Helvetica").fontSize(10);
    let lineY = tableTop + 25;

    // Fee items
    bill.items.forEach((item) => {
        doc.text(item.description, col1X, lineY, { width: 360 });
        doc.text(formatCurrency(item.amount), col2X, lineY, { align: "right" });
        lineY += 25;
    });

    // Total line separator
    doc
        .moveTo(col1X, lineY)
        .lineTo(555, lineY)
        .stroke();

    lineY += 10;

    // ═══════════════════════════════════════════════════════════════════════════
    // 5. Totals Summary Block
    // ═══════════════════════════════════════════════════════════════════════════

    doc.fontSize(10).font("Helvetica-Bold");

    const summaryX = 350;
    const summaryValueX = 520;

    doc.text("Total Amount:", summaryX, lineY, { width: 150, align: "left" });
    doc.text(formatCurrency(bill.totalAmount), summaryValueX, lineY, {
        align: "right",
    });

    lineY += 20;

    if (bill.discount && bill.discount > 0) {
        doc.text("Discount:", summaryX, lineY, { width: 150, align: "left" });
        doc.text(`- ${formatCurrency(bill.discount)}`, summaryValueX, lineY, {
            align: "right",
        });
        lineY += 20;
    }

    if (bill.fine && bill.fine > 0) {
        doc.text("Fine:", summaryX, lineY, { width: 150, align: "left" });
        doc.text(`+ ${formatCurrency(bill.fine)}`, summaryValueX, lineY, {
            align: "right",
        });
        lineY += 20;
    }

    // Net Payable
    const netPayable = bill.totalAmount + (bill.fine || 0) - (bill.discount || 0);
    doc.fillColor("#1F2937");
    doc
        .rect(summaryX - 10, lineY - 5, 170, 20)
        .fill("#F3F4F6");
    doc.fillColor("black");
    doc.fontSize(11).font("Helvetica-Bold");
    doc.text("NET PAYABLE:", summaryX, lineY, { width: 150, align: "left" });
    doc.text(formatCurrency(netPayable), summaryValueX, lineY, {
        align: "right",
    });

    lineY += 25;

    // Payment info
    doc.fontSize(10).font("Helvetica");
    doc.text("Total Paid:", summaryX, lineY, { width: 150, align: "left" });
    doc.fillColor("#15803D");
    doc.text(formatCurrency(bill.paidAmount), summaryValueX, lineY, {
        align: "right",
    });
    doc.fillColor("black");

    lineY += 20;

    const balanceDue = Math.max(0, netPayable - bill.paidAmount);
    doc.font("Helvetica-Bold");
    if (balanceDue > 0) {
        doc.fillColor("#991B1B");
    } else {
        doc.fillColor("#15803D");
    }
    doc.text("BALANCE DUE:", summaryX, lineY, { width: 150, align: "left" });
    doc.text(formatCurrency(balanceDue), summaryValueX, lineY, {
        align: "right",
    });
    doc.fillColor("black");

    doc.moveDown(2);

    // ═══════════════════════════════════════════════════════════════════════════
    // 6. Payment History (if any payments made)
    // ═══════════════════════════════════════════════════════════════════════════

    if (bill.paymentHistory && bill.paymentHistory.length > 0) {
        doc.addPage();
        doc.fontSize(11).font("Helvetica-Bold").text("PAYMENT HISTORY", 40, 40);
        doc
            .moveTo(40, doc.y + 2)
            .lineTo(555, doc.y + 2)
            .stroke();
        doc.moveDown(0.5);

        // Payment history table header
        const historyTableTop = doc.y + 5;
        doc.fontSize(9).font("Helvetica-Bold");

        const payDateX = 40;
        const payMethodX = 150;
        const payAmountX = 350;
        const payTransactionX = 450;

        doc.text("Payment Date", payDateX, historyTableTop);
        doc.text("Method", payMethodX, historyTableTop);
        doc.text("Amount", payAmountX, historyTableTop, { align: "right" });
        doc.text("Transaction ID", payTransactionX, historyTableTop);

        // Separator
        doc
            .moveTo(payDateX, historyTableTop + 15)
            .lineTo(555, historyTableTop + 15)
            .stroke();

        doc.font("Helvetica").fontSize(9);
        let historyLineY = historyTableTop + 22;

        bill.paymentHistory.forEach((payment) => {
            doc.text(formatDate(payment.paymentDate), payDateX, historyLineY);
            doc.text(payment.paymentMethod, payMethodX, historyLineY);
            doc.text(
                formatCurrency(payment.amountPaid),
                payAmountX,
                historyLineY,
                { align: "right" }
            );
            doc.text(payment.transactionId || "-", payTransactionX, historyLineY);

            if (payment.remarks) {
                doc.fontSize(8).fillColor("#666666");
                doc.text(`Remarks: ${payment.remarks}`, payDateX, historyLineY + 12, {
                    width: 500,
                });
                doc.fillColor("black").fontSize(9);
                historyLineY += 25;
            } else {
                historyLineY += 20;
            }

            // Page break if needed
            if (historyLineY > 700) {
                doc.addPage();
                historyLineY = 40;
            }
        });
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 7. Footer with Notes & Signature
    // ═══════════════════════════════════════════════════════════════════════════

    if (!doc.page || doc.y > 650) {
        doc.addPage();
    }

    doc.moveDown(2);

    if (bill.notes) {
        doc.fontSize(10).font("Helvetica-Bold").text("NOTES:", 40, doc.y);
        doc.fontSize(9).font("Helvetica").text(bill.notes, 40, doc.y + 15, {
            width: 500,
        });
        doc.moveDown(1.5);
    }

    // Terms & Conditions
    doc.fontSize(8).fillColor("#666666");
    doc.text(
        "• Payment should be made within the due date as specified above.",
        40,
        doc.y
    );
    doc.text(
        "• Late payment may attract a fine as per school policy.",
        40,
        doc.y + 10
    );
    doc.text(
        "• In case of dispute, contact the school office with relevant proof.",
        40,
        doc.y + 20
    );

    doc.fillColor("black");

    // Signature area
    doc.moveTo(40, doc.y + 40).lineTo(200, doc.y + 40).stroke();
    doc.fontSize(9).text("Authorized Signature", 40, doc.y + 5);

    doc.moveTo(350, doc.y - 35).lineTo(520, doc.y - 35).stroke();
    doc.fontSize(9).text("Principal / School Stamp", 350, doc.y - 30);

    // Footer
    doc.fontSize(7).fillColor("#999999");
    doc.text(
        `Generated on ${formatDate(new Date())} | This is a computer-generated document`,
        40,
        doc.page.height - 40,
        { align: "center" }
    );

    return doc;
};

export default generateBillPDF;
