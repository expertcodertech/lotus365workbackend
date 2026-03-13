"use client";
import { useEffect, useState } from "react";
import { getDashboard, getAnalytics } from "@/lib/api";
import { Users, ArrowLeftRight, Wallet, TrendingUp, UserPlus, Clock } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function DashboardPage() {
    const [stats, setStats] = useState<any>(null);
    const [analytics, setAnalytics] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([getDashboard(), getAnalytics(7)])
            .then(([s, a]) => { setStats(s); setAnalytics(a); })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="spinner" />;

    const statCards = [
        { label: "Total Users", value: stats?.totalUsers || 0, icon: Users, color: "#6c5ce7" },
        { label: "Active Users", value: stats?.activeUsers || 0, icon: UserPlus, color: "#00d2a0" },
        { label: "Total Transactions", value: stats?.totalTransactions || 0, icon: ArrowLeftRight, color: "#3498db" },
        { label: "Pending Withdrawals", value: stats?.pendingWithdrawals || 0, icon: Clock, color: "#ffa502" },
        { label: "Total Paid Out", value: `₹${(stats?.totalPaidOut || 0).toLocaleString()}`, icon: Wallet, color: "#e74c3c" },
        { label: "Today New Users", value: stats?.todayNewUsers || 0, icon: TrendingUp, color: "#a29bfe" },
    ];

    return (
        <div className="fade-in">
            <div className="page-header">
                <h1 className="page-title">Dashboard</h1>
                <div style={{ color: "var(--text-secondary)", fontSize: 13 }}>
                    {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                </div>
            </div>

            {/* Stats */}
            <div className="stats-grid">
                {statCards.map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="stat-card">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <div>
                                <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 8 }}>{label}</div>
                                <div style={{ fontSize: 28, fontWeight: 800 }}>{value}</div>
                            </div>
                            <div style={{
                                width: 44, height: 44, borderRadius: 12,
                                background: `${color}20`, display: "flex", alignItems: "center", justifyContent: "center",
                            }}>
                                <Icon size={22} color={color} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts */}
            <div className="grid-2">
                <div className="glass-card" style={{ padding: 24 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Transaction Volume (7 days)</h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <AreaChart data={analytics?.dailyTransactions || []}>
                            <defs>
                                <linearGradient id="txGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6c5ce7" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#6c5ce7" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="date" tick={{ fill: "#8888aa", fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: "#8888aa", fontSize: 11 }} axisLine={false} tickLine={false} />
                            <Tooltip
                                contentStyle={{ background: "#1a1a2e", border: "1px solid #2a2a45", borderRadius: 10, fontSize: 12 }}
                            />
                            <Area type="monotone" dataKey="count" stroke="#6c5ce7" strokeWidth={2} fill="url(#txGrad)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className="glass-card" style={{ padding: 24 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>New Users (7 days)</h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <AreaChart data={analytics?.dailySignups || []}>
                            <defs>
                                <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#00d2a0" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#00d2a0" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="date" tick={{ fill: "#8888aa", fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: "#8888aa", fontSize: 11 }} axisLine={false} tickLine={false} />
                            <Tooltip
                                contentStyle={{ background: "#1a1a2e", border: "1px solid #2a2a45", borderRadius: 10, fontSize: 12 }}
                            />
                            <Area type="monotone" dataKey="count" stroke="#00d2a0" strokeWidth={2} fill="url(#userGrad)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
