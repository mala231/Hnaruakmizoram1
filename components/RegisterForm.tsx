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

  // OTP Verification hooks
  const [pendingToken, setPendingToken] = useState("");
  const [otp, setOtp] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  // Geolocation and map states
  const [locating, setLocating] = useState(false);
  const [mapCoordinates, setMapCoordinates] = useState<{ lat: number; lon: number } | null>(null);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError(
        lang === "mz"
          ? "I browser-in browser geolocation a support lo."
          : "Geolocation is not supported by your browser."
      );
      return;
    }

    setLocating(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setMapCoordinates({ lat: latitude, lon: longitude });

        try {
          // Query OpenStreetMap Nominatim for free reverse geocoding
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            {
              headers: {
                "Accept-Language": lang === "mz" ? "en" : lang,
                "User-Agent": "HnaruakMizoramEmployerPortal"
              }
            }
          );

          if (!response.ok) {
            throw new Error("Geocoding failed");
          }

          const data = await response.json();
          if (data && data.display_name) {
            setAddress(data.display_name);
          } else {
            setAddress(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
          }
        } catch (err) {
          console.error("Reverse geocoding error:", err);
          // Fallback to coordinates
          setAddress(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
        } finally {
          setLocating(false);
        }
      },
      (geoErr) => {
        console.error("Geolocation error:", geoErr);
        let errorMsg = "";
        if (geoErr.code === geoErr.PERMISSION_DENIED) {
          errorMsg = lang === "mz"
            ? "Hmun tak (location) luhna permission i deny a ni. Khawngaihin browser settings-ah a phalna pe rawh."
            : "Location permission denied. Please allow location access in your browser settings.";
        } else {
          errorMsg = lang === "mz"
            ? "Awnna hmun zawn chhuah a hlawhchham rih."
            : "Unable to retrieve your current location.";
        }
        setError(errorMsg);
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

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
        if (data.pendingVerification) {
          setPendingToken(data.token);
          setResendSuccess(false);
        } else {
          router.push("/dashboard");
          router.refresh();
        }
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

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 6) {
      setError(
        lang === "mz"
          ? "Khawngaihin OTP digit 6 ziak vek rawh."
          : "Please enter the complete 6-digit OTP."
      );
      return;
    }

    setVerifying(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp, token: pendingToken }),
      });

      const data = await res.json();

      if (data.success) {
        router.push("/dashboard");
        router.refresh();
      } else {
        setError(data.error || (lang === "mz" ? "OTP verification a hlawhchham." : "OTP verification failed."));
      }
    } catch {
      setError(
        lang === "mz"
          ? "Server biak pawh a harsat rih e."
          : "Server communication error. Please try again."
      );
    } finally {
      setVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    setResending(true);
    setError("");
    setResendSuccess(false);

    try {
      const res = await fetch("/api/auth/register/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: pendingToken }),
      });

      const data = await res.json();

      if (data.success) {
        setPendingToken(data.token);
        setOtp("");
        setResendSuccess(true);
      } else {
        setError(data.error || (lang === "mz" ? "OTP thawn nawnna a hlawhchham." : "Failed to resend OTP."));
      }
    } catch {
      setError(
        lang === "mz"
          ? "Server biak pawh a harsat rih e."
          : "Server communication error. Please try again."
      );
    } finally {
      setResending(false);
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

  if (pendingToken) {
    return (
      <div
        style={{
          width: "100%",
          maxWidth: "480px",
          background: "#ffffff",
          borderRadius: "24px",
          boxShadow: "0 20px 60px rgba(28,125,250,0.15), 0 4px 16px rgba(0,0,0,0.06)",
          overflow: "hidden",
        }}
      >
        <div style={{ height: "4px", background: "linear-gradient(90deg,#1c7dfa,#5856d6,#a5b4fc)" }} />

        <div style={{ padding: "40px 36px 36px" }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "28px" }}>
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
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
              </svg>
            </div>
            <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#1c7dfa", margin: "0 0 6px", letterSpacing: "-0.01em" }}>
              {lang === "mz" ? "OTP Verification" : "Verify Your Account"}
            </h1>
            <p style={{ fontSize: "13px", color: "#6b7280", margin: 0, fontWeight: 500, lineHeight: 1.4 }}>
              {lang === "mz"
                ? `OTP Code hi email (${email}) leh phone (${phone}) ah thawn a ni e.`
                : `An OTP code has been sent to your email (${email}) and phone (${phone}).`}
            </p>
          </div>

          {/* Error Alert */}
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

          {/* Success Resend Alert */}
          {resendSuccess && (
            <div
              style={{
                marginBottom: "20px",
                padding: "12px 16px",
                borderRadius: "12px",
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                color: "#16a34a",
                fontSize: "13px",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {lang === "mz" ? "OTP thawn thar leh a ni ta. Khawngaihin terminal/email lo en leh rawh." : "OTP resent successfully. Please check your inbox or terminal."}
            </div>
          )}

          <form onSubmit={handleVerifyOtp} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <label style={labelStyle}>
                {lang === "mz" ? "Verification OTP Code (digit 6)" : "Verification OTP Code (6-digit)"}
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="E.g. 123456"
                style={{
                  ...inputStyle,
                  fontSize: "20px",
                  letterSpacing: "6px",
                  textAlign: "center",
                  padding: "12px",
                }}
                onFocus={(e) => { e.target.style.borderColor = "#1c7dfa"; e.target.style.boxShadow = "0 0 0 3px rgba(28,125,250,0.15)"; }}
                onBlur={(e) => { e.target.style.borderColor = "#e5e7eb"; e.target.style.boxShadow = "none"; }}
              />
            </div>

            {/* Verify Button */}
            <button
              type="submit"
              disabled={verifying}
              style={{
                width: "100%",
                padding: "14px",
                background: verifying ? "#dbeafe" : "linear-gradient(135deg,#1c7dfa,#0a84ff)",
                color: verifying ? "#6b7280" : "#ffffff",
                fontSize: "14px",
                fontWeight: 700,
                border: "none",
                borderRadius: "12px",
                cursor: verifying ? "not-allowed" : "pointer",
                boxShadow: verifying ? "none" : "0 4px 14px rgba(28,125,250,0.35)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                fontFamily: "inherit",
              }}
            >
              {verifying ? (
                <>
                  <svg style={{ animation: "spin 1s linear infinite" }} width="18" height="18" fill="none" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="#6b7280" strokeWidth="3" strokeDasharray="60" strokeDashoffset="15" />
                  </svg>
                  {lang === "mz" ? "Verifiying..." : "Verifying..."}
                </>
              ) : (
                <>
                  {lang === "mz" ? "Verify OTP nemnghet rawh" : "Verify Account"}
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4" />
                  </svg>
                </>
              )}
            </button>

            {/* Resend OTP button */}
            <button
              type="button"
              disabled={resending}
              onClick={handleResendOtp}
              style={{
                width: "100%",
                padding: "11px",
                background: "#f8fafc",
                color: resending ? "#94a3b8" : "#475569",
                fontSize: "13px",
                fontWeight: 700,
                border: "1.5px solid #cbd5e1",
                borderRadius: "12px",
                cursor: resending ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                fontFamily: "inherit",
              }}
            >
              {resending ? (
                <>
                  <svg style={{ animation: "spin 1s linear infinite" }} width="14" height="14" fill="none" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="#94a3b8" strokeWidth="3" strokeDasharray="60" strokeDashoffset="15" />
                  </svg>
                  {lang === "mz" ? "Sending OTP..." : "Sending OTP..."}
                </>
              ) : (
                <>
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M9 11l3-3 3 3m-3-3v12" />
                  </svg>
                  {lang === "mz" ? "OTP thawn nawn rawh (Resend)" : "Resend OTP Code"}
                </>
              )}
            </button>

            {/* Cancel & Edit details */}
            <button
              type="button"
              onClick={() => {
                setPendingToken("");
                setOtp("");
                setError("");
                setResendSuccess(false);
              }}
              style={{
                width: "100%",
                background: "none",
                border: "none",
                color: "#dc2626",
                fontSize: "13px",
                fontWeight: 700,
                cursor: "pointer",
                textAlign: "center",
                padding: "6px",
                fontFamily: "inherit",
              }}
            >
              {lang === "mz" ? "← Inziahluhna tidanglam rawh (Edit Details)" : "← Cancel & Edit Details"}
            </button>
          </form>
        </div>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

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
                {lang === "mz" ? "Username (Hming)" : "Username (Full Name)"}
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
                {lang === "mz" ? "Password (Thuruk)" : "Password"}
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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <label style={{ ...labelStyle, marginBottom: 0 }}>
                {lang === "mz"
                  ? "Physical Address (Company awmna hmun tak)"
                  : "Physical Address (Company Location)"}
              </label>
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={locating}
                style={{
                  background: "none",
                  border: "none",
                  color: "#1c7dfa",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: locating ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: 0,
                  fontFamily: "inherit",
                }}
              >
                {locating ? (
                  <>
                    <svg style={{ animation: "spin 1s linear infinite" }} width="12" height="12" fill="none" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="#1c7dfa" strokeWidth="4" strokeDasharray="40" strokeDashoffset="10" />
                    </svg>
                    {lang === "mz" ? "Hmun zawng mek..." : "Locating..."}
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {lang === "mz" ? "Ka Awnna Hmun Hmang Rawh" : "Use Current Location"}
                  </>
                )}
              </button>
            </div>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="E.g. Chanmari, Aizawl, Mizoram"
              style={inputStyle}
              {...focusHandlers}
            />

            {mapCoordinates && (
              <div style={{ marginTop: "12px", borderRadius: "12px", overflow: "hidden", border: "1.5px solid #e5e7eb" }}>
                <iframe
                  title="Company Location Map"
                  width="100%"
                  height="220"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://maps.google.com/maps?q=${mapCoordinates.lat},${mapCoordinates.lon}&z=16&output=embed`}
                />
              </div>
            )}
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
