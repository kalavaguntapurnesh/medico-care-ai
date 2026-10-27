import { useEffect, useMemo, useState } from "react";

import { getAllUsers } from "../../services/user.service";

import type { User } from "../../types/user";

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let cancelled = false;

        async function loadUsers() {
            try {
                setLoading(true);
                setError('');
                const data = await getAllUsers();

                if (!cancelled) {
                    setUsers(data)
                }
            } catch (error) {
                if (!cancelled) {
                    setError('Unable to load users. Check your permissions and try again.');
                }
            }
            finally {
                if (!cancelled) {
                    setLoading(false)
                }
            }
        }

        void loadUsers();

        return () => {
            cancelled = true;
        };
    }, [])


    const filteredUsers = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (!query) return users;

        return users.filter((user) => {
            const name = `${user.firstName ?? ''} ${user.lastName ?? ''}`;

            return (
                name.toLowerCase().includes(query) ||
                user.email.toLowerCase().includes(query)
            );
        });
    }, [users, search]);


    return (

        <main className="space-y-6 p-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">
                    User Management
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                    View and search registered users.
                </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4">
                <label
                    htmlFor="user-search"
                    className="mb-2 block text-sm font-medium text-gray-700"
                >
                    Search users
                </label>

                <input
                    id="user-search"
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search by name or email..."
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
            </div>

            {loading && (
                <p className="text-sm text-gray-500">Loading users...</p>
            )}

            {!loading && error && (
                <div
                    role="alert"
                    className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                >
                    {error}
                </div>
            )}

            {!loading && !error && (
                <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-600">
                            <tr>
                                <th className="px-5 py-3 font-medium">Name</th>
                                <th className="px-5 py-3 font-medium">Email</th>
                                <th className="px-5 py-3 font-medium">Role</th>
                                <th className="px-5 py-3 font-medium">Status</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="px-5 py-4 font-medium text-gray-900">
                                        {[user.firstName, user.lastName]
                                            .filter(Boolean)
                                            .join(' ') || '—'}
                                    </td>
                                    <td className="px-5 py-4 text-gray-600">
                                        {user.email}
                                    </td>
                                    <td className="px-5 py-4">
                                        {user.role}
                                    </td>
                                    <td className="px-5 py-4">
                                        {user.status ?? '—'}
                                    </td>
                                </tr>
                            ))}

                            {filteredUsers.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="px-5 py-10 text-center text-gray-500"
                                    >
                                        No users found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </main>
    )
}