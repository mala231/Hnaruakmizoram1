"use client";

import { useState, useEffect } from "react";
import { t } from "@/lib/i18n";

interface ReportModalProps {
  jobId: string;
  isOpen: boolean;
  onClose: () => void;
  lang?: string;
}

export default function ReportModal({ jobId, isOpen, onClose, lang }: ReportModalProps) {
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) {
      setError("Khawngaihin a chhan thlang rawh.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch(`/api/jobs/${jobId}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason, details }),
      });

      const data = await res.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          setReason("");
          setDetails("");
          onClose();
        }, 2500);
      } else {
        setError(data.error || "Report thawn a hlawhchham rih.");
      }
    } catch (err) {
      setError("Server biak pawh a harsat rih e.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-lg bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-2xl z-10 animate-scaleIn">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4 mb-4">
          <h2 className="title-md text-primary flex items-center gap-2">
            <svg className="w-5 h-5 text-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {t("report.title", lang)}
          </h2>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-primary transition-colors p-1 rounded-full cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        {success ? (
          <div className="py-12 flex flex-col items-center gap-4 text-center">
            <div className="w-12 h-12 rounded-full bg-success-container flex items-center justify-center text-on-success-container font-bold text-xl shadow-md">
              ✓
            </div>
            <p className="text-sm font-semibold text-on-background">
              {t("report.success_msg", lang)}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            {error && (
              <div className="p-3 rounded-xl bg-error-container border border-error/20 text-on-error-container text-xs font-semibold">
                {error}
              </div>
            )}

            {/* Reason Select */}
            <div>
              <label className="label-md text-on-background/90 mb-1.5 block">
                {t("report.reason_label", lang)}
              </label>
              <select
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full bg-surface-container border border-outline-variant/40 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-primary transition-colors text-on-background cursor-pointer"
              >
                <option value="">{t("report.reason_placeholder", lang)}</option>
                <option value="Spam / Bum">{t("report.reason_spam", lang)}</option>
                <option value="Offensive / Mawi lo">{t("report.reason_offensive", lang)}</option>
                <option value="Other">{t("report.reason_other", lang)}</option>
              </select>
            </div>

            {/* Details Area */}
            <div>
              <label className="label-md text-on-background/90 mb-1.5 block">
                {t("report.details_label", lang)}
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={4}
                className="w-full bg-surface-container border border-outline-variant/40 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-primary transition-colors text-on-background placeholder-on-surface-variant/50"
                placeholder={t("report.details_placeholder", lang)}
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-outline-variant/20">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="bg-surface-container border border-outline/25 hover:bg-surface-container-high text-on-surface text-xs font-bold px-5 py-2.5 rounded-full transition-colors cursor-pointer"
              >
                {t("report.cancel_btn", lang)}
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="bg-primary hover:bg-primary-container text-on-primary text-xs font-bold px-6 py-2.5 rounded-full shadow-md transition-colors cursor-pointer"
              >
                {submitting ? "Submitting ..." : t("report.submit_btn", lang)}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
