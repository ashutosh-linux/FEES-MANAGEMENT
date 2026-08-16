import { useState, useEffect } from "react";
import { Plus, Search, Filter, Loader, AlertCircle, Eye, Edit, Trash2 } from "lucide-react";
import { studentAPI } from "../services/api";

export default function Students() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [classFilter, setClassFilter] = useState("");
    const [sectionFilter, setSectionFilter] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                setLoading(true);
                const params = {
                    page: currentPage,
                    limit: 20,
                    search: searchTerm || undefined,
                    class: classFilter || undefined,
                    section: sectionFilter || undefined,
                };

                const response = await studentAPI.list(params);

                // Safely extract array across all backend response structures
                const rawData = response.data?.data;
                const studentList = Array.isArray(rawData)
                    ? rawData
                    : rawData?.students || response.data?.students || [];

                setStudents(Array.isArray(studentList) ? studentList : []);
                setError(null);
            } catch (err) {
                console.error("Error fetching students:", err);
                setError(err.response?.data?.message || "Failed to load students");
                setStudents([]);
            } finally {
                setLoading(false);
            }
        };

        const debounceTimer = setTimeout(fetchStudents, 300);
        return () => clearTimeout(debounceTimer);
    }, [searchTerm, classFilter, sectionFilter, currentPage]);

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                        Students
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        Manage student enrollment and profiles
                    </p>
                </div>
                <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                    <Plus size={18} />
                    Add Student
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-slate-800 rounded-lg p-4 space-y-3">
                <div className="flex gap-3">
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="Search by name, roll number, or parent name..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                        />
                    </div>
                    <button className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition flex items-center gap-2">
                        <Filter size={18} />
                        Advanced
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                            Class
                        </label>
                        <select
                            value={classFilter}
                            onChange={(e) => {
                                setClassFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                        >
                            <option value="">All Classes</option>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((cls) => (
                                <option key={cls} value={cls}>
                                    Class {cls}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                            Section
                        </label>
                        <select
                            value={sectionFilter}
                            onChange={(e) => {
                                setSectionFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                        >
                            <option value="">All Sections</option>
                            <option value="A">Section A</option>
                            <option value="B">Section B</option>
                            <option value="C">Section C</option>
                        </select>
                    </div>
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
            ) : !Array.isArray(students) || students.length === 0 ? (
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-12 text-center">
                    <p className="text-slate-600 dark:text-slate-400">
                        No students found. Try adjusting your filters or click "Add Student" to create one.
                    </p>
                </div>
            ) : (
                /* Students Table */
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
                                <tr>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-400">
                                        Name
                                    </th>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-400">
                                        Roll No.
                                    </th>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-400">
                                        Class
                                    </th>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-400">
                                        Parent
                                    </th>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-400">
                                        Contact
                                    </th>
                                    <th className="px-4 py-3 text-center font-semibold text-slate-600 dark:text-slate-400">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                {students.map((student) => (
                                    <tr
                                        key={student._id}
                                        className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition"
                                    >
                                        <td className="px-4 py-3 font-medium">{student.name}</td>
                                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                                            {student.rollNumber}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-medium rounded">
                                                {student.class}-{student.section}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                                            {student.parentName}
                                        </td>
                                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                                            {student.contactNumber}
                                        </td>
                                        <td className="px-4 py-3 text-center flex gap-2 justify-center">
                                            <button
                                                className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded transition"
                                                title="View"
                                            >
                                                <Eye size={16} className="text-blue-600" />
                                            </button>
                                            <button
                                                className="p-1 hover:bg-amber-100 dark:hover:bg-amber-900/30 rounded transition"
                                                title="Edit"
                                            >
                                                <Edit size={16} className="text-amber-600" />
                                            </button>
                                            <button
                                                className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition"
                                                title="Delete"
                                            >
                                                <Trash2 size={16} className="text-red-600" />
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