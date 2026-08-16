import { LayoutDashboard, Users, FileText, ReceiptIndianRupee, X } from "lucide-react";

export default function Sidebar({ isOpen, onClose, activeView, onViewChange }) {
    const navItems = [
        {
            id: "dashboard",
            label: "Dashboard",
            icon: LayoutDashboard,
            description: "Overview & Statistics",
        },
        {
            id: "students",
            label: "Students",
            icon: Users,
            description: "Manage Students",
        },
        {
            id: "fee-structures",
            label: "Fee Structures",
            icon: FileText,
            description: "Fee Schedules",
        },
        {
            id: "bills",
            label: "Bills & Payments",
            icon: ReceiptIndianRupee,
            description: "Billing Hub",
        },
    ];

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 md:hidden z-30"
                    onClick={onClose}
                ></div>
            )}

            {/* Sidebar */}
            <aside
                className={`fixed md:relative top-0 left-0 h-screen w-64 bg-slate-900 dark:bg-slate-950 text-white transition-transform duration-300 z-40 md:z-0 ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
                    }`}
            >
                <div className="flex flex-col h-full">
                    {/* Close Button (Mobile Only) */}
                    <div className="flex items-center justify-between p-4 md:hidden border-b border-slate-800">
                        <h2 className="font-bold text-lg">Menu</h2>
                        <button onClick={onClose} className="p-1">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Logo / Branding */}
                    <div className="hidden md:block p-4 border-b border-slate-800">
                        <div className="text-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg mx-auto mb-2 flex items-center justify-center font-bold">
                                SF
                            </div>
                            <h1 className="font-bold text-sm">School Fee</h1>
                            <p className="text-xs text-slate-400">Management</p>
                        </div>
                    </div>

                    {/* Navigation Items */}
                    <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeView === item.id;

                            return (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        onViewChange(item.id);
                                        onClose(); // Close sidebar on mobile after selection
                                    }}
                                    className={`w-full flex items-start gap-3 px-4 py-3 rounded-lg transition ${isActive
                                            ? "bg-blue-600 text-white shadow-lg"
                                            : "text-slate-300 hover:bg-slate-800 hover:text-white"
                                        }`}
                                >
                                    <Icon size={20} className="flex-shrink-0 mt-0.5" />
                                    <div className="text-left">
                                        <p className="font-medium text-sm">{item.label}</p>
                                        <p className="text-xs opacity-75">{item.description}</p>
                                    </div>
                                </button>
                            );
                        })}
                    </nav>

                    {/* Footer / Version Info */}
                    <div className="p-4 border-t border-slate-800">
                        <p className="text-xs text-slate-500 text-center">
                            v1.0.0 - Phase 3<br />
                            © 2024 School Management
                        </p>
                    </div>
                </div>
            </aside>
        </>
    );
}
