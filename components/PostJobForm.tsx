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

  // Duration states — "15" | "30" | "custom"
  const [durationMode, setDurationMode] = useState<"15" | "30" | "custom">("15");
  const [customDays, setCustomDays] = useState("");

  // Derived actual duration in days
  const getDurationDays = () => {
    if (durationMode === "custom") {
      const n = parseInt(customDays, 10);
      return isNaN(n) ? 0 : n;
    }
    return parseInt(durationMode, 10);
  };

  // PDF upload states
  const [pdfUrl, setPdfUrl] = useState("");
  const [pdfUploading, setPdfUploading] = useState(false);
  const [pdfError, setPdfError] = useState("");

  const handlePdfChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setPdfError(
        lang === "mz"
          ? "PDF file chauh upload phal a ni."
          : "Only PDF files are allowed."
      );
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setPdfError(
        lang === "mz"
          ? "File size hi 5MB aia tlem a ni tur a ni."
          : "File size must be under 5MB."
      );
      return;
    }

    setPdfError("");
    setPdfUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setPdfUrl(data.url);
      } else {
        setPdfError(data.error || "Upload failed.");
      }
    } catch (err) {
      setPdfError(
        lang === "mz"
          ? "Upload naah harsatna a awm."
          : "Upload failed due to connection error."
      );
    } finally {
      setPdfUploading(false);
    }
  };

  // Status states
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Fetch category and district options
  useEffect(() => {
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

    const durationDays = getDurationDays();
    if (durationMode === "custom" && (durationDays < 1 || durationDays > 30)) {
      setErrorMsg(
        lang === "mz"
          ? "Custom ni hi 1 aiin tam leh 30 aiin tlem a ni tur a ni."
          : "Custom duration must be between 1 and 30 days."
      );
      return;
    }

    setSubmitting(true);

    try {
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
          pdfUrl,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setErrorMsg(
          data.error ||
          (lang === "mz"
            ? "Hna dah khawm a hlawhchham rih."
            : "Failed to submit job listing.")
        );
        setSubmitting(false);
        return;
      }

      // Successfully submitted — pending admin approval
      setSuccessMsg(
        lang === "mz"
          ? "Hna puanzar i submit ta! Admin confirmation ngaiin. I dashboard-ah kan hruai dawn che nia."
          : "Job submitted successfully! Awaiting admin approval. Redirecting to your dashboard..."
      );
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 2500);

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

  const inputStyle: React.CSSProperties = {
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
  };

  const labelStyle: React.CSSProperties = {
    fontSize: "13px",
    fontWeight: 700,
    color: "#1a2e22",
    display: "block",
    marginBottom: "8px",
  };

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
        <div style={{ borderBottom: "1px solid #f3f4f6", paddingBottom: "16px", marginBottom: "32px" }}>
          <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#1c7dfa", margin: 0 }}>
            {t("nav.post_job", lang)}
          </h1>
          <p style={{ fontSize: "12px", color: "#6b7280", fontWeight: 600, marginTop: "6px", marginBottom: 0 }}>
            {lang === "mz"
              ? "Hna ruak tlangzarhna. Khawngaihin a hnuaia form hi fel takin hmang rawh. Submit hnuah admin confirmation ngaiin."
              : "Publish a new job vacancy. Complete the form below. After submission, your listing will be reviewed by the admin."}
          </p>

          {/* Free badge */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", marginTop: "10px", backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "100px", padding: "4px 12px" }}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#16a34a" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#16a34a" }}>
              {lang === "mz" ? "FREE — Dawt lova hna puanzar theih" : "FREE — Post jobs at no cost"}
            </span>
          </div>
        </div>

        {/* Success/Error Alerts */}
        {successMsg && (
          <div style={{
            padding: "16px", borderRadius: "12px",
            backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0",
            color: "#16a34a", fontSize: "13px", fontWeight: 600,
            display: "flex", alignItems: "center", gap: "8px", marginBottom: "24px"
          }}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div style={{
            padding: "16px", borderRadius: "12px",
            backgroundColor: "#fee2e2", border: "1px solid rgba(239,68,68,0.15)",
            color: "#c53030", fontSize: "13px", fontWeight: 600,
            display: "flex", alignItems: "center", gap: "8px", marginBottom: "24px"
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
            <label style={labelStyle}>
              {lang === "mz" ? "Hna Hming (Job Title)" : "Job Title"}
            </label>
            <input
              type="text"
              required
              disabled={submitting}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={inputStyle}
              placeholder="e.g. Office Assistant / Manager..."
            />
          </div>

          {/* Short Description */}
          <div>
            <label style={labelStyle}>
              {lang === "mz" ? "Tawi fel taka hrilhfiahna (Short Description)" : "Short Description"}
            </label>
            <input
              type="text"
              required
              disabled={submitting}
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              style={inputStyle}
              placeholder={
                lang === "mz"
                  ? "Vantlang tana hriat theih tur hna chanchin tawi fel..."
                  : "A one-sentence summary of the job details..."
              }
            />
          </div>

          {/* Category & District Dropdowns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label style={labelStyle}>Category</label>
              <select
                required
                disabled={submitting}
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                style={{ ...inputStyle, cursor: "pointer" }}
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
              <label style={labelStyle}>District / Location</label>
              <select
                required
                disabled={submitting}
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
                style={{ ...inputStyle, cursor: "pointer" }}
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
            <label style={labelStyle}>
              {lang === "mz" ? "Chipchiar taka hrilhfiahna (Full Description)" : "Full Description"}
            </label>
            <textarea
              required
              disabled={submitting}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={8}
              style={{ ...inputStyle, lineHeight: 1.6 }}
              placeholder={
                lang === "mz"
                  ? "Hna chanchin, thiamna ngai te, dil dan tur chipchiar takin ziang rawh..."
                  : "Detail the responsibilities, required qualifications, and application process..."
              }
            />
          </div>

          {/* Address */}
          <div>
            <label style={labelStyle}>
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
              style={inputStyle}
              placeholder="e.g. Chanmari, Aizawl, Mizoram..."
            />
            <MapSelector address={address} onChangeAddress={setAddress} lang={lang} />
          </div>

          {/* Deadline & Interview time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label style={labelStyle}>
                {lang === "mz" ? "Dil tawp ni (Deadline Date)" : "Application Deadline"}
              </label>
              <input
                type="date"
                required
                disabled={submitting}
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                style={{ ...inputStyle, cursor: "pointer" }}
              />
            </div>

            <div>
              <label style={labelStyle}>
                {lang === "mz" ? "Interview Hun (Interview Time)" : "Interview Details"}
              </label>
              <input
                type="text"
                required
                disabled={submitting}
                value={interviewTime}
                onChange={(e) => setInterviewTime(e.target.value)}
                style={inputStyle}
                placeholder="e.g. 10:00 AM, Zirtawpni..."
              />
            </div>
          </div>

          {/* PDF Circular Upload */}
          <div style={{ paddingTop: "16px", borderTop: "1px solid #f3f4f6" }}>
            <label style={labelStyle}>
              {t("jobs.pdf_upload_label", lang)}
            </label>
            <input
              id="pdf-file-input"
              type="file"
              accept=".pdf"
              disabled={submitting || pdfUploading}
              onChange={handlePdfChange}
              style={{ ...inputStyle, cursor: "pointer" }}
            />
            <p style={{ fontSize: "11px", color: "#6b7280", marginTop: "4px", marginBottom: 0 }}>
              {t("jobs.pdf_upload_hint", lang)}
            </p>

            {pdfUploading && (
              <p style={{ fontSize: "12px", color: "#1c7dfa", fontWeight: 600, marginTop: "8px", marginBottom: 0, display: "flex", alignItems: "center", gap: "6px" }}>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {t("jobs.pdf_uploading", lang)}
              </p>
            )}

            {pdfUrl && !pdfUploading && (
              <div style={{ marginTop: "8px", display: "flex", alignItems: "center", gap: "12px" }}>
                <p style={{ fontSize: "12px", color: "#16a34a", fontWeight: 600, margin: 0, display: "flex", alignItems: "center", gap: "6px" }}>
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {t("jobs.pdf_uploaded", lang)}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setPdfUrl("");
                    const fileInput = document.getElementById("pdf-file-input") as HTMLInputElement;
                    if (fileInput) fileInput.value = "";
                  }}
                  style={{
                    backgroundColor: "transparent", border: "none",
                    color: "#dc2626", fontSize: "12px", fontWeight: 700,
                    cursor: "pointer", textDecoration: "underline",
                    padding: 0, fontFamily: "inherit"
                  }}
                >
                  {lang === "mz" ? "Let Rawh" : "Remove PDF"}
                </button>
              </div>
            )}

            {pdfError && (
              <p style={{ fontSize: "12px", color: "#dc2626", fontWeight: 600, marginTop: "8px", marginBottom: 0 }}>
                {pdfError}
              </p>
            )}
          </div>

          {/* Listing Duration Selector — free, no price */}
          <div style={{ paddingTop: "16px", borderTop: "1px solid #f3f4f6" }}>
            <label style={labelStyle}>
              {lang === "mz" ? "Puanzar duh chhung (Listing Duration)" : "Listing Duration"}
            </label>
            <p style={{ fontSize: "12px", color: "#6b7280", fontWeight: 500, marginTop: "-4px", marginBottom: "14px" }}>
              {lang === "mz"
                ? "Engtia chhung nge i hna puanzar duh?"
                : "How long do you want your job listing to be active?"}
            </p>

            {/* Quick-select buttons: 15 and 30 days */}
            <div style={{ display: "flex", gap: "12px", marginBottom: "14px" }}>
              {(["15", "30"] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  disabled={submitting}
                  onClick={() => setDurationMode(d)}
                  style={{
                    flex: 1,
                    padding: "14px 16px",
                    borderRadius: "14px",
                    border: durationMode === d ? "2px solid #1c7dfa" : "1.5px solid #e5e7eb",
                    backgroundColor: durationMode === d ? "#eff6ff" : "#f9fafb",
                    color: durationMode === d ? "#1c7dfa" : "#4b5563",
                    fontWeight: durationMode === d ? 800 : 600,
                    fontSize: "15px",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    transition: "all 0.15s",
                  }}
                >
                  {lang === "mz" ? `Ni ${d}` : `${d} Days`}
                </button>
              ))}

              {/* Custom option button */}
              <button
                type="button"
                disabled={submitting}
                onClick={() => setDurationMode("custom")}
                style={{
                  flex: 1,
                  padding: "14px 16px",
                  borderRadius: "14px",
                  border: durationMode === "custom" ? "2px solid #1c7dfa" : "1.5px solid #e5e7eb",
                  backgroundColor: durationMode === "custom" ? "#eff6ff" : "#f9fafb",
                  color: durationMode === "custom" ? "#1c7dfa" : "#4b5563",
                  fontWeight: durationMode === "custom" ? 800 : 600,
                  fontSize: "15px",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "all 0.15s",
                }}
              >
                {lang === "mz" ? "Dang" : "Custom"}
              </button>
            </div>

            {/* Custom day input */}
            {durationMode === "custom" && (
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <input
                  type="number"
                  min={1}
                  max={30}
                  disabled={submitting}
                  value={customDays}
                  onChange={(e) => setCustomDays(e.target.value)}
                  placeholder={lang === "mz" ? "1–30 ziah rawh..." : "Enter 1–30..."}
                  style={{
                    ...inputStyle,
                    width: "160px",
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: "13px", color: "#6b7280", fontWeight: 600 }}>
                  {lang === "mz" ? "ni (days)" : "days (1–30 max)"}
                </span>
              </div>
            )}

            {/* Duration summary */}
            <div style={{ marginTop: "12px", padding: "10px 14px", backgroundColor: "#f0fdf4", borderRadius: "10px", border: "1px solid #bbf7d0", display: "inline-flex", gap: "6px", alignItems: "center" }}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#16a34a" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#16a34a" }}>
                {durationMode === "custom"
                  ? getDurationDays() > 0
                    ? lang === "mz" ? `Ni ${getDurationDays()} chhung live a ni ang` : `Will be live for ${getDurationDays()} day(s)`
                    : lang === "mz" ? "Ni ziah rawh" : "Enter number of days"
                  : lang === "mz" ? `Ni ${durationMode} chhung live a ni ang` : `Will be live for ${durationMode} days`}
              </span>
            </div>
          </div>

          {/* Submit Button */}
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
              cursor: submitting ? "not-allowed" : "pointer",
              boxShadow: "0 4px 12px rgba(28,125,250,0.2)",
              marginTop: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              fontFamily: "inherit",
              opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitting ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {lang === "mz" ? "Submit mek..." : "Submitting..."}
              </>
            ) : (
              <>
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                {lang === "mz" ? "Submit & Admin Confirmation Ngai" : "Submit for Admin Approval"}
              </>
            )}
          </button>

        </form>
      </div>
    </div>
  );
}
