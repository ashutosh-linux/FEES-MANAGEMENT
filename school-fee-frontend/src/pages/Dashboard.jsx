import { useState, useEffect } from "react";
import {
    Users,
    CreditCard,
    DollarSign,
    AlertCircle,
    TrendingUp,
    ArrowUpRight,
    RefreshCw,
} from "lucide-react";
import { Link } from "react-router-dom";
import { billAPI, studentAPI } from "../services/api";

export default function Dashboard() {
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalBilled: 0,
        totalCollected: 0,
        outstandingDues: 0,
        overdueBills: 0,
    });
    const [loading, setLoading] = useState(true);
    const [recentBills, setRecentBills] = useState([]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [studentsRes, billsRes] = await Promise.allSettled([
                studentAPI.list({ limit: 1 }),
                billAPI.list({ limit: 200 }),
            ]);

            // Extract total student count
            let totalStudents = 0;
            if (studentsRes.status === "fulfilled") {
                const sData = studentsRes.value.data?.data;
                totalStudents =
                    studentsRes.value.data?.pagination?.total ||
                    (Array.isArray(sData) ? sData.length : sData?.students?.length || 0);
            }

            // Calculate billing metrics
            let totalBilled = 0;
            let totalCollected = 0;
            let outstandingDues = 0;
            let overdueBills = 0;
            let billsList = [];

            if (billsRes.status === "fulfilled") {
                const bData = billsRes.value.data?.data;
                billsList = Array.isArray(bData) ? bData : bData?.bills || [];

                const now = new Date();
                billsList.forEach((bill) => {
                    totalBilled += Number(bill.totalAmount) || 0;
                    totalCollected += Number(bill.paidAmount) || 0;
                    outstandingDues += Number(bill.balanceDue) || 0;

                    if (bill.dueDate && new Date(bill.dueDate) < now && bill.status !== "Paid") {
                        overdueBills += 1;
                    }
                });
            }

            setStats({
                totalStudents,
                totalBilled,
                totalCollected,
                outstandingDues,
                overdueBills,
            });
            setRecentBills(billsList.slice(0, 5));
        } catch (err) {
            console.error("Error loading dashboard metrics:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const statCards = [
        {
            title: "Total Students",
            value: stats.totalStudents,
            icon: Users,
            color: "text-blue-500",
            bgColor: "bg-blue-500/10 border-blue-500/20",
            isCurrency: false,
        },
        {
            title: "Total Billed",
            value: stats.totalBilled,
            icon: CreditCard,
            color: "text-emerald-500",
            bgColor: "bg-emerald-500/10 border-emerald-500/20",
            isCurrency: true,
        },
        {
            title: "Total Collected",
            value: stats.totalCollected,
            icon: TrendingUp,
            color: "text-green-400",
            bgColor: "bg-green-500/10 border-green-500/20",
            isCurrency: true,
        },
        {
            title: "Outstanding Dues",
            value: stats.outstandingDues,
            icon: AlertCircle,
            color: "text-amber-500",
            bgColor: "bg-amber-500/10 border-amber-500/20",
            isCurrency: true,
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        Live financial and enrollment overview
                    </p>
                </div>
                <button
                    onClick={fetchDashboardData}
                    disabled={loading}
                    className="flex items-center gap-2 px-3 py-2 text-sm bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition disabled:opacity-50"
                >
                    <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                    Refresh Stats
                </button>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((card, idx) => {
                    const Icon = card.icon;
                    return (
                        <div
                            key={idx}
                            className={`p-5 rounded-xl border ${card.bgColor} bg-white dark:bg-slate-800 transition shadow-sm`}
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-xs uppercase font-semibold text-slate-500 dark:text-slate-400">
                                    {card.title}
                                </span>
                                <Icon className={card.color} size={20} />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
                                {loading
                                    ? "..."
                                    : card.isCurrency
                                        ? `₹${card.value.toLocaleString("en-IN")}`
                                        : card.value}
                            </h2>
                        </div>
                    );
                })}
            </div>

            {/* Recent Invoices Snapshot */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-5 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                        Recent Billing Activity
                    </h2>
                    <Link
                        to="/bills"
                        className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium"
                    >
                        View all <ArrowUpRight size={16} />
                    </Link>
                </div>

                {loading ? (
                    <p className="text-slate-500 text-sm py-4">Loading activity...</p>
                ) : recentBills.length === 0 ? (
                    <p className="text-slate-500 text-sm py-4">No recent bills generated yet.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700 pb-2">
                                    <th className="pb-2 font-medium">Bill No.</th>
                                    <th className="pb-2 font-medium">Student</th>
                                    <th className="pb-2 font-medium">Amount</th>
                                    <th className="pb-2 font-medium">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                                {recentBills.map((bill) => (
                                    <tr key={bill._id} className="text-slate-700 dark:text-slate-300">
                                        <td className="py-2.5 font-mono text-blue-500 font-semibold">
                                            {bill.billNumber}
                                        </td>
                                        <td className="py-2.5">{bill.studentId?.name || "N/A"}</td>
                                        <td className="py-2.5 font-semibold">
                                            ₹{(Number(bill.totalAmount) || 0).toLocaleString("en-IN")}
                                        </td>
                                        <td className="py-2.5">
                                            <span
                                                className={`px-2 py-0.5 text-xs font-semibold rounded ${bill.status === "Paid"
                                                    ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                                                    : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                                                    }`}
                                            >
                                                {bill.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}