"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminLogin, setToken } from "@/lib/api";
import { Flower2, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await adminLogin(phone, password);
      if (data.user?.role !== "admin") {
        setError("Access denied. Admin privileges required.");
        setLoading(false);
        return;
      }
      setToken(data.accessToken);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "radial-gradient(ellipse at top, #1a1a3e 0%, #0a0a0f 70%)",
    }}>
      <div className="fade-in" style={{ width: "100%", maxWidth: 420, padding: 20 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{
            width: 72, height: 72, borderRadius: 20, margin: "0 auto 16px",
            background: "linear-gradient(135deg, #6c5ce7, #a29bfe)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 8px 32px rgba(108,92,231,0.4)",
          }}>
            <Flower2 size={36} color="white" />
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>Lotus365 Admin</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>Sign in to manage your platform</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="glass-card" style={{ padding: 32 }}>
          {error && (
            <div style={{
              background: "rgba(255,71,87,0.1)", border: "1px solid rgba(255,71,87,0.3)",
              borderRadius: 10, padding: "10px 16px", marginBottom: 20,
              color: "var(--danger)", fontSize: 13,
            }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 8 }}>
              Phone Number
            </label>
            <input
              type="text"
              className="input"
              placeholder="+919876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          <div style={{ marginBottom: 28 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 8 }}>
              Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPwd ? "text" : "password"}
                className="input"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                style={{
                  position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)",
                }}
              >
                {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: "100%", justifyContent: "center", padding: "14px 20px", fontSize: 15 }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: 24, color: "var(--text-secondary)", fontSize: 12 }}>
          Lotus365 Earn Platform © 2026
        </p>
      </div>
    </div>
  );
}
