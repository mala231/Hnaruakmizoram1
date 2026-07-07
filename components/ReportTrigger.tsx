"use client";

import { useState } from "react";
import { t } from "@/lib/i18n";
import ReportModal from "./ReportModal";

interface ReportTriggerProps {
  jobId: string;
  lang?: string;
}

export default function ReportTrigger({ jobId, lang }: ReportTriggerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full border border-error/30 hover:bg-error-container/10 text-error font-bold text-xs py-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
      >
        <svg className="w-4.5 h-4.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        {t("jobs.report_btn", lang)}
      </button>

      <ReportModal jobId={jobId} isOpen={isOpen} onClose={() => setIsOpen(false)} lang={lang} />
    </>
  );
}
