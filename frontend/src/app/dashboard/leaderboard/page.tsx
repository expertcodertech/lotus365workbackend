"use client";
import { Trophy } from "lucide-react";

export default function LeaderboardPage() {
    return (
        <div className="fade-in">
            <div className="page-header">
                <h1 className="page-title">Leaderboard</h1>
            </div>

            <div className="glass-card" style={{ padding: 60, textAlign: "center" }}>
                <Trophy size={48} color="var(--accent)" style={{ margin: "0 auto 16px" }} />
                <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Leaderboard Monitor</h3>
                <p style={{ color: "var(--text-secondary)", maxWidth: 400, margin: "0 auto" }}>
                    View real-time leaderboard rankings. This page will show top earners and their transaction stats
                    once users start making transactions.
                </p>
            </div>
        </div>
    );
}
