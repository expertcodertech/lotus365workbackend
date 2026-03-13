"use client";
import { useEffect, useState } from "react";
import { getConfigs, updateConfig } from "@/lib/api";
import { Save, Settings as SettingsIcon } from "lucide-react";

interface ConfigItem { id: string; key: string; value: any; }

export default function SettingsPage() {
    const [configs, setConfigs] = useState<ConfigItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);
    const [editValues, setEditValues] = useState<Record<string, string>>({});

    useEffect(() => {
        getConfigs()
            .then((data: any) => {
                const items = Array.isArray(data) ? data : [];
                setConfigs(items);
                const vals: Record<string, string> = {};
                items.forEach((c: ConfigItem) => { vals[c.key] = JSON.stringify(c.value, null, 2); });
                setEditValues(vals);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const handleSave = async (key: string) => {
        setSaving(key);
        try {
            const val = JSON.parse(editValues[key]);
            await updateConfig(key, val);
            alert(`Config "${key}" saved!`);
        } catch (e: any) {
            alert(e.message || "Invalid JSON");
        } finally {
            setSaving(null);
        }
    };

    const configLabels: Record<string, { label: string; description: string }> = {
        rewards: { label: "Reward Configuration", description: "Buy/sell reward percentages and referral commission" },
        app_version: { label: "App Version", description: "Minimum and latest app version settings" },
        maintenance: { label: "Maintenance Mode", description: "Toggle maintenance mode on/off" },
        withdrawal_limits: { label: "Withdrawal Limits", description: "Min/max withdrawal amounts" },
    };

    if (loading) return <div className="spinner" />;

    return (
        <div className="fade-in">
            <div className="page-header">
                <h1 className="page-title">Settings</h1>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {configs.map((config) => {
                    const meta = configLabels[config.key] || { label: config.key, description: "" };
                    return (
                        <div key={config.key} className="glass-card" style={{ padding: 28 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                                <div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                                        <SettingsIcon size={18} color="var(--accent)" />
                                        <h3 style={{ fontSize: 16, fontWeight: 700 }}>{meta.label}</h3>
                                    </div>
                                    <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>{meta.description}</p>
                                </div>
                                <button
                                    className="btn btn-primary btn-sm"
                                    onClick={() => handleSave(config.key)}
                                    disabled={saving === config.key}
                                >
                                    <Save size={14} />
                                    {saving === config.key ? "Saving..." : "Save"}
                                </button>
                            </div>
                            <textarea
                                className="input"
                                rows={6}
                                style={{ fontFamily: "monospace", fontSize: 13, resize: "vertical" }}
                                value={editValues[config.key] || ""}
                                onChange={(e) => setEditValues({ ...editValues, [config.key]: e.target.value })}
                            />
                        </div>
                    );
                })}

                {configs.length === 0 && (
                    <div className="glass-card" style={{ padding: 40, textAlign: "center", color: "var(--text-secondary)" }}>
                        No configurations found. They will be auto-created when the backend starts.
                    </div>
                )}
            </div>
        </div>
    );
}
