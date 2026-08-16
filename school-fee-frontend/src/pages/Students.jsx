import { useState, useEffect } from "react";
import { Plus, Filter, Loader, AlertCircle, Trash2, X } from "lucide-react";
import { studentAPI } from "../services/api";

export default function Students() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [classFilter, setClassFilter] = useState("");
    const [sectionFilter, setSectionFilter] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        rollNumber: "",
        class: "1",
        section: "A",
        parentName: "",
        contactNumber: "",
    });

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

    useEffect(() => {
        const debounceTimer = setTimeout(fetchStudents, 300);
        return () => clearTimeout(debounceTimer);
    }, [searchTerm, classFilter, sectionFilter, currentPage]);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAddStudent = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            await studentAPI.create(formData);
            setIsModalOpen(false);
            setFormData({
                name: "",
                rollNumber: "",
                class: "1",
                section: "A",
                parentName: "",
                contactNumber: "",
            });
            fetchStudents();
        } catch (err) {
            alert(err.response?.data?.message || "Failed to add student");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this student?")) return;
        try {
            await studentAPI.delete(id);
            fetchStudents();
        } catch (err) {
            alert(err.response?.data?.message || "Failed to delete student");
        }
    };

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
                <button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium cursor-pointer"
                >
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
                        <h3 className="font-semibold text-red-900 dark:text-red-400">Error</h3>
                        <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
                    </div>
                </div>
            )}

            {/* Content Area */}
            {loading ? (
                <div className="flex items-center justify-center h-96">
                    <Loader size={32} className="animate-spin text-blue-600" />
                </div>
            ) : !Array.isArray(students) || students.length === 0 ? (
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-12 text-center">
                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                        No students found.
                    </p>
                    <button
                        type="button"
                        onClick={() => setIsModalOpen(true)}
                        className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium cursor-pointer"
                    >
                        <Plus size={18} />
                        Add First Student
                    </button>
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
                                <tr>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-400">Name</th>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-400">Roll No.</th>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-400">Class</th>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-400">Parent</th>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-400">Contact</th>
                                    <th className="px-4 py-3 text-center font-semibold text-slate-600 dark:text-slate-400">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                {students.map((student) => (
                                    <tr key={student._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition">
                                        <td className="px-4 py-3 font-medium">{student.name}</td>
                                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{student.rollNumber}</td>
                                        <td className="px-4 py-3">
                                            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-medium rounded">
                                                {student.class}-{student.section}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{student.parentName}</td>
                                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{student.contactNumber}</td>
                                        <td className="px-4 py-3 text-center">
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(student._id)}
                                                className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition text-red-600 cursor-pointer"
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Add Student Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[9999] bg-black/70 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between border-b pb-3 dark:border-slate-700">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add New Student</h3>
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="text-slate-500 hover:text-slate-700 dark:text-slate-400 cursor-pointer"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleAddStudent} className="space-y-3">
                            <div>
                                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    placeholder="e.g. Rahul Sharma"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Roll Number *</label>
                                    <input
                                        type="text"
                                        name="rollNumber"
                                        required
                                        placeholder="101"
                                        value={formData.rollNumber}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Class *</label>
                                    <select
                                        name="class"
                                        value={formData.class}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                    >
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((c) => (
                                            <option key={c} value={c}>Class {c}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Section</label>
                                    <select
                                        name="section"
                                        value={formData.section}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                    >
                                        <option value="A">Section A</option>
                                        <option value="B">Section B</option>
                                        <option value="C">Section C</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Contact Number</label>
                                    <input
                                        type="text"
                                        name="contactNumber"
                                        placeholder="9876543210"
                                        value={formData.contactNumber}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Parent Name</label>
                                <input
                                    type="text"
                                    name="parentName"
                                    placeholder="Parent / Guardian Name"
                                    value={formData.parentName}
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
                                    {submitting ? "Saving..." : "Save Student"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}