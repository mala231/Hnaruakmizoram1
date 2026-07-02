"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { t } from "@/lib/i18n";
import SortSelect from "@/components/SortSelect";

interface FallbackJobListProps {
  jobs: any[];
  lang: string;
}

function formatDate(dateInput: Date | string | number) {
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return "N/A";
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export default function FallbackJobList({ jobs, lang }: FallbackJobListProps) {
  const [layout, setLayout] = useState<"grid" | "list">("list");

  return (
    <div className="flex flex-col gap-6">
      {/* Header bar with total jobs count and grid/list view switcher */}
      <div className="flex items-center justify-between bg-white border border-blue-100 rounded-2xl px-5 py-3 shadow-sm select-none">
        <span className="text-xs font-bold text-slate-500">
          {lang === "en" ? (
            `${jobs.length} ${jobs.length === 1 ? "job opening" : "job openings"} found`
          ) : (
            `${jobs.length} ${jobs.length === 1 ? "Hna ruak hmuh a ni" : "Hna ruak hmuh a ni"}`
          )}
        </span>
        <div className="flex items-center gap-3 shrink-0">
          <Suspense fallback={<div className="w-20 h-8 bg-slate-100 rounded-xl animate-pulse" />}>
            <SortSelect />
          </Suspense>
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/60 p-0.5 rounded-lg shrink-0">
            <button
              type="button"
              onClick={() => setLayout("grid")}
              className={`p-1.5 rounded-md cursor-pointer transition-colors ${layout === "grid"
                ? "bg-white text-primary shadow-sm"
                : "text-slate-400 hover:text-slate-600"
                }`}
              title="Grid View"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setLayout("list")}
              className={`p-1.5 rounded-md cursor-pointer transition-colors ${layout === "list"
                ? "bg-white text-primary shadow-sm"
                : "text-slate-400 hover:text-slate-600"
                }`}
              title="List View"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {layout === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {jobs.map((job, i) => (
            <Link
              key={job.id}
              href={`/jobs/${job.id}`}
              style={{ animationDelay: `${i * 40}ms` }}
              className="animate-fade-in-up bg-white border border-blue-100 hover:border-primary/40 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 group flex flex-col cursor-pointer"
            >
              {/* Top accent bar */}
              <div className="h-1 bg-gradient-to-r from-primary via-secondary to-tertiary" />

              <div className="p-4 flex flex-col flex-grow gap-3">
                {/* Logo + Category badge */}
                <div className="flex items-start justify-between gap-2">
                  <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center shrink-0 shadow-sm relative">
                    {job.employer.logoUrl ? (
                      <Image
                        src={job.employer.logoUrl}
                        alt={`${job.employer.username} logo`}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center text-white text-sm font-bold"
                        style={{
                          background: `hsl(${(job.employer.username?.charCodeAt(0) || 65) * 137 % 360}, 55%, 48%)`,
                        }}
                      >
                        {job.employer.username?.charAt(0)?.toUpperCase()}
                      </div>
                    )}
                  </div>
                  <span className="bg-primary/10 text-blue-700 text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0">
                    {job.category.name}
                  </span>
                </div>

                {/* Text */}
                <div className="flex-grow">
                  <h3 className="font-display font-bold text-sm text-on-background group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                    {job.title}
                  </h3>
                  <div className="flex items-center gap-1 mt-1">
                    {job.employer.isVerified && (
                      <svg className="w-3.5 h-3.5 text-primary shrink-0" fill="currentColor" viewBox="0 0 20 20" style={{ color: "#1c7dfa" }}>
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                    <p className="text-[11px] text-blue-700 font-bold">{job.employer.username}</p>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-2 line-clamp-2 leading-relaxed">
                    {job.shortDescription}
                  </p>
                </div>

                {/* Footer */}
                <div className="pt-3 border-t border-blue-50 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[10px] text-slate-500 font-semibold">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {job.location.name}
                  </div>
                  <span className="text-[10px] text-slate-500 font-semibold">
                    {t("jobs.deadline", lang)}: {job.deadline ? formatDate(job.deadline) : "N/A"}
                  </span>
                </div>
              </div>

              {/* View button */}
              <div className="px-4 pb-4">
                <div className="w-full bg-blue-50 group-hover:bg-primary text-blue-700 group-hover:text-white text-xs font-bold py-2.5 rounded-xl transition-all duration-300 text-center">
                  {t("jobs.view_details", lang)}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {jobs.map((job, i) => (
            <Link
              key={job.id}
              href={`/jobs/${job.id}`}
              style={{ animationDelay: `${i * 40}ms` }}
              className="animate-fade-in-up bg-white border border-blue-100 hover:border-primary/40 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-0.5 group flex flex-col sm:flex-row cursor-pointer"
            >
              {/* Left accent bar */}
              <div className="w-full sm:w-1.5 h-1 sm:h-auto bg-gradient-to-b sm:bg-gradient-to-r from-primary via-secondary to-tertiary shrink-0" />

              <div className="p-5 flex flex-col sm:flex-row flex-grow items-start sm:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-4 min-w-0">
                  {/* Logo */}
                  <div className="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center shrink-0 shadow-sm relative">
                    {job.employer.logoUrl ? (
                      <Image
                        src={job.employer.logoUrl}
                        alt={`${job.employer.username} logo`}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center text-white text-base font-bold"
                        style={{
                          background: `hsl(${(job.employer.username?.charCodeAt(0) || 65) * 137 % 360}, 55%, 48%)`,
                        }}
                      >
                        {job.employer.username?.charAt(0)?.toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Info Text */}
                  <div className="min-w-0">
                    <h3 className="font-display font-bold text-sm text-on-background group-hover:text-primary transition-colors line-clamp-1 leading-snug">
                      {job.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-[11px] font-bold text-slate-400">
                      <div className="flex items-center gap-1">
                        {job.employer.isVerified && (
                          <svg className="w-3.5 h-3.5 text-primary shrink-0" fill="currentColor" viewBox="0 0 20 20" style={{ color: "#1c7dfa" }}>
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                        <span className="text-blue-700">{job.employer.username}</span>
                      </div>
                      <span>•</span>
                      <span className="flex items-center gap-0.5">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {job.location.name}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-1.5 line-clamp-1 hidden md:block" style={{ maxWidth: "420px" }}>
                      {job.shortDescription}
                    </p>
                  </div>
                </div>

                {/* Right Section badges and deadline */}
                <div className="flex sm:flex-col items-start sm:items-end gap-2 sm:gap-1.5 shrink-0 w-full sm:w-auto justify-between sm:justify-center border-t sm:border-0 border-slate-100 pt-3 sm:pt-0">
                  <span className="bg-primary/10 text-blue-700 text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0">
                    {job.category.name}
                  </span>
                  <span className="text-[10px] text-slate-500 font-bold shrink-0">
                    {t("jobs.deadline", lang)}: {job.deadline ? formatDate(job.deadline) : "N/A"}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
