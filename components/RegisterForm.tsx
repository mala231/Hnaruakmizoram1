"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface RegisterFormProps {
  lang: string;
}

export default function RegisterForm({ lang }: RegisterFormProps) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogo(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // 1. Email format validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      setError(
        lang === "mz"
          ? "Khawngaihin email address dik tak ziak rawh (e.g. name@example.com)."
          : "Please enter a valid email address (e.g. name@example.com)."
      );
      setLoading(false);
      return;
    }

    // 2. Phone format validation
    const phoneRegex = /^(?:\+91|0)?[6-9]\d{9}$/;
    if (!phoneRegex.test(phone.replace(/\s+/g, ""))) {
      setError(
        lang === "mz"
          ? "Khawngaihin phone number dik tak ziak rawh (digit 10 awm tur a ni, e.g. 9876543210)."
          : "Please enter a valid 10-digit phone number (e.g. 9876543210)."
      );
      setLoading(false);
      return;
    }

    const logoToSend = logo || null;

    try {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("email", email);
      formData.append("phone", phone);
      formData.append("address", address);
      formData.append("password", password);
      if (logoToSend) {
        formData.append("logo", logoToSend);
      }

      const res = await fetch("/api/auth/register", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        router.push("/dashboard");
        router.refresh();
      } else {
        setError(
          data.error ||
            (lang === "mz"
              ? "Inziahluhna a hlawhchham rih."
              : "Registration failed.")
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
    padding: "12px 16px",
    fontSize: "14px",
    fontWeight: 500,
    color: "#111827",
    background: "#f9fafb",
    border: "1.5px solid #e5e7eb",
    borderRadius: "12px",
    outline: "none",
    fontFamily: "inherit",
    display: "block",
    transition: "border-color 0.2s, box-shadow 0.2s",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "13px",
    fontWeight: 700,
    color: "#374151",
    marginBottom: "8px",
  };

  const focusHandlers = {
    onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      e.target.style.borderColor = "#1c7dfa";
      e.target.style.boxShadow = "0 0 0 3px rgba(28,125,250,0.15)";
    },
    onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      e.target.style.borderColor = "#e5e7eb";
      e.target.style.boxShadow = "none";
    },
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "560px",
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
            <svg width="28" height="28" fill="white" viewBox="0 0 24 24">
              <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
          <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#1c7dfa", margin: "0 0 6px", letterSpacing: "-0.02em" }}>
            {lang === "mz" ? "Hna Petu Inziahluhna" : "Employer Registration"}
          </h1>
          <p style={{ fontSize: "13px", color: "#6b7280", margin: 0, fontWeight: 500 }}>
            {lang === "mz" ? "Account thar siamna (Employer Profile)" : "Create a new employer account"}
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

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* Logo Upload */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
            <label style={{ ...labelStyle, marginBottom: 0 }}>
              {lang === "mz" ? "Company Logo (Thlalak)" : "Company Logo"}
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
              {/* Preview */}
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "16px",
                  border: "2px dashed #d1d5db",
                  background: "#f9fafb",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  flexShrink: 0,
                }}
              >
                {logoPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoPreview} alt="Logo preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#9ca3af">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                )}
              </div>
              {/* Upload button */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  style={{ display: "none" }}
                  id="logo-upload-input"
                />
                <label
                  htmlFor="logo-upload-input"
                  style={{
                    display: "inline-block",
                    padding: "9px 18px",
                    background: "#f1f5f9",
                    border: "1.5px solid #cbd5e1",
                    borderRadius: "10px",
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#1c7dfa",
                    cursor: "pointer",
                  }}
                >
                  {logoPreview
                    ? lang === "mz"
                      ? "Thlalak thlang leh"
                      : "Change Image"
                    : lang === "mz"
                    ? "Thlalak thlang rawh"
                    : "Choose Image"}
                </label>
                <span style={{ fontSize: "11px", color: "#9ca3af", fontWeight: 500 }}>
                  {lang === "mz"
                    ? "PNG, JPG emaw WEBP (Max 2MB)"
                    : "PNG, JPG or WEBP (Max 2MB)"}
                </span>
              </div>
            </div>
          </div>

          {/* Two-column grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={labelStyle}>
                {lang === "mz" ? "Username (Mimal Hming)" : "Username (Full Name)"}
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="E.g. mapuia"
                style={inputStyle}
                {...focusHandlers}
              />
            </div>
            <div>
              <label style={labelStyle}>Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="E.g. mapuia@gmail.com"
                style={inputStyle}
                {...focusHandlers}
              />
            </div>
            <div>
              <label style={labelStyle}>Phone Number</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="E.g. 9876543210"
                style={inputStyle}
                {...focusHandlers}
              />
            </div>
            <div>
              <label style={labelStyle}>
                {lang === "mz" ? "Password (Hmanletna)" : "Password"}
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={lang === "mz" ? "Min 6 characters" : "Min 6 characters"}
                  style={{ ...inputStyle, paddingRight: "42px" }}
                  {...focusHandlers}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 0 }}
                >
                  {showPassword ? (
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  ) : (
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Address full-width */}
          <div>
            <label style={labelStyle}>
              {lang === "mz"
                ? "Physical Address (Company awmna hmun tak)"
                : "Physical Address (Company Location)"}
            </label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="E.g. Chanmari, Aizawl, Mizoram"
              style={inputStyle}
              {...focusHandlers}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              marginTop: "4px",
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
                {lang === "mz" ? "Creating account..." : "Creating account..."}
              </>
            ) : (
              <>
                {lang === "mz" ? "Register inzianglut rawh le" : "Register Now"}
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </>
            )}
          </button>
        </form>

        {/* Footer */}
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
          {lang === "mz" ? "Account i nei tawh em?" : "Already have an account?"}{" "}
          <Link href="/login" style={{ color: "#1c7dfa", fontWeight: 700, textDecoration: "none" }}>
            {lang === "mz" ? "Lo lut rawh →" : "Login here →"}
          </Link>
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
