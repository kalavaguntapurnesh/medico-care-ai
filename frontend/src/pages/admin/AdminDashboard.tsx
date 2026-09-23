import { useAuth } from "../../context/AuthContext";


export default function AdminDashboard() {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="mx-auto max-w-7xl">
                <div className="flex items-center justify-between">
                    <div>
                        <h1>Admin Dashboard</h1>

                        <p className="mt-2 text-slate-500">
                            Welcome, {user?.email}
                        </p>
                    </div>

                    <button
                        onClick={logout}
                        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </div>
    )
}