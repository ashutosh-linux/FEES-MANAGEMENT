import { useState, useEffect } from "react";
import {
    Plus,
    Download,
    Filter,
    Loader,
    AlertCircle,
    Eye,
    DollarSign,
    X,
    Calendar,
} from "lucide-react";
import { billAPI, studentAPI, feeStructureAPI } from "../services/api";

export default function Bills() {
    const [bills, setBills] = useState([]);
    const [students, setStudents] = useState([]);
    const [feeStructures, setFeeStructures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statusFilter, setStatusFilter] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    // Modal States
    const [isManualModalOpen, setIsManualModalOpen] = useState(false);
    const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [selectedBill, setSelectedBill] = useState(null);

    // Form States
    const [manualForm, setManualForm] = useState({
        studentId: "",
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        month: new Date().toLocaleString("en-US", { month: "long" }),
        year: new Date().getFullYear(),
        items: [{ description: "Tuition Fee", amount: 0 }],
    });

    const [generateForm, setGenerateForm] = useState({
        class: "All",
        month: new Date().toLocaleString("en-US", { month: "long" }),
        year: new Date().getFullYear(),
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    });

    const [paymentForm, setPaymentForm] = useState({
        amount: "",
        paymentMode: "Cash",
        transactionReference: "",
        remarks: "",
    });

    const fetchBills = async () => {
        try {
            setLoading(true);
            const params = {
                page: currentPage,
                limit: 20,
                status: statusFilter || undefined,
            };

            const response = await billAPI.list(params);
            const rawData = response.data?.data;
            const billsList = Array.isArray(rawData)
                ? rawData
                : rawData?.bills || response.data?.bills || [];

            setBills(Array.isArray(billsList) ? billsList : []);
            setError(null);
        } catch (err) {
            console.error("Error fetching bills:", err);
            setError(err.response?.data?.message || "Failed to load bills");
            setBills([]);
        } finally {
            setLoading(false);
        }
    };

    // Pre-fetch students & fee structures for creation forms
    useEffect(() => {
        const fetchAuxData = async () => {
            try {
                const [studRes, feeRes] = await Promise.allSettled([
                    studentAPI.list({ limit: 100 }),
                    feeStructureAPI.list({ limit: 100 }),
                ]);
                if (studRes.status === "fulfilled") {
                    const raw = studRes.value.data?.data;
                    setStudents(Array.isArray(raw) ? raw : raw?.students || []);
                }
                if (feeRes.status === "fulfilled") {
                    const raw = feeRes.value.data?.data;
                    setFeeStructures(Array.isArray(raw) ? raw : raw?.feeStructures || []);
                }
            } catch (e) {
                console.error("Error prefetching data:", e);
            }
        };
        fetchAuxData();
    }, []);

    useEffect(() => {
        const debounceTimer = setTimeout(fetchBills, 300);
        return () => clearTimeout(debounceTimer);
    }, [statusFilter, currentPage]);

    // Handle PDF Download
    const handleDownloadPDF = async (billId) => {
        try {
            const response = await billAPI.downloadPDF(billId);
            const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `Invoice-${billId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Error downloading PDF:", err);
            alert("Failed to download invoice PDF");
        }
    };

    // Handle Manual Bill Submit
    const handleManualSubmit = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            const totalAmount = manualForm.items.reduce((sum, i) => sum + Number(i.amount || 0), 0);
            await billAPI.create({
                ...manualForm,
                totalAmount,
            });
            setIsManualModalOpen(false);
            fetchBills();
        } catch (err) {
            alert(err.response?.data?.message || "Failed to create manual bill");
        } finally {
            setSubmitting(false);
        }
    };

    // Handle Bulk Bill Generation Submit
    const handleGenerateSubmit = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            const payload = {
                className: generateForm.class === "All" ? undefined : generateForm.class,
                month: generateForm.month,
                year: Number(generateForm.year),
                dueDate: generateForm.dueDate,
            };
            await billAPI.generateBills(payload);
            setIsGenerateModalOpen(false);
            fetchBills();
        } catch (err) {
            alert(err.response?.data?.message || "Failed to generate bills");
        } finally {
            setSubmitting(false);
        }
    };

    // Handle Payment Submission
    const handlePaymentSubmit = async (e) => {
        e.preventDefault();
        if (!selectedBill) return;
        try {
            setSubmitting(true);
            await billAPI.recordPayment(selectedBill._id, {
                ...paymentForm,
                amount: Number(paymentForm.amount),
            });
            setIsPaymentModalOpen(false);
            setSelectedBill(null);
            fetchBills();
        } catch (err) {
            alert(err.response?.data?.message || "Failed to record payment");
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusBadge = (status) => {
        const badgeStyles = {
            Unpaid: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
            "Partially Paid": "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
            Paid: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
            Cancelled: "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-400",
            Waived: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400",
        };

        return (
            <span className={`px-2 py-1 text-xs font-medium rounded ${badgeStyles[status] || badgeStyles.Unpaid}`}>
                {status || "Unpaid"}
            </span>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Bills & Payments</h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        Manage student bills, record payments, and download invoices
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsGenerateModalOpen(true)}
                        className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition"
                    >
                        <Plus size={18} />
                        Generate Bills
                    </button>
                    <button
                        onClick={() => setIsManualModalOpen(true)}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                        <Plus size={18} />
                        Manual Bill
                    </button>
                </div>
            </div>

            {/* Filter */}
            <div className="bg-white dark:bg-slate-800 rounded-lg p-4">
                <div className="w-full md:w-48">
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                        Filter by Status
                    </label>
                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none dark:bg-slate-700 dark:text-white"
                    >
                        <option value="">All Status</option>
                        <option value="Unpaid">Unpaid</option>
                        <option value="Partially Paid">Partially Paid</option>
                        <option value="Paid">Paid</option>
                        <option value="Cancelled">Cancelled</option>
                        <option value="Waived">Waived</option>
                    </select>
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex gap-3">
                    <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
                    <div>
                        <h3 className="font-semibold text-red-900 dark:text-red-400">Error</h3>
                        <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
                    </div>
                </div>
            )}

            {/* Table or Empty State */}
            {loading ? (
                <div className="flex items-center justify-center h-96">
                    <Loader size={32} className="animate-spin text-blue-600" />
                </div>
            ) : !Array.isArray(bills) || bills.length === 0 ? (
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-12 text-center">
                    <p className="text-slate-600 dark:text-slate-400 mb-4">No bills found.</p>
                    <div className="flex justify-center gap-3">
                        <button
                            onClick={() => setIsGenerateModalOpen(true)}
                            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition inline-flex items-center gap-2"
                        >
                            <Plus size={18} /> Bulk Generate Bills
                        </button>
                        <button
                            onClick={() => setIsManualModalOpen(true)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition inline-flex items-center gap-2"
                        >
                            <Plus size={18} /> Create Manual Bill
                        </button>
                    </div>
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
                                <tr>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-400">Bill Number</th>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-400">Student</th>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-400">Class</th>
                                    <th className="px-4 py-3 text-right font-semibold text-slate-600 dark:text-slate-400">Amount</th>
                                    <th className="px-4 py-3 text-right font-semibold text-slate-600 dark:text-slate-400">Paid</th>
                                    <th className="px-4 py-3 text-right font-semibold text-slate-600 dark:text-slate-400">Due</th>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-400">Status</th>
                                    <th className="px-4 py-3 text-center font-semibold text-slate-600 dark:text-slate-400">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                {bills.map((bill) => (
                                    <tr key={bill._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition">
                                        <td className="px-4 py-3 font-mono font-semibold text-blue-600">{bill.billNumber}</td>
                                        <td className="px-4 py-3">{bill.studentId?.name || "N/A"}</td>
                                        <td className="px-4 py-3">
                                            <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-xs font-medium rounded">
                                                {bill.studentId?.class ? `Class ${bill.studentId.class}` : "N/A"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right font-semibold">
                                            ₹{(Number(bill.totalAmount) || 0).toLocaleString("en-IN")}
                                        </td>
                                        <td className="px-4 py-3 text-right text-green-600 dark:text-green-400 font-semibold">
                                            ₹{(Number(bill.paidAmount) || 0).toLocaleString("en-IN")}
                                        </td>
                                        <td className="px-4 py-3 text-right text-red-600 dark:text-red-400 font-semibold">
                                            ₹{(Number(bill.balanceDue) || 0).toLocaleString("en-IN")}
                                        </td>
                                        <td className="px-4 py-3">{getStatusBadge(bill.status)}</td>
                                        <td className="px-4 py-3 text-center flex gap-2 justify-center">
                                            <button
                                                onClick={() => handleDownloadPDF(bill._id)}
                                                className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded text-blue-600"
                                                title="Download PDF"
                                            >
                                                <Download size={16} />
                                            </button>
                                            {bill.status !== "Paid" && (
                                                <button
                                                    onClick={() => {
                                                        setSelectedBill(bill);
                                                        setPaymentForm({
                                                            amount: bill.balanceDue || 0,
                                                            paymentMode: "Cash",
                                                            transactionReference: "",
                                                            remarks: "",
                                                        });
                                                        setIsPaymentModalOpen(true);
                                                    }}
                                                    className="p-1 hover:bg-green-100 dark:hover:bg-green-900/30 rounded text-green-600"
                                                    title="Record Payment"
                                                >
                                                    <DollarSign size={16} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal 1: Generate Bills */}
            {isGenerateModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
                        <div className="flex items-center justify-between border-b pb-3 dark:border-slate-700">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Auto-Generate Bills</h3>
                            <button onClick={() => setIsGenerateModalOpen(false)} className="text-slate-500 hover:text-slate-700">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleGenerateSubmit} className="space-y-3">
                            <div>
                                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Target Class *</label>
                                <select
                                    value={generateForm.class}
                                    onChange={(e) => setGenerateForm({ ...generateForm, class: e.target.value })}
                                    className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                >
                                    <option value="All">All Classes</option>
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((c) => (
                                        <option key={c} value={c}>Class {c}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Month *</label>
                                    <select
                                        value={generateForm.month}
                                        onChange={(e) => setGenerateForm({ ...generateForm, month: e.target.value })}
                                        className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                    >
                                        {[
                                            "January", "February", "March", "April", "May", "June",
                                            "July", "August", "September", "October", "November", "December"
                                        ].map((m) => (
                                            <option key={m} value={m}>{m}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Year *</label>
                                    <input
                                        type="number"
                                        value={generateForm.year}
                                        onChange={(e) => setGenerateForm({ ...generateForm, year: e.target.value })}
                                        className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Due Date *</label>
                                <input
                                    type="date"
                                    required
                                    value={generateForm.dueDate}
                                    onChange={(e) => setGenerateForm({ ...generateForm, dueDate: e.target.value })}
                                    className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-3">
                                <button
                                    type="button"
                                    onClick={() => setIsGenerateModalOpen(false)}
                                    className="px-4 py-2 text-sm bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-4 py-2 text-sm bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg disabled:opacity-50"
                                >
                                    {submitting ? "Generating..." : "Generate Bills"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal 2: Manual Bill */}
            {isManualModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
                        <div className="flex items-center justify-between border-b pb-3 dark:border-slate-700">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Create Manual Bill</h3>
                            <button onClick={() => setIsManualModalOpen(false)} className="text-slate-500 hover:text-slate-700">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleManualSubmit} className="space-y-3">
                            <div>
                                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Select Student *</label>
                                <select
                                    required
                                    value={manualForm.studentId}
                                    onChange={(e) => setManualForm({ ...manualForm, studentId: e.target.value })}
                                    className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                >
                                    <option value="">-- Choose Student --</option>
                                    {students.map((s) => (
                                        <option key={s._id} value={s._id}>
                                            {s.name} (Class {s.class}-{s.section}, Roll: {s.rollNumber})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Item Name</label>
                                    <input
                                        type="text"
                                        value={manualForm.items[0].description}
                                        onChange={(e) => {
                                            const items = [...manualForm.items];
                                            items[0].description = e.target.value;
                                            setManualForm({ ...manualForm, items });
                                        }}
                                        className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Amount (₹) *</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        value={manualForm.items[0].amount}
                                        onChange={(e) => {
                                            const items = [...manualForm.items];
                                            items[0].amount = Number(e.target.value);
                                            setManualForm({ ...manualForm, items });
                                        }}
                                        className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Due Date *</label>
                                <input
                                    type="date"
                                    required
                                    value={manualForm.dueDate}
                                    onChange={(e) => setManualForm({ ...manualForm, dueDate: e.target.value })}
                                    className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-3">
                                <button
                                    type="button"
                                    onClick={() => setIsManualModalOpen(false)}
                                    className="px-4 py-2 text-sm bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
                                >
                                    {submitting ? "Saving..." : "Create Bill"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal 3: Record Payment */}
            {isPaymentModalOpen && selectedBill && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
                        <div className="flex items-center justify-between border-b pb-3 dark:border-slate-700">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Record Payment</h3>
                                <p className="text-xs text-slate-500 font-mono">Bill #{selectedBill.billNumber}</p>
                            </div>
                            <button onClick={() => setIsPaymentModalOpen(false)} className="text-slate-500 hover:text-slate-700">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handlePaymentSubmit} className="space-y-3">
                            <div>
                                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                                    Payment Amount (₹) — Max: ₹{selectedBill.balanceDue}
                                </label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    max={selectedBill.balanceDue}
                                    value={paymentForm.amount}
                                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                                    className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Payment Mode</label>
                                <select
                                    value={paymentForm.paymentMode}
                                    onChange={(e) => setPaymentForm({ ...paymentForm, paymentMode: e.target.value })}
                                    className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                >
                                    <option value="Cash">Cash</option>
                                    <option value="UPI">UPI / QR Code</option>
                                    <option value="Bank Transfer">Bank Transfer / NEFT</option>
                                    <option value="Cheque">Cheque</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                                    Transaction Ref / Note
                                </label>
                                <input
                                    type="text"
                                    placeholder="UPI Ref ID or Receipt #"
                                    value={paymentForm.transactionReference}
                                    onChange={(e) => setPaymentForm({ ...paymentForm, transactionReference: e.target.value })}
                                    className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-3">
                                <button
                                    type="button"
                                    onClick={() => setIsPaymentModalOpen(false)}
                                    className="px-4 py-2 text-sm bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50"
                                >
                                    {submitting ? "Recording..." : "Confirm Payment"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}