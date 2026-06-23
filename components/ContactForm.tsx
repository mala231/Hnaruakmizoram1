"use client";

import { useState, useEffect } from "react";
import { t } from "@/lib/i18n";

interface ContactFormProps {
  lang: string;
}

export default function ContactForm({ lang }: ContactFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // OTP verification states
  const [pendingToken, setPendingToken] = useState("");
  const [otp, setOtp] = useState("");
  const [verifying, setVerifying] = useState(false);

  // Captcha states
  const [captchaText, setCaptchaText] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaAnswer, setCaptchaAnswer] = useState("");

  const fetchCaptcha = async () => {
    try {
      const res = await fetch("/api/contact");
      if (res.ok) {
        const data = await res.json();
        setCaptchaText(data.text);
        setCaptchaToken(data.token);
      }
    } catch (err) {
      console.error("Failed to fetch captcha", err);
    }
  };

  useEffect(() => {
    fetchCaptcha();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    // Validate email format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      setError(
        lang === "mz"
          ? "Khawngaihin email address dik tak ziak rawh (e.g. name@example.com)"
          : "Please enter a valid email address (e.g. name@example.com)"
      );
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message, lang, captchaToken, captchaAnswer }),
      });

      const data = await res.json();

      if (!res.ok) {
        fetchCaptcha();
        setCaptchaAnswer("");
        throw new Error(data.error || "Failed to send verification code.");
      }

      setCaptchaAnswer("");

      if (data.pendingVerification) {
        setPendingToken(data.token);
      } else {
        // Fallback or legacy instant success
        setSuccess(true);
        setName("");
        setEmail("");
        setMessage("");
      }
    } catch (err: any) {
      setError(err.message || "Failed to process request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) return;

    setVerifying(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: pendingToken, otp: otp.trim(), lang }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "OTP code verification failed.");
      }

      setSuccess(true);
      setPendingToken("");
      setOtp("");
      setName("");
      setEmail("");
      setMessage("");
    } catch (err: any) {
      setError(err.message || "Invalid OTP code. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  // If waiting for OTP code verification, render the OTP form
  if (pendingToken) {
    return (
      <form
        onSubmit={handleVerifyOtp}
        style={{
          background: "white",
          borderRadius: "24px",
          boxShadow: "0 12px 40px rgba(28,125,250,0.12)",
          border: "1px solid rgba(28,125,250,0.1)",
          padding: "32px 36px",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#1c7dfa", margin: "0 0 10px" }}>
            {lang === "mz" ? "Email Verify Rawh" : "Verify Your Email"}
          </h2>
          <p style={{ fontSize: "13px", color: "#6b7280", lineHeight: 1.5, margin: 0 }}>
            {lang === "mz"
              ? `Verification OTP code chu he email: ${email} ah hian kan thawn e. Khawngaihin a hnuaia box-ah hian chhu lut rawh le.`
              : `A verification code has been sent to ${email}. Please enter the OTP code below to verify your message.`}
          </p>
        </div>

        {error && (
          <div
            style={{
              backgroundColor: "#ffebee",
              border: "1px solid #ef9a9a",
              borderRadius: "12px",
              padding: "16px",
              color: "#c62828",
              fontSize: "14px",
              fontWeight: 600,
              lineHeight: 1.5,
            }}
          >
            {error}
          </div>
        )}

        <div>
          <label style={{ fontSize: "13px", fontWeight: 700, color: "#071022", display: "block", marginBottom: "8px" }}>
            {lang === "mz" ? "Nemnghetna OTP Code" : "Verification OTP Code"}
          </label>
          <input
            type="text"
            required
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="e.g. 123456"
            style={{
              width: "100%",
              boxSizing: "border-box",
              backgroundColor: "#f9fafb",
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              padding: "12px 16px",
              fontSize: "16px",
              fontWeight: 700,
              letterSpacing: "4px",
              textAlign: "center",
              color: "#1f2937",
              outline: "none",
              fontFamily: "inherit",
            }}
          />
        </div>

        <button
          type="submit"
          disabled={verifying}
          style={{
            width: "100%",
            background: verifying ? "#93c5fd" : "linear-gradient(135deg,#1c7dfa,#0a84ff)",
            color: "#ffffff",
            fontWeight: 700,
            fontSize: "14px",
            padding: "14px 0",
            borderRadius: "12px",
            border: "none",
            cursor: verifying ? "not-allowed" : "pointer",
            boxShadow: "0 4px 12px rgba(28,125,250,0.2)",
            fontFamily: "inherit",
          }}
        >
          {verifying
            ? lang === "mz"
              ? "En dik mek..."
              : "Verifying..."
            : lang === "mz"
              ? "Nemnghetin Thawn Rawh"
              : "Verify & Send Message"}
        </button>

        <div style={{ textAlign: "center", marginTop: "8px" }}>
          <button
            type="button"
            onClick={() => {
              setPendingToken("");
              setError("");
              setOtp("");
            }}
            style={{
              background: "none",
              border: "none",
              color: "#1c7dfa",
              fontWeight: 700,
              fontSize: "13px",
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            {lang === "mz" ? "← Form-ah let leh rawh" : "← Go back to edit details"}
          </button>
        </div>
      </form>
    );
  }

  // Default initial message form
  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: "white",
        borderRadius: "24px",
        boxShadow: "0 12px 40px rgba(28,125,250,0.12)",
        border: "1px solid rgba(28,125,250,0.1)",
        padding: "32px 36px",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
      }}
    >
      {success && (
        <div
          style={{
            backgroundColor: "#eff6ff",
            border: "1px solid #93c5fd",
            borderRadius: "12px",
            padding: "16px",
            color: "#1c7dfa",
            fontSize: "14px",
            fontWeight: 600,
            lineHeight: 1.5,
          }}
        >
          {t("contact.success_msg", lang)}
        </div>
      )}

      {error && (
        <div
          style={{
            backgroundColor: "#ffebee",
            border: "1px solid #ef9a9a",
            borderRadius: "12px",
            padding: "16px",
            color: "#c62828",
            fontSize: "14px",
            fontWeight: 600,
            lineHeight: 1.5,
          }}
        >
          {error}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
        
        {/* Name Input */}
        <div>
          <label style={{ fontSize: "13px", fontWeight: 700, color: "#071022", display: "block", marginBottom: "8px" }}>
            {t("contact.form_name", lang)}
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={lang === "mz" ? "I hming..." : "Your name..."}
            style={{
              width: "100%",
              boxSizing: "border-box",
              backgroundColor: "#f9fafb",
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              padding: "12px 16px",
              fontSize: "14px",
              fontWeight: 600,
              color: "#1f2937",
              outline: "none",
              fontFamily: "inherit",
            }}
          />
        </div>

        {/* Email Input */}
        <div>
          <label style={{ fontSize: "13px", fontWeight: 700, color: "#071022", display: "block", marginBottom: "8px" }}>
            {t("contact.form_email", lang)}
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={lang === "mz" ? "I email address..." : "Your email address..."}
            style={{
              width: "100%",
              boxSizing: "border-box",
              backgroundColor: "#f9fafb",
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              padding: "12px 16px",
              fontSize: "14px",
              fontWeight: 600,
              color: "#1f2937",
              outline: "none",
              fontFamily: "inherit",
            }}
          />
        </div>

        {/* Message Textarea */}
        <div>
          <label style={{ fontSize: "13px", fontWeight: 700, color: "#071022", display: "block", marginBottom: "8px" }}>
            {t("contact.form_message", lang)}
          </label>
          <textarea
            rows={4}
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={lang === "mz" ? "I thuchah..." : "Your message..."}
            style={{
              width: "100%",
              boxSizing: "border-box",
              backgroundColor: "#f9fafb",
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              padding: "12px 16px",
              fontSize: "14px",
              fontWeight: 600,
              color: "#1f2937",
              outline: "none",
              resize: "none",
              fontFamily: "inherit",
            }}
          />
        </div>

        {/* Math Captcha Challenge */}
        {captchaText && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <label style={{ fontSize: "13px", fontWeight: 700, color: "#071022", margin: 0 }}>
                {lang === "mz" ? "Mihring i nih nemnghet rawh (Math Captcha)" : "Prove you are human (Math Captcha)"}
              </label>
              <button
                type="button"
                onClick={fetchCaptcha}
                style={{
                  background: "none",
                  border: "none",
                  color: "#1c7dfa",
                  fontSize: "11px",
                  fontWeight: 700,
                  cursor: "pointer",
                  padding: 0,
                  textDecoration: "underline"
                }}
              >
                {lang === "mz" ? "Thar thlang rawh" : "Refresh"}
              </button>
            </div>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <div
                style={{
                  backgroundColor: "#f3f4f6",
                  border: "1px solid #e5e7eb",
                  borderRadius: "12px",
                  padding: "12px 16px",
                  fontSize: "14px",
                  fontWeight: 700,
                  color: "#374151",
                  whiteSpace: "nowrap"
                }}
              >
                {captchaText}
              </div>
              <input
                type="text"
                required
                value={captchaAnswer}
                onChange={(e) => setCaptchaAnswer(e.target.value)}
                placeholder="?"
                style={{
                  flexGrow: 1,
                  boxSizing: "border-box",
                  backgroundColor: "#f9fafb",
                  border: "1px solid #e5e7eb",
                  borderRadius: "12px",
                  padding: "12px 16px",
                  fontSize: "14px",
                  fontWeight: 700,
                  color: "#1f2937",
                  outline: "none",
                  fontFamily: "inherit",
                }}
              />
            </div>
          </div>
        )}

      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        style={{
          width: "100%",
          background: loading ? "#93c5fd" : "linear-gradient(135deg,#1c7dfa,#0a84ff)",
          color: "#ffffff",
          fontWeight: 700,
          fontSize: "14px",
          padding: "14px 0",
          borderRadius: "12px",
          border: "none",
          cursor: loading ? "not-allowed" : "pointer",
          boxShadow: "0 4px 12px rgba(28,125,250,0.2)",
          fontFamily: "inherit",
        }}
      >
        {loading
          ? lang === "mz"
            ? "Tih mek..."
            : "Sending..."
          : t("contact.form_submit", lang)}
      </button>

    </form>
  );
}
