"use client";
import { useEffect, useState } from "react";
import { getTransactions } from "@/lib/api";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function TransactionsPage() {
    const [data, setData] = useState<any>({ transactions: [], total: 0, page: 1, totalPages: 0 });
    const [typeFilter, setTypeFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        getTransactions(page, 20, typeFilter || undefined, statusFilter || undefined)
            .then(setData)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [page, typeFilter, statusFilter]);

    const badge = (s: string) => {
        const cls = s === "completed" ? "badge-completed" : s === "pending" ? "badge-pending" : s === "failed" ? "badge-rejected" : "badge-active";
        return <span className={`badge ${cls}`}>{s}</span>;
    };

    const typeBadge = (t: string) => {
        const color = t === "buy" ? "#00d2a0" : t === "sell" ? "#3498db" : "#ffa502";
        return (
            <span style={{
                background: `${color}20`, color, padding: "4px 12px",
                borderRadius: 20, fontSize: 12, fontWeight: 600, textTransform: "uppercase",
            }}>
                {t}
            </span>
        );
    };

    return (
        <div className="fade-in">
            <div className="page-header">
                <h1 className="page-title">Transactions</h1>
                <div style={{ color: "var(--text-secondary)", fontSize: 14 }}>{data.total} total</div>
            </div>

            <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
                <select className="input" style={{ width: 160 }} value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}>
                    <option value="">All Types</option>
                    <option value="buy">Buy</option>
                    <option value="sell">Sell</option>
                    <option value="bonus">Bonus</option>
                </select>
                <select className="input" style={{ width: 160 }} value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
                    <option value="">All Status</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                </select>
            </div>

            <div className="glass-card" style={{ overflow: "hidden" }}>
                {loading ? <div className="spinner" /> : (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Reference</th>
                                <th>User</th>
                                <th>Type</th>
                                <th>Amount</th>
                                <th>Reward</th>
                                <th>Status</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.transactions.map((tx: any) => (
                                <tr key={tx.id}>
                                    <td style={{ fontFamily: "monospace", fontSize: 12, color: "var(--text-secondary)" }}>
                                        {tx.referenceId?.slice(0, 12) || tx.id.slice(0, 8)}
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: 600 }}>{tx.user?.fullName || "—"}</div>
                                        <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{tx.user?.phone || ""}</div>
                                    </td>
                                    <td>{typeBadge(tx.type)}</td>
                                    <td style={{ fontWeight: 700 }}>₹{Number(tx.amount).toLocaleString()}</td>
                                    <td style={{ color: "var(--success)" }}>+₹{Number(tx.rewardAmount || 0).toLocaleString()}</td>
                                    <td>{badge(tx.status)}</td>
                                    <td style={{ color: "var(--text-secondary)", fontSize: 13 }}>
                                        {new Date(tx.createdAt).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                                    </td>
                                </tr>
                            ))}
                            {data.transactions.length === 0 && (
                                <tr><td colSpan={7} style={{ textAlign: "center", padding: 40, color: "var(--text-secondary)" }}>No transactions found</td></tr>
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
