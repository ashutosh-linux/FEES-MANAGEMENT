import PDFDocument from "pdfkit";
import { formatCurrency, formatDate } from "./formatters.js";

/**
 * generateBillPDF
 *
 * Creates a professional school fee invoice PDF with:
 * - School header (INTECH KIDS PLAY SCHOOL)
 * - Dynamic status watermark stamp (PAID / UNPAID / OVERDUE)
 * - Student information card
 * - Itemized fee breakdown table
 * - Totals summary & payment history
 * - Authorization signatures & footer
 *
 * Returns a PDFDocument that can be piped to response
 */
export const generateBillPDF = (bill, student) => {
    const doc = new PDFDocument({ margin: 40, size: "A4" });

    // ═══════════════════════════════════════════════════════════════════════════
    // 1. Watermark Stamp (PAID / UNPAID / OVERDUE / PARTIALLY PAID)
    // ═══════════════════════════════════════════════════════════════════════════

    const isOverdue =
        bill.dueDate &&
        new Date(bill.dueDate) < new Date() &&
        ["Unpaid", "Partially Paid"].includes(bill.status);

    const watermarkText = isOverdue
        ? "OVERDUE"
        : (bill.status || "UNPAID").toUpperCase();

    const watermarkColors = {
        PAID: "#15803D",
        OVERDUE: "#DC2626",
        UNPAID: "#DC2626",
        "PARTIALLY PAID": "#D97706",
        CANCELLED: "#4B5563",
        WAIVED: "#4338CA",
    };

    const stampColor = watermarkColors[watermarkText] || "#DC2626";

    doc.save();
    doc.rotate(-30, { origin: [297, 420] });
    doc
        .fontSize(66)
        .font("Helvetica-Bold")
        .fillColor(stampColor)
        .fillOpacity(0.08);
    doc.text(watermarkText, 97, 390, {
        width: 400,
        align: "center",
    });
    doc.restore();

    // Reset opacity and text color for the main document
    doc.fillOpacity(1).fillColor("#111827");

    // ═══════════════════════════════════════════════════════════════════════════
    // 2. School Header
    // ═══════════════════════════════════════════════════════════════════════════

    doc
        .fontSize(18)
        .font("Helvetica-Bold")
        .fillColor("#0F172A")
        .text("INTECH KIDS PLAY SCHOOL", 40, 38, { align: "center" })
        .fontSize(9)
        .font("Helvetica")
        .fillColor("#64748B")
        .text("Quality Early Childhood Education & Holistic Development", {
            align: "center",
        })
        .fontSize(8)
        .font("Helvetica")
        .fillColor("#475569")
        .text("BANDHU BAZAR, SOHSARAI, BIHAR SHARIF, NALANDA", {
            align: "center",
        })
        .text("Contact: +91 9470445172, +91 9304364405", {
            align: "center",
        });

    doc
        .moveTo(40, doc.y + 8)
        .lineTo(555, doc.y + 8)
        .strokeColor("#E2E8F0")
        .lineWidth(1)
        .stroke();

    // ═══════════════════════════════════════════════════════════════════════════
    // 3. Bill Metadata & Status Badge
    // ═══════════════════════════════════════════════════════════════════════════

    const metaTop = doc.y + 16;

    // Left & Center: Invoice details
    doc.fontSize(8).font("Helvetica-Bold").fillColor("#64748B").text("INVOICE NUMBER", 40, metaTop);
    doc.fontSize(11).font("Helvetica-Bold").fillColor("#0F172A").text(bill.billNumber || "N/A", 40, metaTop + 12);

    doc.fontSize(8).font("Helvetica-Bold").fillColor("#64748B").text("ISSUE DATE", 200, metaTop);
    doc.fontSize(10).font("Helvetica").fillColor("#334155").text(formatDate(bill.createdAt), 200, metaTop + 12);

    doc.fontSize(8).font("Helvetica-Bold").fillColor("#64748B").text("DUE DATE", 320, metaTop);
    doc.fontSize(10).font("Helvetica").fillColor("#334155").text(formatDate(bill.dueDate), 320, metaTop + 12);

    // Status Badge (Pill button layout)
    const statusColors = {
        Unpaid: { bg: "#FEE2E2", text: "#991B1B" },
        "Partially Paid": { bg: "#FEF3C7", text: "#92400E" },
        Paid: { bg: "#DCFCE7", text: "#15803D" },
        Cancelled: { bg: "#F3F4F6", text: "#374151" },
        Waived: { bg: "#E0E7FF", text: "#3730A3" },
    };

    const currentBadge = statusColors[bill.status] || statusColors.Unpaid;
    const statusX = 445;
    const statusY = metaTop + 2;

    doc.roundedRect(statusX, statusY, 110, 24, 4).fill(currentBadge.bg);
    doc
        .fontSize(9)
        .font("Helvetica-Bold")
        .fillColor(currentBadge.text)
        .text(bill.status.toUpperCase(), statusX, statusY + 7, {
            width: 110,
            align: "center",
        });

    // ═══════════════════════════════════════════════════════════════════════════
    // 4. Student Information Block
    // ═══════════════════════════════════════════════════════════════════════════

    const cardY = metaTop + 38;
    doc.roundedRect(40, cardY, 515, 60, 4).fill("#F8FAFC");
    doc.roundedRect(40, cardY, 515, 60, 4).strokeColor("#E2E8F0").lineWidth(1).stroke();

    doc.fontSize(8).font("Helvetica-Bold").fillColor("#475569").text("STUDENT INFORMATION", 52, cardY + 8);

    const stdRow1 = cardY + 22;
    const stdRow2 = cardY + 38;

    doc.font("Helvetica").fontSize(9).fillColor("#64748B").text("Name:", 52, stdRow1);
    doc.font("Helvetica-Bold").fillColor("#0F172A").text(student?.name || "N/A", 95, stdRow1);

    doc.font("Helvetica").fillColor("#64748B").text("Roll No:", 52, stdRow2);
    doc.font("Helvetica-Bold").fillColor("#0F172A").text(student?.rollNumber || "N/A", 95, stdRow2);

    doc.font("Helvetica").fillColor("#64748B").text("Class / Sec:", 230, stdRow1);
    doc.font("Helvetica-Bold").fillColor("#0F172A").text(`${student?.class || "N/A"} ${student?.section || ""}`.trim(), 290, stdRow1);

    doc.font("Helvetica").fillColor("#64748B").text("Contact:", 230, stdRow2);
    doc.font("Helvetica-Bold").fillColor("#0F172A").text(student?.contactNumber || "N/A", 290, stdRow2);

    doc.font("Helvetica").fillColor("#64748B").text("Parent:", 400, stdRow1);
    doc.font("Helvetica-Bold").fillColor("#0F172A").text(student?.parentName || "N/A", 445, stdRow1, { width: 100 });

    // ═══════════════════════════════════════════════════════════════════════════
    // 5. Itemized Fee Table
    // ═══════════════════════════════════════════════════════════════════════════

    const tableTop = cardY + 72;
    doc.rect(40, tableTop, 515, 20).fill("#0F172A");

    doc.fontSize(8).font("Helvetica-Bold").fillColor("#FFFFFF");
    doc.text("ITEM DESCRIPTION", 52, tableTop + 6);
    doc.text("AMOUNT", 440, tableTop + 6, { width: 100, align: "right" });

    let lineY = tableTop + 24;
    doc.font("Helvetica").fontSize(9).fillColor("#1E293B");

    (bill.items || []).forEach((item, index) => {
        if (index % 2 === 0) {
            doc.rect(40, lineY - 2, 515, 18).fill("#F8FAFC");
        }
        doc.fillColor("#1E293B").text(item.description, 52, lineY + 2);
        doc.text(formatCurrency(item.amount), 440, lineY + 2, {
            width: 100,
            align: "right",
        });
        lineY += 18;
    });

    doc
        .moveTo(40, lineY + 4)
        .lineTo(555, lineY + 4)
        .strokeColor("#CBD5E1")
        .lineWidth(1)
        .stroke();

    lineY += 12;

    // ═══════════════════════════════════════════════════════════════════════════
    // 6. Totals Summary Block
    // ═══════════════════════════════════════════════════════════════════════════

    const summaryLabelX = 330;
    const summaryValueX = 445;
    const netPayable = (bill.totalAmount || 0) + (bill.fine || 0) - (bill.discount || 0);
    const balanceDue = Math.max(0, netPayable - (bill.paidAmount || 0));

    const addSummaryRow = (label, val, bold = false, color = "#1E293B", bg = null) => {
        if (bg) {
            doc.rect(summaryLabelX - 8, lineY - 3, 233, 18).fill(bg);
        }
        doc.font(bold ? "Helvetica-Bold" : "Helvetica").fontSize(9).fillColor(color);
        doc.text(label, summaryLabelX, lineY);
        doc.text(val, summaryValueX, lineY, { width: 100, align: "right" });
        lineY += 16;
    };

    addSummaryRow("Total Amount:", formatCurrency(bill.totalAmount));

    if (bill.discount && bill.discount > 0) {
        addSummaryRow("Discount (-):", `- ${formatCurrency(bill.discount)}`, false, "#15803D");
    }

    if (bill.fine && bill.fine > 0) {
        addSummaryRow("Late Fine (+):", `+ ${formatCurrency(bill.fine)}`, false, "#DC2626");
    }

    addSummaryRow("Net Payable:", formatCurrency(netPayable), true, "#0F172A", "#F1F5F9");
    addSummaryRow("Total Paid:", formatCurrency(bill.paidAmount || 0), false, "#0284C7");
    addSummaryRow(
        "Balance Due:",
        formatCurrency(balanceDue),
        true,
        balanceDue > 0 ? "#DC2626" : "#15803D"
    );

    // ═══════════════════════════════════════════════════════════════════════════
    // 7. Payment History Log (if any)
    // ═══════════════════════════════════════════════════════════════════════════

    if (bill.paymentHistory && bill.paymentHistory.length > 0) {
        if (lineY > 520) {
            doc.addPage();
            lineY = 40;
        } else {
            lineY += 12;
        }

        doc.fontSize(9).font("Helvetica-Bold").fillColor("#0F172A").text("PAYMENT LOG", 40, lineY);
        doc
            .moveTo(40, lineY + 12)
            .lineTo(555, lineY + 12)
            .strokeColor("#E2E8F0")
            .stroke();

        lineY += 16;

        doc.fontSize(8).font("Helvetica-Bold").fillColor("#64748B");
        doc.text("Date", 40, lineY);
        doc.text("Method", 130, lineY);
        doc.text("Transaction ID", 240, lineY);
        doc.text("Amount", 440, lineY, { width: 100, align: "right" });

        lineY += 12;
        doc.font("Helvetica").fontSize(8).fillColor("#334155");

        bill.paymentHistory.forEach((payment) => {
            doc.text(formatDate(payment.paymentDate), 40, lineY);
            doc.text(payment.paymentMethod || "Cash", 130, lineY);
            doc.text(payment.transactionId || "-", 240, lineY);
            doc.text(formatCurrency(payment.amountPaid), 440, lineY, { width: 100, align: "right" });
            lineY += 14;
        });
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 8. Signatures & Footer
    // ═══════════════════════════════════════════════════════════════════════════

    const sigY = Math.max(lineY + 35, 680);

    if (sigY > 740) {
        doc.addPage();
    }

    const finalSigY = sigY > 740 ? 680 : sigY;

    // Signature lines
    doc.strokeColor("#CBD5E1").lineWidth(1);
    doc.moveTo(40, finalSigY).lineTo(180, finalSigY).stroke();
    doc.fontSize(8).font("Helvetica").fillColor("#475569").text("Accounts Officer / Cashier", 40, finalSigY + 5);

    doc.moveTo(415, finalSigY).lineTo(555, finalSigY).stroke();
    doc.text("Principal / Authorized Signatory", 415, finalSigY + 5, { width: 140, align: "center" });

    // Computer generated footer note
    doc.fontSize(7).fillColor("#94A3B8").text(
        `Receipt Generated on ${formatDate(new Date())} | INTECH KIDS PLAY SCHOOL | Computer-generated document.`,
        40,
        780,
        { align: "center", width: 515 }
    );

    return doc;
};

export default generateBillPDF;