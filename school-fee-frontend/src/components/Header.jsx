import { Menu, LogOut, Bell, Settings } from "lucide-react";

export default function Header({ onToggleSidebar, schoolName = "School Fee Management" }) {
    return (
        <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40 shadow-sm">
            <div className="flex items-center justify-between px-4 py-3 md:px-6 md:py-4">
                {/* Left Section: Menu Toggle + School Name */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={onToggleSidebar}
                        className="md:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
                        aria-label="Toggle sidebar"
                    >
                        <Menu size={20} className="text-slate-600 dark:text-slate-400" />
                    </button>

                    <div className="hidden md:block">
                        <h1 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white">
                            {schoolName}
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Fee Management System
                        </p>
                    </div>
                </div>

                {/* Right Section: Notifications + Settings + Logout */}
                <div className="flex items-center gap-2 md:gap-4">
                    {/* Notifications */}
                    <button
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition relative"
                        aria-label="Notifications"
                    >
                        <Bell size={20} className="text-slate-600 dark:text-slate-400" />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                    </button>

                    {/* Settings */}
                    <button
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
                        aria-label="Settings"
                    >
                        <Settings size={20} className="text-slate-600 dark:text-slate-400" />
                    </button>

                    {/* Logout */}
                    <button
                        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                        aria-label="Logout"
                    >
                        <LogOut size={20} className="text-slate-600 dark:text-slate-400 hover:text-red-600" />
                    </button>
                </div>
            </div>
        </header>
    );
}
