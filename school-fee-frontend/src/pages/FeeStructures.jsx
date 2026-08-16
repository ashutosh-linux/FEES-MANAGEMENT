import { useState, useEffect } from "react";
import { Plus, Search, Loader, AlertCircle, Edit, Trash2 } from "lucide-react";
import { feeStructureAPI } from "../services/api";

export default function FeeStructures() {
    const [structures, setStructures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [classFilter, setClassFilter] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        const fetchStructures = async () => {
            try {
                setLoading(true);
                const params = {
                    page: currentPage,
                    limit: 50,
                    className: classFilter || undefined,
                };

                const response = await feeStructureAPI.list(params);
                setStructures(response.data.data);
                setError(null);
            } catch (err) {
                console.error("Error fetching fee structures:", err);
                setError(
                    err.response?.data?.message || "Failed to load fee structures"
                );
            } finally {
                setLoading(false);
            }
        };

        const debounceTimer = setTimeout(fetchStructures, 300);
        return () => clearTimeout(debounceTimer);
    }, [classFilter, currentPage]);

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                        Fee Structures
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        Manage and configure fee schedules for all classes
                    </p>
                </div>
                <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                    <Plus size={18} />
                    Add Fee Item
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-slate-800 rounded-lg p-4">
                <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                        Filter by Class
                    </label>
                    <select
                        value={classFilter}
                        onChange={(e) => {
                            setClassFilter(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="w-full md:w-48 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                    >
                        <option value="">All Classes</option>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((cls) => (
                            <option key={cls} value={cls}>
                                Class {cls}
                            </option>
                        ))}
                    </select>
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
            ) : structures.length === 0 ? (
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-12 text-center">
                    <p className="text-slate-600 dark:text-slate-400">
                        No fee structures found. Create one to get started.
                    </p>
                </div>
            ) : (
                /* Fee Structures Grid */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {structures.map((structure) => (
                        <div
                            key={structure._id}
                            className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 hover:shadow-md transition"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white">
                                        {structure.feeType}
                                    </h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                        Class {structure.className}
                                    </p>
                                </div>
                                <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-xs font-medium rounded text-slate-700 dark:text-slate-300">
                                    {structure.billingCycle}
                                </span>
                            </div>

                            <div className="space-y-2 mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
                                <div className="flex justify-between">
                                    <span className="text-sm text-slate-600 dark:text-slate-400">
                                        Amount:
                                    </span>
                                    <span className="font-bold text-slate-900 dark:text-white">
                                        ₹{structure.amount.toLocaleString("en-IN")}
                                    </span>
                                </div>
                                {structure.description && (
                                    <p className="text-xs text-slate-600 dark:text-slate-400 italic">
                                        {structure.description}
                                    </p>
                                )}
                            </div>

                            <div className="flex gap-2">
                                <button className="flex-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50 transition text-sm font-medium flex items-center justify-center gap-1">
                                    <Edit size={14} />
                                    Edit
                                </button>
                                <button className="flex-1 px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-900/50 transition text-sm font-medium flex items-center justify-center gap-1">
                                    <Trash2 size={14} />
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
