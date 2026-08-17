import { useState, useEffect } from "react";
import { Plus, Loader, AlertCircle, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";
import { feeStructureAPI } from "../services/api";

export default function FeeStructures() {
    const [structures, setStructures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [classFilter, setClassFilter] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        feeType: "Tuition",
        className: "1",
        amount: "",
        billingCycle: "Monthly",
        description: "",
    });

    const fetchStructures = async () => {
        try {
            setLoading(true);
            const params = {
                page: currentPage,
                limit: 50,
                className: classFilter || undefined,
            };

            const response = await feeStructureAPI.list(params);
            const rawData = response.data?.data;
            const structuresList = Array.isArray(rawData)
                ? rawData
                : rawData?.feeStructures || rawData?.structures || response.data?.feeStructures || [];

            setStructures(Array.isArray(structuresList) ? structuresList : []);
            setError(null);
        } catch (err) {
            console.error("Error fetching fee structures:", err);
            setError(err.response?.data?.message || "Failed to load fee structures");
            setStructures([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const debounceTimer = setTimeout(fetchStructures, 300);
        return () => clearTimeout(debounceTimer);
    }, [classFilter, currentPage]);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAddStructure = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            await feeStructureAPI.create({
                ...formData,
                amount: Number(formData.amount),
            });
            toast.success("Fee structure created successfully!");
            setIsModalOpen(false);
            setFormData({
                feeType: "Tuition",
                className: "1",
                amount: "",
                billingCycle: "Monthly",
                description: "",
            });
            fetchStructures();
        } catch (err) {
            const backendError =
                err.response?.data?.errors?.[0]?.message ||
                err.response?.data?.message ||
                "Failed to add fee item";
            toast.error(backendError);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this fee item?")) return;
        try {
            await feeStructureAPI.delete(id);
            toast.success("Fee item deleted successfully");
            fetchStructures();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to delete fee item");
        }
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Fee Structures</h1>
                    <p className="text-slate-600 dark:text-slate-400">Manage and configure fee schedules</p>
                </div>
                <button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium cursor-pointer"
                >
                    <Plus size={18} />
                    Add Fee Item
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-slate-800 rounded-lg p-4">
                <select
                    value={classFilter}
                    onChange={(e) => {
                        setClassFilter(e.target.value);
                        setCurrentPage(1);
                    }}
                    className="w-full md:w-48 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none dark:bg-slate-700 dark:text-white"
                >
                    <option value="">All Classes</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((cls) => (
                        <option key={cls} value={cls}>Class {cls}</option>
                    ))}
                </select>
            </div>

            {/* Error Alert */}
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex gap-3">
                    <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
                    <div>
                        <h3 className="font-semibold text-red-900 dark:text-red-400">Error</h3>
                        <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
                    </div>
                </div>
            )}

            {/* Content */}
            {loading ? (
                <div className="flex items-center justify-center h-96">
                    <Loader size={32} className="animate-spin text-blue-600" />
                </div>
            ) : !Array.isArray(structures) || structures.length === 0 ? (
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-12 text-center">
                    <p className="text-slate-600 dark:text-slate-400 mb-4">No fee structures found.</p>
                    <button
                        type="button"
                        onClick={() => setIsModalOpen(true)}
                        className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium cursor-pointer"
                    >
                        <Plus size={18} />
                        Add First Fee Item
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {structures.map((structure) => (
                        <div key={structure._id} className="bg-white dark:bg-slate-800 rounded-lg shadow p-4">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white">
                                        {structure.feeType || structure.name}
                                    </h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                        Class {structure.className || structure.class}
                                    </p>
                                </div>
                                <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-xs font-medium rounded">
                                    {structure.billingCycle || "Monthly"}
                                </span>
                            </div>
                            <div className="space-y-2 mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
                                <div className="flex justify-between">
                                    <span className="text-sm text-slate-600 dark:text-slate-400">Amount:</span>
                                    <span className="font-bold text-slate-900 dark:text-white">
                                        ₹{(Number(structure.amount) || 0).toLocaleString("en-IN")}
                                    </span>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => handleDelete(structure._id)}
                                className="w-full py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded hover:bg-red-200 transition text-sm flex items-center justify-center gap-1 cursor-pointer"
                            >
                                <Trash2 size={14} /> Delete
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Fee Item Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[9999] bg-black/70 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between border-b pb-3 dark:border-slate-700">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add Fee Item</h3>
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="text-slate-500 hover:text-slate-700 dark:text-slate-400 cursor-pointer"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleAddStructure} className="space-y-3">
                            <div>
                                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Fee Type *</label>
                                <select
                                    name="feeType"
                                    value={formData.feeType}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                >
                                    <option value="Tuition">Tuition</option>
                                    <option value="Transport">Transport</option>
                                    <option value="Admission">Admission</option>
                                    <option value="Exam">Exam</option>
                                    <option value="Library">Library</option>
                                    <option value="Hostel">Hostel</option>
                                    <option value="Sports">Sports</option>
                                    <option value="Miscellaneous">Miscellaneous</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Class *</label>
                                    <select
                                        name="className"
                                        value={formData.className}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                    >
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((c) => (
                                            <option key={c} value={c}>Class {c}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Amount (₹) *</label>
                                    <input
                                        type="number"
                                        name="amount"
                                        required
                                        min="0"
                                        placeholder="1500"
                                        value={formData.amount}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Billing Cycle *</label>
                                <select
                                    name="billingCycle"
                                    value={formData.billingCycle}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                >
                                    <option value="Monthly">Monthly</option>
                                    <option value="Quarterly">Quarterly</option>
                                    <option value="Annually">Annually</option>
                                    <option value="One-Time">One-Time</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Description (Optional)</label>
                                <input
                                    type="text"
                                    name="description"
                                    placeholder="Optional note"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-sm bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-300 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 cursor-pointer"
                                >
                                    {submitting ? "Saving..." : "Save Fee Item"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}