"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { t } from "@/lib/i18n";
import MapSelector from "@/components/MapSelector";

interface Option {
  id: number;
  name: string;
}

interface JobData {
  id: string;
  title: string;
  shortDescription: string;
  description: string;
  categoryId: number;
  locationId: number;
  address: string;
  deadline: string | Date;
  interviewTime: string;
}

interface EditJobFormProps {
  job: JobData;
  categories: Option[];
  locations: Option[];
}

export default function EditJobForm({ job, categories, locations }: EditJobFormProps) {
  const router = useRouter();

  // Preset initial states
  const [title, setTitle] = useState(job.title);
  const [shortDescription, setShortDescription] = useState(job.shortDescription);
  const [description, setDescription] = useState(job.description);
  const [categoryId, setCategoryId] = useState(job.categoryId.toString());
  const [locationId, setLocationId] = useState(job.locationId.toString());
  const [address, setAddress] = useState(job.address);
  const [deadline, setDeadline] = useState(
    new Date(job.deadline).toISOString().split("T")[0]
  );
  const [interviewTime, setInterviewTime] = useState(job.interviewTime);

  // Status states
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!categoryId || !locationId) {
      setErrorMsg("Khawngaihin Category leh District thlang rawh.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(`/api/jobs/${job.id}`, {
        method: "PUT",
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
        }),
      });

      const data = await res.json();

      if (data.success) {
        setSuccessMsg("Tihdanglamna a hlawhtling ta! Dashboard-ah kan hruai leh dawn che nia.");
        setTimeout(() => {
          router.push("/dashboard");
          router.refresh();
        }, 2000);
      } else {
        setErrorMsg(data.error || "Tihdanglamna a hlawhchham rih.");
        setSubmitting(false);
      }
    } catch (err) {
      setErrorMsg("Server biak pawh a harsat rih e.");
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      maxWidth: "768px",
      margin: "0 auto",
      backgroundColor: "#ffffff",
      border: "1px solid rgba(28,125,250,0.1)",
      borderRadius: "24px",
      padding: "32px",
      boxShadow: "0 12px 40px rgba(28,125,250,0.08)",
      fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    }}>
      {/* Header */}
      <div style={{ borderBottom: "1px solid #f0f9ff", paddingBottom: "16px", marginBottom: "32px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#1c7dfa", margin: 0 }}>Hna Puanzar Tihdanglamna</h1>
        <p style={{ fontSize: "12px", color: "#6b7280", fontWeight: 600, marginTop: "6px", marginBottom: 0 }}>
          Puanzar tawh hnu thil ziah sual palh awm te siamthatna.
        </p>
      </div>

      {/* Dynamic Alerts */}
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

      {/* Edit Form */}
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        
        {/* Job Title */}
        <div>
          <label style={{ fontSize: "13px", fontWeight: 700, color: "#0f1b30", display: "block", marginBottom: "8px" }}>
            Hna Hming (Job Title)
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
          <label style={{ fontSize: "13px", fontWeight: 700, color: "#0f1b30", display: "block", marginBottom: "8px" }}>
            Tawi fel taka hrilhfiahna (Short Description)
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
          />
        </div>

        {/* Category & District Dropdowns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label style={{ fontSize: "13px", fontWeight: 700, color: "#0f1b30", display: "block", marginBottom: "8px" }}>
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
              <option value="">Category thlang rawh...</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id.toString()}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: "13px", fontWeight: 700, color: "#0f1b30", display: "block", marginBottom: "8px" }}>
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
              <option value="">District thlang rawh...</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id.toString()}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Full Description */}
        <div>
          <label style={{ fontSize: "13px", fontWeight: 700, color: "#0f1b30", display: "block", marginBottom: "8px" }}>
            Chipchiar taka hrilhfiahna (Full Description)
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
            placeholder="Hna chanchin, thiamna ngai te, dil dan tur chipchiar takin..."
          />
        </div>

        {/* Address */}
        <div>
          <label style={{ fontSize: "13px", fontWeight: 700, color: "#0f1b30", display: "block", marginBottom: "8px" }}>
            Hmun Awmna Dilna / Address
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
          />
          <MapSelector address={address} onChangeAddress={setAddress} lang="mz" />
        </div>

        {/* Deadline & Interview Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label style={{ fontSize: "13px", fontWeight: 700, color: "#0f1b30", display: "block", marginBottom: "8px" }}>
              Dil tawp ni (Deadline Date)
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
            <label style={{ fontSize: "13px", fontWeight: 700, color: "#0f1b30", display: "block", marginBottom: "8px" }}>
              Interview Hun (Interview Time)
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
            />
          </div>
        </div>

        {/* Form Actions */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "12px", paddingTop: "20px", borderTop: "1px solid #f3f4f6" }}>
          <button
            type="button"
            onClick={() => router.back()}
            disabled={submitting}
            style={{
              backgroundColor: "#f3f4f6",
              border: "1px solid #e5e7eb",
              color: "#4b5563",
              fontSize: "12px",
              fontWeight: 700,
              padding: "12px 24px",
              borderRadius: "100px",
              cursor: "pointer",
              fontFamily: "inherit"
            }}
          >
            Kir leh (Cancel)
          </button>
          <button
            type="submit"
            disabled={submitting}
            style={{
              background: "linear-gradient(135deg,#1c7dfa,#0a84ff)",
              border: "none",
              color: "#ffffff",
              fontSize: "12px",
              fontWeight: 700,
              padding: "12px 28px",
              borderRadius: "100px",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(28,125,250,0.2)",
              fontFamily: "inherit"
            }}
          >
            {submitting ? "Khek mek..." : "Khek rawh (Save Changes)"}
          </button>
        </div>

      </form>
    </div>
  );
}
