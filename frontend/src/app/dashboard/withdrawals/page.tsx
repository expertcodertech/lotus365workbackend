"use client";
import { useEffect, useState } from "react";
import { getWithdrawals, processWithdrawal } from "@/lib/api";
import { ChevronLeft, ChevronRight, Check, X } from "lucide-react";

export default function WithdrawalsPage() {
    const [data, setData] = useState<any>({ withdrawals: [], total: 0, page: 1, totalPages: 0 });
    const [statusFilter, setStatusFilter] = useState("pending");
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState<string | null>(null);

    const fetchData = () => {
        setLoading(true);
        getWithdrawals(page, 20, statusFilter || undefined)
            .then(setData)
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchData(); }, [page, statusFilter]);

    const handleAction = async (id: string, action: "approve" | "reject") => {
        const note = action === "reject" ? prompt("Reason for rejection:") : undefined;
        if (action === "reject" && note === null) return; // cancelled
        setProcessing(id);
        try {
            await processWithdrawal(id, action, note || undefined);
            fetchData();
        } catch (e: any) {
            alert(e.message);
        } finally {
            setProcessing(null);
        }
    };

    const badge = (s: string) => {
        const cls = s === "approved" || s === "completed" ? "badge-approved" : s === "rejected" ? "badge-rejected" : s === "pending" ? "badge-pending" : "badge-active";
        return <span className={`badge ${cls}`}>{s}</span>;
    };

    return (
        <div className="fade-in">
            <div className="page-header">
                <h1 className="page-title">Withdrawals</h1>
                <div style={{ color: "var(--text-secondary)", fontSize: 14 }}>{data.total} total</div>
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
                {["pending", "approved", "rejected", ""].map((s) => (
                    <button
                        key={s}
                        className={`btn ${statusFilter === s ? "btn-primary" : "btn-ghost"} btn-sm`}
                        onClick={() => { setStatusFilter(s); setPage(1); }}
                    >
                        {s || "All"}
                    </button>
                ))}
            </div>

            <div className="glass-card" style={{ overflow: "hidden" }}>
                {loading ? <div className="spinner" /> : (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Amount</th>
                                <th>Method</th>
                                <th>Details</th>
                                <th>Status</th>
                                <th>Requested</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.withdrawals.map((w: any) => (
                                <tr key={w.id}>
                                    <td>
                                        <div style={{ fontWeight: 600 }}>{w.user?.fullName || "—"}</div>
                                        <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{w.user?.phone || ""}</div>
                                    </td>
                                    <td style={{ fontWeight: 700, fontSize: 16 }}>₹{Number(w.amount).toLocaleString()}</td>
                                    <td>
                                        <span style={{
                                            background: w.paymentMethod === "upi" ? "#6c5ce720" : "#3498db20",
                                            color: w.paymentMethod === "upi" ? "#6c5ce7" : "#3498db",
                                            padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600, textTransform: "uppercase",
                                        }}>
                                            {w.paymentMethod}
                                        </span>
                                    </td>
                                    <td style={{ fontSize: 13 }}>
                                        {w.paymentDetails?.upiId || `${w.paymentDetails?.bankName || ""} ${w.paymentDetails?.accountNo?.slice(-4) || ""}`}
                                    </td>
                                    <td>{badge(w.status)}</td>
                                    <td style={{ color: "var(--text-secondary)", fontSize: 13 }}>
                                        {new Date(w.createdAt).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                                    </td>
                                    <td>
                                        {w.status === "pending" ? (
                                            <div style={{ display: "flex", gap: 6 }}>
                                                <button
                                                    className="btn btn-success btn-sm"
                                                    disabled={processing === w.id}
                                                    onClick={() => handleAction(w.id, "approve")}
                                                >
                                                    <Check size={14} /> Approve
                                                </button>
                                                <button
                                                    className="btn btn-danger btn-sm"
                                                    disabled={processing === w.id}
                                                    onClick={() => handleAction(w.id, "reject")}
                                                >
                                                    <X size={14} /> Reject
                                                </button>
                                            </div>
                                        ) : (
                                            <span style={{ color: "var(--text-secondary)", fontSize: 12 }}>—</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {data.withdrawals.length === 0 && (
                                <tr><td colSpan={7} style={{ textAlign: "center", padding: 40, color: "var(--text-secondary)" }}>No withdrawals found</td></tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {data.totalPages > 1 && (
                <div className="pagination">
                    <button className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => setPage(page - 1)}><ChevronLeft size={16} /> Prev</button>
                    <span style={{ color: "var(--text-secondary)", fontSize: 13 }}>Page {data.page} of {data.totalPages}</span>
                    <button className="btn btn-ghost btn-sm" disabled={page >= data.totalPages} onClick={() => setPage(page + 1)}>Next <ChevronRight size={16} /></button>
                </div>
            )}
        </div>
    );
}
