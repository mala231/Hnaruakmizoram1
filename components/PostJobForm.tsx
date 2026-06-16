"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { t } from "@/lib/i18n";
import MapSelector from "./MapSelector";

interface Option {
  id: number;
  name: string;
}

interface PostJobFormProps {
  lang: string;
}

export default function PostJobForm({ lang }: PostJobFormProps) {
  const router = useRouter();

  // Options states
  const [categories, setCategories] = useState<Option[]>([]);
  const [locations, setLocations] = useState<Option[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  // Form states
  const [title, setTitle] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [locationId, setLocationId] = useState("");
  const [address, setAddress] = useState("");
  const [deadline, setDeadline] = useState("");
  const [interviewTime, setInterviewTime] = useState("");
  const [durationDays, setDurationDays] = useState<15 | 30>(15);

  // Status states
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Load Razorpay Script and fetch options
  useEffect(() => {
    // 1. Fetch category and district lists
    const fetchOptions = async () => {
      try {
        const [catRes, locRes] = await Promise.all([
          fetch("/api/admin/categories"),
          fetch("/api/admin/locations"),
        ]);
        const catData = await catRes.json();
        const locData = await locRes.json();

        if (catData.success) setCategories(catData.data);
        if (locData.success) setLocations(locData.data);
      } catch (err) {
        setErrorMsg(
          lang === "mz"
            ? "Form load-na a harsatna a awm. Lo try leh rawh le."
            : "Failed to load form options. Please reload the page."
        );
      } finally {
        setLoadingOptions(false);
      }
    };

    fetchOptions();

    // 2. Dynamically append Razorpay checkout script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [lang]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!categoryId || !locationId) {
      setErrorMsg(
        lang === "mz"
          ? "Khawngaihin Category leh District thlang rawh."
          : "Please select a Category and District."
      );
      return;
    }

    setSubmitting(true);

    try {
      // 1. Submit draft job post
      const res = await fetch("/api/jobs/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          shortDescription,
          description,
          categoryId,
          locationId,
          address,
          deadline,
          interviewTime,
          durationDays,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setErrorMsg(
          data.error ||
            (lang === "mz"
              ? "Hna dah khawm a hlawhchham rih."
              : "Failed to create job listing draft.")
        );
        setSubmitting(false);
        return;
      }

      // 2. Handle Payment Flow
      if (data.isMock) {
        // Mock success bypass flow
        setSuccessMsg(
          lang === "mz"
            ? "Razorpay Key a awm loh vangin payment lem kalpui a ni dawn e. Hna hi active a ni tep..."
            : "No Razorpay Key configured, simulating checkout. Getting your listing active..."
        );
        
        const mockRes = await fetch("/api/payments/mock-success", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jobId: data.jobId }),
        });
        
        const mockData = await mockRes.json();
        if (mockData.success) {
          setSuccessMsg(
            lang === "mz"
              ? "Hna dah puanzar a hlawhtling ta! I dashboard ah kan hruai dawn che nia."
              : "Job listing published successfully! Redirecting to your dashboard..."
          );
          setTimeout(() => {
            router.push("/dashboard");
            router.refresh();
          }, 2000);
        } else {
          setErrorMsg(mockData.error || "Mock payment confirmation failed.");
          setSubmitting(false);
        }
      } else {
        // Live Razorpay Checkout flow
        setSuccessMsg(
          lang === "mz"
            ? "Payment bualpui mek a ni, khawngaihin lo nghak lawk rawh..."
            : "Processing payment gateway, please wait..."
        );
        
        const options = {
          key: data.keyId,
          amount: data.amount,
          currency: "INR",
          name: "Hnaruak Mizoram",
          description: data.title,
          order_id: data.orderId,
          handler: function () {
            setSuccessMsg(
              lang === "mz"
                ? "Pekna a hlawhtling ta! Hna a live tep e."
                : "Payment successful! The job listing is going live..."
            );
            setTimeout(() => {
              router.push("/dashboard");
              router.refresh();
            }, 2000);
          },
          modal: {
            ondismiss: function () {
              setErrorMsg(
                lang === "mz" ? "Payment cancel a ni e." : "Payment cancelled."
              );
              setSubmitting(false);
            }
          },
          theme: {
            color: "#1c7dfa"
          }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      }

    } catch (err) {
      setErrorMsg(
        lang === "mz"
          ? "Server biak pawh a harsat rih e."
          : "Server communication error. Please try again."
      );
      setSubmitting(false);
    }
  };

  if (loadingOptions) {
    return (
      <div style={{ display: "flex", flexGrow: 1, backgroundColor: "#ffffff", alignItems: "center", justifyContent: "center", padding: "96px 0" }}>
        <svg className="animate-spin h-8 w-8" style={{ color: "#1c7dfa" }} fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#fafbfc", minHeight: "100vh", padding: "48px 24px", fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
      <div style={{
        maxWidth: "768px",
        margin: "0 auto",
        backgroundColor: "#ffffff",
        border: "1px solid rgba(28,125,250,0.1)",
        borderRadius: "24px",
        padding: "32px",
        boxShadow: "0 12px 40px rgba(28,125,250,0.08)"
      }}>
        
        {/* Header Title */}
        <div style={{ borderBottom: "1px solid var(--color-surface-variant)", paddingBottom: "16px", marginBottom: "32px" }}>
          <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#1c7dfa", margin: 0 }}>
            {t("nav.post_job", lang)}
          </h1>
          <p style={{ fontSize: "12px", color: "#6b7280", fontWeight: 600, marginTop: "6px", marginBottom: 0 }}>
            {lang === "mz"
              ? "Hna ruak thar puanzarna siamna. Khawngaihin a hnuaia form hi fel takin hmang rawh."
              : "Publish a new job vacancy. Please complete the form details below."}
          </p>
        </div>

        {/* Success/Error Alerts */}
        {successMsg && (
          <div style={{
            padding: "16px",
            borderRadius: "12px",
            backgroundColor: "#eff6ff",
            border: "1px solid rgba(28,125,250,0.15)",
            color: "#1c7dfa",
            fontSize: "13px",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "24px"
          }}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div style={{
            padding: "16px",
            borderRadius: "12px",
            backgroundColor: "#fee2e2",
            border: "1px solid rgba(239,68,68,0.15)",
            color: "#c53030",
            fontSize: "13px",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "24px"
          }}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Post Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Job Title */}
          <div>
            <label style={{ fontSize: "13px", fontWeight: 700, color: "#1a2e22", display: "block", marginBottom: "8px" }}>
              {lang === "mz" ? "Hna Hming (Job Title)" : "Job Title"}
            </label>
            <input
              type="text"
              required
              disabled={submitting}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
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
              placeholder="e.g. Office Assistant / Manager..."
            />
          </div>

          {/* Short Description */}
          <div>
            <label style={{ fontSize: "13px", fontWeight: 700, color: "#1a2e22", display: "block", marginBottom: "8px" }}>
              {lang === "mz" ? "Tawi fel taka hrilhfiahna (Short Description)" : "Short Description"}
            </label>
            <input
              type="text"
              required
              disabled={submitting}
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
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
              placeholder={
                lang === "mz"
                  ? "Vantlang tana hriat thawi theih tur hna chanchin tawi fel..."
                  : "A one-sentence summary of the job details..."
              }
            />
          </div>

          {/* Category & District Dropdowns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label style={{ fontSize: "13px", fontWeight: 700, color: "#1a2e22", display: "block", marginBottom: "8px" }}>
                Category
              </label>
              <select
                required
                disabled={submitting}
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
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
                  cursor: "pointer",
                  fontFamily: "inherit"
                }}
              >
                <option value="">
                  {lang === "mz" ? "Category thlang rawh..." : "Select category..."}
                </option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id.toString()}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: "13px", fontWeight: 700, color: "#1a2e22", display: "block", marginBottom: "8px" }}>
                District / Location
              </label>
              <select
                required
                disabled={submitting}
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
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
                  cursor: "pointer",
                  fontFamily: "inherit"
                }}
              >
                <option value="">
                  {lang === "mz" ? "District thlang rawh..." : "Select district..."}
                </option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id.toString()}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Full Description (Textarea) */}
          <div>
            <label style={{ fontSize: "13px", fontWeight: 700, color: "#1a2e22", display: "block", marginBottom: "8px" }}>
              {lang === "mz" ? "Chipchiar taka hrilhfiahna (Full Description)" : "Full Description"}
            </label>
            <textarea
              required
              disabled={submitting}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={8}
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
                lineHeight: 1.6
              }}
              placeholder={
                lang === "mz"
                  ? "Hna chanchin, thiamna ngai te, dil dan tur chipchiar takin ziang rawh..."
                  : "Detail the responsibilities, required qualifications, and application process..."
              }
            />
          </div>

          {/* Address */}
          <div>
            <label style={{ fontSize: "13px", fontWeight: 700, color: "#1a2e22", display: "block", marginBottom: "8px" }}>
              {lang === "mz"
                ? "Hmun Awmna Dilna / Address (Google Map-ah zawn hmuh theih tur a ni ang)"
                : "Address (To be used for Google Map search location)"}
            </label>
            <input
              type="text"
              required
              disabled={submitting}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
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
              placeholder="e.g. Chanmari, Aizawl, Mizoram..."
            />
            <MapSelector address={address} onChangeAddress={setAddress} lang={lang} />
          </div>

          {/* Deadline & Interview time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label style={{ fontSize: "13px", fontWeight: 700, color: "#1a2e22", display: "block", marginBottom: "8px" }}>
                {lang === "mz" ? "Dil tawp ni (Deadline Date)" : "Application Deadline"}
              </label>
              <input
                type="date"
                required
                disabled={submitting}
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
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
                  cursor: "pointer",
                  fontFamily: "inherit"
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: "13px", fontWeight: 700, color: "#1a2e22", display: "block", marginBottom: "8px" }}>
                {lang === "mz" ? "Interview Hun (Interview Time)" : "Interview Details"}
              </label>
              <input
                type="text"
                required
                disabled={submitting}
                value={interviewTime}
                onChange={(e) => setInterviewTime(e.target.value)}
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
                placeholder="e.g. 10:00 AM, Zirtawpni..."
              />
            </div>
          </div>

          {/* Duration Selector */}
          <div style={{ paddingTop: "16px", borderTop: "1px solid #f3f4f6" }}>
            <label style={{ fontSize: "13px", fontWeight: 700, color: "#1a2e22", display: "block", marginBottom: "12px" }}>
              {lang === "mz" ? "Puanzar duh chhung (Choose Listing Duration)" : "Listing Duration"}
            </label>
            
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                disabled={submitting}
                onClick={() => setDurationDays(15)}
                style={{
                  padding: "16px",
                  borderRadius: "16px",
                  border: durationDays === 15 ? "2px solid #1c7dfa" : "1px solid #d1d5db",
                  backgroundColor: durationDays === 15 ? "#f1f5f9" : "#ffffff",
                  color: durationDays === 15 ? "#1c7dfa" : "#4b5563",
                  textAlign: "center",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "4px",
                  fontWeight: durationDays === 15 ? 700 : 500,
                  fontFamily: "inherit",
                }}
              >
                <span style={{ fontSize: "13px" }}>
                  {lang === "mz" ? "Ni 15 (15 Days)" : "15 Days"}
                </span>
                <span style={{ fontSize: "20px", fontWeight: 800 }}>₹299</span>
              </button>
              
              <button
                type="button"
                disabled={submitting}
                onClick={() => setDurationDays(30)}
                style={{
                  padding: "16px",
                  borderRadius: "16px",
                  border: durationDays === 30 ? "2px solid #1c7dfa" : "1px solid #d1d5db",
                  backgroundColor: durationDays === 30 ? "#f1f5f9" : "#ffffff",
                  color: durationDays === 30 ? "#1c7dfa" : "#4b5563",
                  textAlign: "center",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "4px",
                  fontWeight: durationDays === 30 ? 700 : 500,
                  fontFamily: "inherit",
                }}
              >
                <span style={{ fontSize: "13px" }}>
                  {lang === "mz" ? "Ni 30 (30 Days)" : "30 Days"}
                </span>
                <span style={{ fontSize: "20px", fontWeight: 800 }}>₹499</span>
              </button>
            </div>
          </div>

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={submitting}
            style={{
              width: "100%",
              background: "linear-gradient(135deg,#1c7dfa,#0a84ff)",
              color: "#ffffff",
              fontWeight: 700,
              fontSize: "14px",
              padding: "16px 0",
              borderRadius: "12px",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(28,125,250,0.2)",
              marginTop: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              fontFamily: "inherit"
            }}
          >
            {submitting ? (
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : lang === "mz" ? (
              `Pawisa pein puangzar rawh (Pay ₹${durationDays === 15 ? 299 : 499} & Publish)`
            ) : (
              `Pay ₹${durationDays === 15 ? 299 : 499} & Publish Job`
            )}
          </button>

        </form>
      </div>
    </div>
  );
}
