"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard, Users, ArrowLeftRight, Wallet, Settings,
    Trophy, LogOut, Flower2
} from "lucide-react";

const links = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/users", label: "Users", icon: Users },
    { href: "/dashboard/transactions", label: "Transactions", icon: ArrowLeftRight },
    { href: "/dashboard/withdrawals", label: "Withdrawals", icon: Wallet },
    { href: "/dashboard/leaderboard", label: "Leaderboard", icon: Trophy },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
    const pathname = usePathname();

    const handleLogout = () => {
        localStorage.removeItem("admin_token");
        window.location.href = "/";
    };

    return (
        <aside className="sidebar">
            <div style={{ padding: "24px 20px", borderBottom: "1px solid var(--border)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                        width: 40, height: 40, borderRadius: 12,
                        background: "linear-gradient(135deg, #6c5ce7, #a29bfe)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                        <Flower2 size={22} color="white" />
                    </div>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: 16 }}>Lotus365</div>
                        <div style={{ fontSize: 11, color: "var(--text-secondary)", letterSpacing: 1 }}>ADMIN PANEL</div>
                    </div>
                </div>
            </div>

            <nav style={{ flex: 1, padding: "16px 0", overflowY: "auto" }}>
                {links.map(({ href, label, icon: Icon }) => (
                    <Link
                        key={href}
                        href={href}
                        className={`sidebar-link ${pathname === href ? "active" : ""}`}
                    >
                        <Icon size={18} />
                        {label}
                    </Link>
                ))}
            </nav>

            <div style={{ padding: "16px 12px", borderTop: "1px solid var(--border)" }}>
                <button onClick={handleLogout} className="sidebar-link" style={{ width: "100%", border: "none", background: "none", cursor: "pointer" }}>
                    <LogOut size={18} />
                    Logout
                </button>
            </div>
        </aside>
    );
}
