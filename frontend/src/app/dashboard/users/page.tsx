"use client";
import { useEffect, useState } from "react";
import { getUsers, updateUserStatus } from "@/lib/api";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

export default function UsersPage() {
    const [data, setData] = useState<any>({ users: [], total: 0, page: 1, totalPages: 0 });
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);

    const fetchUsers = () => {
        setLoading(true);
        getUsers(page, 15, search || undefined, statusFilter || undefined)
            .then(setData)
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchUsers(); }, [page, statusFilter]);

    const handleStatusChange = async (userId: string, status: string) => {
        if (!confirm(`Are you sure you want to ${status} this user?`)) return;
        try {
            await updateUserStatus(userId, status);
            fetchUsers();
        } catch (e: any) { alert(e.message); }
    };

    const badge = (s: string) => {
        const cls = s === "active" ? "badge-active" : s === "suspended" ? "badge-suspended" : s === "banned" ? "badge-rejected" : "badge-pending";
        return <span className={`badge ${cls}`}>{s}</span>;
    };

    return (
        <div className="fade-in">
            <div className="page-header">
                <h1 className="page-title">Users</h1>
                <div style={{ color: "var(--text-secondary)", fontSize: 14 }}>{data.total} total users</div>
            </div>

            {/* Filters */}
            <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
                <div style={{ position: "relative", flex: 1, maxWidth: 400 }}>
                    <Search size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)" }} />
                    <input
                        className="input"
                        placeholder="Search by name, phone, email..."
                        style={{ paddingLeft: 40 }}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") { setPage(1); fetchUsers(); } }}
                    />
                </div>
                <select className="input" style={{ width: 160 }} value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="banned">Banned</option>
                </select>
            </div>

            {/* Table */}
            <div className="glass-card" style={{ overflow: "hidden" }}>
                {loading ? <div className="spinner" /> : (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Phone</th>
                                <th>Balance</th>
                                <th>Earned</th>
                                <th>Status</th>
                                <th>Joined</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.users.map((u: any) => (
                                <tr key={u.id}>
                                    <td>
                                        <div style={{ fontWeight: 600 }}>{u.fullName}</div>
                                        <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{u.email || "—"}</div>
                                    </td>
                                    <td>{u.phone}</td>
                                    <td style={{ fontWeight: 600 }}>₹{(u.wallet?.balance || 0).toLocaleString()}</td>
                                    <td>₹{(u.wallet?.totalEarned || 0).toLocaleString()}</td>
                                    <td>{badge(u.status)}</td>
                                    <td style={{ color: "var(--text-secondary)", fontSize: 13 }}>
                                        {new Date(u.createdAt).toLocaleDateString("en-IN")}
                                    </td>
                                    <td>
                                        <div style={{ display: "flex", gap: 6 }}>
                                            {u.status === "active" ? (
                                                <button className="btn btn-danger btn-sm" onClick={() => handleStatusChange(u.id, "suspended")}>
                                                    Suspend
                                                </button>
                                            ) : (
                                                <button className="btn btn-success btn-sm" onClick={() => handleStatusChange(u.id, "active")}>
                                                    Activate
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {data.users.length === 0 && (
                                <tr><td colSpan={7} style={{ textAlign: "center", padding: 40, color: "var(--text-secondary)" }}>No users found</td></tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination */}
            {data.totalPages > 1 && (
                <div className="pagination">
                    <button className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                        <ChevronLeft size={16} /> Prev
                    </button>
                    <span style={{ color: "var(--text-secondary)", fontSize: 13 }}>
                        Page {data.page} of {data.totalPages}
                    </span>
                    <button className="btn btn-ghost btn-sm" disabled={page >= data.totalPages} onClick={() => setPage(page + 1)}>
                        Next <ChevronRight size={16} />
                    </button>
                </div>
            )}
        </div>
    );
}
