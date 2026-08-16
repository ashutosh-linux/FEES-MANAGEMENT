import { useState, useEffect } from "react";
import {
    Plus,
    Download,
    Filter,
    Loader,
    AlertCircle,
    Eye,
    DollarSign,
} from "lucide-react";
import { billAPI } from "../services/api";

export default function Bills() {
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statusFilter, setStatusFilter] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        const fetchBills = async () => {
            try {
                setLoading(true);
                const params = {
                    page: currentPage,
                    limit: 20,
                    status: statusFilter || undefined,
                };

                const response = await billAPI.list(params);

                // Safely extract array across backend structures
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

        const debounceTimer = setTimeout(fetchBills, 300);
        return () => clearTimeout(debounceTimer);
    }, [statusFilter, currentPage]);

    const handleDownloadPDF = async (billId) => {
        try {
            const response = await billAPI.downloadPDF(billId);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `bill-${billId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Error downloading PDF:", err);
            alert("Failed to download PDF");
        }
    };

    const getStatusBadge = (status) => {
        const badgeStyles = {
            Unpaid: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
            "Partially Paid":
                "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
            Paid: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
            Cancelled:
                "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-400",
            Waived:
                "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400",
        };

        return (
            <span
                className={`px-2 py-1 text-xs font-medium rounded ${badgeStyles[status] || badgeStyles.Unpaid
                    }`}
            >
                {status || "Unpaid"}
            </span>
        );
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                        Bills & Payments
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        Manage student bills, record payments, and download invoices
                    </p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition">
                        <Plus size={18} />
                        Generate Bills
                    </button>
                    <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                        <Plus size={18} />
                        Manual Bill
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-slate-800 rounded-lg p-4">
                <div className="flex gap-3 items-end">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                            Filter by Status
                        </label>
                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                        >
                            <option value="">All Status</option>
                            <option value="Unpaid">Unpaid</option>
                            <option value="Partially Paid">Partially Paid</option>
                            <option value="Paid">Paid</option>
                            <option value="Cancelled">Cancelled</option>
                            <option value="Waived">Waived</option>
                        </select>
                    </div>
                    <button className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition flex items-center gap-2">
                        <Filter size={18} />
                        Advanced
                    </button>
                </div>
            </div>

            {/* Error Alert */}
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex gap-3">
                    <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
                    <div>
                        <h3 className="font-semibold text-red-900 dark:text-red-400">
                            Error
                        </h3>
                        <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
                    </div>
                </div>
            )}

            {/* Loading State */}
            {loading ? (
                <div className="flex items-center justify-center h-96">
                    <Loader size={32} className="animate-spin text-blue-600" />
                </div>
            ) : !Array.isArray(bills) || bills.length === 0 ? (
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-12 text-center">
                    <p className="text-slate-600 dark:text-slate-400">
                        No bills found. Generate one to get started.
                    </p>
                </div>
            ) : (
                /* Bills Table */
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
                                <tr>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-400">
                                        Bill Number
                                    </th>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-400">
                                        Student
                                    </th>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-400">
                                        Class
                                    </th>
                                    <th className="px-4 py-3 text-right font-semibold text-slate-600 dark:text-slate-400">
                                        Amount
                                    </th>
                                    <th className="px-4 py-3 text-right font-semibold text-slate-600 dark:text-slate-400">
                                        Paid
                                    </th>
                                    <th className="px-4 py-3 text-right font-semibold text-slate-600 dark:text-slate-400">
                                        Due
                                    </th>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-400">
                                        Status
                                    </th>
                                    <th className="px-4 py-3 text-center font-semibold text-slate-600 dark:text-slate-400">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                {bills.map((bill) => (
                                    <tr
                                        key={bill._id}
                                        className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition"
                                    >
                                        <td className="px-4 py-3 font-mono font-semibold text-blue-600">
                                            {bill.billNumber}
                                        </td>
                                        <td className="px-4 py-3">
                                            {bill.studentId?.name || "Unknown"}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-xs font-medium rounded text-slate-700 dark:text-slate-300">
                                                {bill.studentId?.class}-{bill.studentId?.section}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right font-semibold">
                                            ₹{(Number(bill.totalAmount) || 0).toLocaleString("en-IN", {
                                                maximumFractionDigits: 0,
                                            })}
                                        </td>
                                        <td className="px-4 py-3 text-right text-green-600 dark:text-green-400 font-semibold">
                                            ₹{(Number(bill.paidAmount) || 0).toLocaleString("en-IN", {
                                                maximumFractionDigits: 0,
                                            })}
                                        </td>
                                        <td className="px-4 py-3 text-right text-red-600 dark:text-red-400 font-semibold">
                                            ₹{(Number(bill.balanceDue) || 0).toLocaleString("en-IN", {
                                                maximumFractionDigits: 0,
                                            })}
                                        </td>
                                        <td className="px-4 py-3">
                                            {getStatusBadge(bill.status)}
                                        </td>
                                        <td className="px-4 py-3 text-center flex gap-2 justify-center">
                                            <button
                                                onClick={() => handleDownloadPDF(bill._id)}
                                                className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded transition"
                                                title="Download PDF"
                                            >
                                                <Download size={16} className="text-blue-600" />
                                            </button>
                                            <button
                                                className="p-1 hover:bg-green-100 dark:hover:bg-green-900/30 rounded transition"
                                                title="Record Payment"
                                            >
                                                <DollarSign size={16} className="text-green-600" />
                                            </button>
                                            <button
                                                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition"
                                                title="View Details"
                                            >
                                                <Eye size={16} className="text-slate-600" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage((p) => p - 1)}
                            className="px-3 py-1 border border-slate-300 dark:border-slate-600 rounded hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 transition"
                        >
                            Previous
                        </button>
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                            Page {currentPage}
                        </span>
                        <button
                            onClick={() => setCurrentPage((p) => p + 1)}
                            className="px-3 py-1 border border-slate-300 dark:border-slate-600 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}