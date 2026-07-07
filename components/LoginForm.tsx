"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface LoginFormProps {
  lang: string;
}

export default function LoginForm({ lang }: LoginFormProps) {
  const [mode, setMode] = useState<"login" | "forgot" | "reset">("login");
  const [identity, setIdentity] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Forgot password states
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetToken, setResetToken] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identity, password }),
      });

      const data = await res.json();

      if (data.success) {
        router.push("/dashboard");
        router.refresh();
      } else {
        setError(
          data.error ||
            (lang === "mz"
              ? "Luhna a hlawhchham rih."
              : "Login failed.")
        );
      }
    } catch {
      setError(
        lang === "mz"
          ? "Server biak pawh a harsat rih e."
          : "Server communication error. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (data.success) {
        setResetToken(data.token);
        setError("");
        setMode("reset");
      } else {
        setError(
          data.error ||
            (lang === "mz"
              ? "OTP thawn a hlawhchham."
              : "Failed to send OTP.")
        );
      }
    } catch {
      setError(
        lang === "mz"
          ? "Server biak pawh a harsat rih e."
          : "Server communication error. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (newPassword.length < 6) {
      setError(
        lang === "mz"
          ? "Password hi character 6 aia tlem lo a ni tur a ni."
          : "Password must be at least 6 characters long."
      );
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: resetToken, otp, newPassword }),
      });

      const data = await res.json();

      if (data.success) {
        router.push("/dashboard");
        router.refresh();
      } else {
        setError(
          data.error ||
            (lang === "mz"
              ? "Password thlakna a hlawhchham."
              : "Password reset failed.")
        );
      }
    } catch {
      setError(
        lang === "mz"
          ? "Server biak pawh a harsat rih e."
          : "Server communication error. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };


  const inputStyle: React.CSSProperties = {
    width: "100%",
    boxSizing: "border-box",
    padding: "13px 16px 13px 42px",
    fontSize: "14px",
    fontWeight: 500,
    color: "#111827",
    background: "#f9fafb",
    border: "1.5px solid #e5e7eb",
    borderRadius: "12px",
    outline: "none",
    fontFamily: "inherit",
    display: "block",
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "420px",
        background: "#ffffff",
        borderRadius: "24px",
        boxShadow: "0 20px 60px rgba(28,125,250,0.15), 0 4px 16px rgba(0,0,0,0.06)",
        overflow: "hidden",
      }}
    >
      {/* Accent bar */}
      <div style={{ height: "4px", background: "linear-gradient(90deg,#1c7dfa,#5856d6,#a5b4fc)" }} />

      <div style={{ padding: "40px 36px 36px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "16px",
              background: "linear-gradient(135deg,#1c7dfa,#0a84ff)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "16px",
              boxShadow: "0 8px 20px rgba(28,125,250,0.3)",
            }}
          >
            {mode === "login" ? (
              <svg width="28" height="28" fill="white" viewBox="0 0 24 24">
                <path d="M20 6h-2.18c.07-.44.18-.86.18-1a3 3 0 0 0-6 0c0 .14.11.56.18 1H10c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-5-2a1 1 0 0 1 1 1c0 .14-.15.78-.33 1h-1.34C14.15 5.78 14 5.14 14 5a1 1 0 0 1 1-1z" />
              </svg>
            ) : mode === "forgot" ? (
              <svg width="28" height="28" fill="white" viewBox="0 0 24 24">
                <path d="M22 17.27a1.02 1.02 0 0 1-.5.87l-9 5a1 1 0 0 1-1 0l-9-5a1.02 1.02 0 0 1-.5-.87V10.7a1.02 1.02 0 0 1 .5-.87l9-5a1 1 0 0 1 1 0l9 5a1.02 1.02 0 0 1 .5.87v6.57zm-10-8.2l-6.86 3.81 6.86 3.81 6.86-3.81L12 9.07z" />
              </svg>
            ) : (
              <svg width="28" height="28" fill="white" viewBox="0 0 24 24">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
              </svg>
            )}
          </div>
          <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#1c7dfa", margin: "0 0 6px", letterSpacing: "-0.02em" }}>
            {mode === "login" 
              ? (lang === "mz" ? "Hna Petu Luhna" : "Employer Login")
              : mode === "forgot"
              ? (lang === "mz" ? "Password Theihnghilh" : "Forgot Password")
              : (lang === "mz" ? "Password Reset" : "Reset Password")}
          </h1>
          <p style={{ fontSize: "13px", color: "#6b7280", margin: 0, fontWeight: 500, lineHeight: 1.4 }}>
            {mode === "login"
              ? (lang === "mz" ? "Hnaruak Mizoram-ah lo lut rawh" : "Log in to Hnaruak Mizoram")
              : mode === "forgot"
              ? (lang === "mz" ? "I registered email ziak rawh le" : "Enter your registered email address")
              : (lang === "mz" ? `OTP code hi email (${email}) ah thawn a ni e.` : `OTP code has been sent to ${email}.`)}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div
            style={{
              marginBottom: "20px",
              padding: "12px 16px",
              borderRadius: "12px",
              background: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#dc2626",
              fontSize: "13px",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            {error}
          </div>
        )}

        {/* Dynamic Forms based on mode */}
        {mode === "login" && (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            {/* Identity */}
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#374151", marginBottom: "8px" }}>
                {lang === "mz" ? "Username, Email emaw Phone" : "Username, Email or Phone"}
              </label>
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#9ca3af", pointerEvents: "none" }}>
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  id="login-identity"
                  type="text"
                  required
                  autoComplete="username"
                  value={identity}
                  onChange={(e) => setIdentity(e.target.value)}
                  placeholder={lang === "mz" ? "I username, email emaw phone..." : "Your username, email or phone..."}
                  style={inputStyle}
                  onFocus={(e) => { e.target.style.borderColor = "#1c7dfa"; e.target.style.boxShadow = "0 0 0 3px rgba(28,125,250,0.15)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "#e5e7eb"; e.target.style.boxShadow = "none"; }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#374151", marginBottom: "8px" }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#9ca3af", pointerEvents: "none" }}>
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{ ...inputStyle, paddingRight: "46px" }}
                  onFocus={(e) => { e.target.style.borderColor = "#1c7dfa"; e.target.style.boxShadow = "0 0 0 3px rgba(28,125,250,0.15)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "#e5e7eb"; e.target.style.boxShadow = "none"; }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 0 }}
                >
                  {showPassword ? (
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  ) : (
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  )}
                </button>
              </div>
            </div>

            {/* Forgot Password link */}
            <div style={{ textAlign: "right", marginTop: "-6px", marginBottom: "4px" }}>
              <button
                type="button"
                onClick={() => { setMode("forgot"); setError(""); }}
                style={{ background: "none", border: "none", color: "#1c7dfa", fontSize: "12px", fontWeight: 700, cursor: "pointer", padding: 0, fontFamily: "inherit" }}
              >
                {lang === "mz" ? "Password i theihnghilh em? (Forgot?)" : "Forgot Password?"}
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "14px",
                background: loading ? "#dbeafe" : "linear-gradient(135deg,#1c7dfa,#0a84ff)",
                color: loading ? "#6b7280" : "#ffffff",
                fontSize: "14px",
                fontWeight: 700,
                border: "none",
                borderRadius: "12px",
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: loading ? "none" : "0 4px 14px rgba(28,125,250,0.35)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                fontFamily: "inherit",
              }}
            >
              {loading ? (
                <>
                  <svg style={{ animation: "spin 1s linear infinite" }} width="18" height="18" fill="none" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="#6b7280" strokeWidth="3" strokeDasharray="60" strokeDashoffset="15" />
                  </svg>
                  {lang === "mz" ? "Checking..." : "Logging in..."}
                </>
              ) : (
                <>
                  {lang === "mz" ? "Lo lut rawh" : "Login"}
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>
          </form>
        )}

        {mode === "forgot" && (
          <form onSubmit={handleForgotPassword} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            {/* Email */}
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#374151", marginBottom: "8px" }}>
                Email Address
              </label>
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#9ca3af", pointerEvents: "none" }}>
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. name@example.com"
                  style={inputStyle}
                  onFocus={(e) => { e.target.style.borderColor = "#1c7dfa"; e.target.style.boxShadow = "0 0 0 3px rgba(28,125,250,0.15)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "#e5e7eb"; e.target.style.boxShadow = "none"; }}
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "14px",
                background: loading ? "#dbeafe" : "linear-gradient(135deg,#1c7dfa,#0a84ff)",
                color: loading ? "#6b7280" : "#ffffff",
                fontSize: "14px",
                fontWeight: 700,
                border: "none",
                borderRadius: "12px",
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: loading ? "none" : "0 4px 14px rgba(28,125,250,0.35)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                fontFamily: "inherit",
              }}
            >
              {loading ? (
                <>
                  <svg style={{ animation: "spin 1s linear infinite" }} width="18" height="18" fill="none" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="#6b7280" strokeWidth="3" strokeDasharray="60" strokeDashoffset="15" />
                  </svg>
                  Checking...
                </>
              ) : (
                <>
                  {lang === "mz" ? "OTP thawn rawh" : "Send OTP"}
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>

            {/* Back to Login */}
            <button
              type="button"
              onClick={() => { setMode("login"); setError(""); }}
              style={{ background: "none", border: "none", color: "#dc2626", fontSize: "13px", fontWeight: 700, cursor: "pointer", width: "100%", textAlign: "center", marginTop: "4px", fontFamily: "inherit" }}
            >
              {lang === "mz" ? "← Kir leh rawh (Back)" : "← Back to Login"}
            </button>
          </form>
        )}

        {mode === "reset" && (
          <form onSubmit={handleResetPassword} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            {/* OTP Code */}
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#374151", marginBottom: "8px" }}>
                OTP Code (Digit 6)
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "12px 16px",
                  fontSize: "20px",
                  fontWeight: 700,
                  color: "#111827",
                  background: "#f9fafb",
                  border: "1.5px solid #e5e7eb",
                  borderRadius: "12px",
                  outline: "none",
                  fontFamily: "inherit",
                  letterSpacing: "6px",
                  textAlign: "center"
                }}
                onFocus={(e) => { e.target.style.borderColor = "#1c7dfa"; e.target.style.boxShadow = "0 0 0 3px rgba(28,125,250,0.15)"; }}
                onBlur={(e) => { e.target.style.borderColor = "#e5e7eb"; e.target.style.boxShadow = "none"; }}
              />
            </div>

            {/* New Password */}
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#374151", marginBottom: "8px" }}>
                {lang === "mz" ? "Password Thar (New Password)" : "New Password"}
              </label>
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#9ca3af", pointerEvents: "none" }}>
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  style={{ ...inputStyle, paddingRight: "46px" }}
                  onFocus={(e) => { e.target.style.borderColor = "#1c7dfa"; e.target.style.boxShadow = "0 0 0 3px rgba(28,125,250,0.15)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "#e5e7eb"; e.target.style.boxShadow = "none"; }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 0 }}
                >
                  {showPassword ? (
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  ) : (
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "14px",
                background: loading ? "#dbeafe" : "linear-gradient(135deg,#1c7dfa,#0a84ff)",
                color: loading ? "#6b7280" : "#ffffff",
                fontSize: "14px",
                fontWeight: 700,
                border: "none",
                borderRadius: "12px",
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: loading ? "none" : "0 4px 14px rgba(28,125,250,0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                fontFamily: "inherit",
              }}
            >
              {loading ? (
                <>
                  <svg style={{ animation: "spin 1s linear infinite" }} width="18" height="18" fill="none" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="#6b7280" strokeWidth="3" strokeDasharray="60" strokeDashoffset="15" />
                  </svg>
                  Resetting...
                </>
              ) : (
                <>
                  {lang === "mz" ? "Lut & Reset Rawh" : "Reset & Login"}
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>

            {/* Back button */}
            <button
              type="button"
              onClick={() => { setMode("forgot"); setError(""); }}
              style={{ background: "none", border: "none", color: "#dc2626", fontSize: "13px", fontWeight: 700, cursor: "pointer", width: "100%", textAlign: "center", marginTop: "4px", fontFamily: "inherit" }}
            >
              {lang === "mz" ? "← Email thlak leh rawh" : "← Change Email"}
            </button>
          </form>
        )}

        {/* Footer link */}
        <div
          style={{
            marginTop: "24px",
            paddingTop: "20px",
            borderTop: "1px solid var(--color-outline-variant)",
            textAlign: "center",
            fontSize: "13px",
            color: "#6b7280",
            fontWeight: 500,
          }}
        >
          {lang === "mz" ? "Account i la nei lo em ni?" : "Don't have an account yet?"}{" "}
          <Link href="/register" style={{ color: "#1c7dfa", fontWeight: 700, textDecoration: "none" }}>
            {lang === "mz" ? "Inzianglut rawh le →" : "Register here →"}
          </Link>
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
