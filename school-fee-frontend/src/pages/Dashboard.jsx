import { useState, useEffect } from "react";
import {
    TrendingUp,
    TrendingDown,
    Users,
    AlertCircle,
    Loader,
} from "lucide-react";
import { billAPI, studentAPI } from "../services/api";

export default function Dashboard() {
    const [billStats, setBillStats] = useState(null);
    const [studentStats, setStudentStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const [billRes, studentRes] = await Promise.all([
                    billAPI.stats(),
                    studentAPI.stats(),
                ]);

                setBillStats(billRes.data.data);
                setStudentStats(studentRes.data.data);
                setError(null);
            } catch (err) {
                console.error("Error fetching stats:", err);
                setError(err.response?.data?.message || "Failed to load dashboard");
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader size={32} className="animate-spin text-blue-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex gap-3">
                <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
                <div>
                    <h3 className="font-semibold text-red-900 dark:text-red-400">
                        Error
                    </h3>
                    <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
                </div>
            </div>
        );
    }

    // Calculate totals from status breakdown
    const totalBilled = billStats?.byStatus?.reduce(
        (sum, s) => sum + (s.totalBilled || 0),
        0
    ) || 0;
    const totalPaid = billStats?.byStatus?.reduce(
        (sum, s) => sum + (s.totalPaid || 0),
        0
    ) || 0;
    const totalOutstanding = billStats?.overdue?.totalOutstanding || 0;
    const overdueCount = billStats?.overdue?.count || 0;
    const totalStudents = studentStats?.total || 0;

    const statCards = [
        {
            label: "Total Students",
            value: totalStudents,
            icon: Users,
            color: "blue",
            bgColor: "bg-blue-50 dark:bg-blue-900/20",
            textColor: "text-blue-600 dark:text-blue-400",
            borderColor: "border-blue-200 dark:border-blue-800",
        },
        {
            label: "Total Billed",
            value: `₹${(totalBilled || 0).toLocaleString("en-IN", {
                maximumFractionDigits: 0,
            })}`,
            icon: TrendingUp,
            color: "green",
            bgColor: "bg-green-50 dark:bg-green-900/20",
            textColor: "text-green-600 dark:text-green-400",
            borderColor: "border-green-200 dark:border-green-800",
        },
        {
            label: "Total Collected",
            value: `₹${(totalPaid || 0).toLocaleString("en-IN", {
                maximumFractionDigits: 0,
            })}`,
            icon: TrendingUp,
            color: "emerald",
            bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
            textColor: "text-emerald-600 dark:text-emerald-400",
            borderColor: "border-emerald-200 dark:border-emerald-800",
        },
        {
            label: "Outstanding Dues",
            value: `₹${(totalOutstanding || 0).toLocaleString("en-IN", {
                maximumFractionDigits: 0,
            })}`,
            icon: AlertCircle,
            color: "amber",
            bgColor: "bg-amber-50 dark:bg-amber-900/20",
            textColor: "text-amber-600 dark:text-amber-400",
            borderColor: "border-amber-200 dark:border-amber-800",
        },
        {
            label: "Overdue Bills",
            value: overdueCount,
            icon: TrendingDown,
            color: "red",
            bgColor: "bg-red-50 dark:bg-red-900/20",
            textColor: "text-red-600 dark:text-red-400",
            borderColor: "border-red-200 dark:border-red-800",
        },
    ];

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                    Dashboard
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                    Welcome back! Here's your fee management overview.
                </p>
            </div>

            {/* Stat Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {statCards.map((card, idx) => {
                    const Icon = card.icon;
                    return (
                        <div
                            key={idx}
                            className={`${card.bgColor} border ${card.borderColor} rounded-lg p-4 hover:shadow-md transition`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                                        {card.label}
                                    </p>
                                    <p className={`text-2xl font-bold mt-2 ${card.textColor}`}>
                                        {card.value}
                                    </p>
                                </div>
                                <Icon size={24} className={`${card.textColor} flex-shrink-0`} />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Status Breakdown Table */}
            {billStats?.byStatus && billStats.byStatus.length > 0 && (
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                        Bills by Status
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-700">
                                    <th className="px-4 py-2 text-left font-semibold text-slate-600 dark:text-slate-400">
                                        Status
                                    </th>
                                    <th className="px-4 py-2 text-right font-semibold text-slate-600 dark:text-slate-400">
                                        Count
                                    </th>
                                    <th className="px-4 py-2 text-right font-semibold text-slate-600 dark:text-slate-400">
                                        Total Billed
                                    </th>
                                    <th className="px-4 py-2 text-right font-semibold text-slate-600 dark:text-slate-400">
                                        Total Paid
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {billStats.byStatus.map((status, idx) => (
                                    <tr
                                        key={idx}
                                        className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30"
                                    >
                                        <td className="px-4 py-3 font-medium">{status._id}</td>
                                        <td className="px-4 py-3 text-right">{status.count}</td>
                                        <td className="px-4 py-3 text-right">
                                            ₹{(status.totalBilled || 0).toLocaleString("en-IN", {
                                                maximumFractionDigits: 0,
                                            })}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            ₹{(status.totalPaid || 0).toLocaleString("en-IN", {
                                                maximumFractionDigits: 0,
                                            })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Monthly Collection Chart Placeholder */}
            {billStats?.monthlyCollection && billStats.monthlyCollection.length > 0 && (
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                        Monthly Collections (Current Year)
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
                        {billStats.monthlyCollection.map((month) => (
                            <div
                                key={month._id}
                                className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4 text-center"
                            >
                                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                    Month {month._id}
                                </p>
                                <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                                    ₹{(month.collected || 0).toLocaleString("en-IN", {
                                        maximumFractionDigits: 0,
                                    })}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                    {month.billCount} bills
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
