"use client";

import { useState } from "react";
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
        body: JSON.stringify({ name, email, message, lang }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send message.");
      }

      setSuccess(true);
      setName("");
      setEmail("");
      setMessage("");
    } catch (err: any) {
      setError(err.message || "Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
            ? "Wating..."
            : "Sending..."
          : t("contact.form_submit", lang)}
      </button>

    </form>
  );
}
