import { useState } from "react";

import { Outlet } from "react-router-dom";

import Sidebar from "../components/common/Sidebar";

import TopNavbar from "../components/common/TopNavbar";


export default function DashboardLayout() {
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-slate-50">

            <Sidebar mobileOpen={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />

            <div className="flex min-w-0 flex-1 flex-col">

                <TopNavbar onMenuClick={() => setMobileSidebarOpen(true)} />

                <main className="flex-1 p-4 sm:p-6 lg:p-8">
                    <Outlet />

                </main>

            </div>

        </div>
    )
}