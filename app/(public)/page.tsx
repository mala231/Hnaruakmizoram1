import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { t } from "@/lib/i18n";
import FallbackJobList from "@/components/FallbackJobList";

// ISR: revalidate homepage data every 60 seconds
export const revalidate = 60;

interface HomePageProps {
  searchParams: Promise<{
    sortBy?: string;
  }>;
}

// Category icon map — renders a small inline SVG per category name keyword
function CategoryIcon({ name }: { name: string }) {
  const n = name.toLowerCase();
  if (n.includes("tech") || n.includes("it") || n.includes("computer"))
    return (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    );
  if (n.includes("health") || n.includes("medical") || n.includes("nurse") || n.includes("doctor"))
    return (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    );
  if (n.includes("teach") || n.includes("edu") || n.includes("school") || n.includes("tutor"))
    return (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
      </svg>
    );
  if (n.includes("drive") || n.includes("transport") || n.includes("delivery"))
    return (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 17h8M3 17h1.5M19.5 17H21m-1-4l-1.5-5H5.5L4 13m15 0H5m0 0H3a1 1 0 00-1 1v2a1 1 0 001 1h1M19 13h2a1 1 0 011 1v2a1 1 0 01-1 1h-1" />
      </svg>
    );
  if (n.includes("sales") || n.includes("market") || n.includes("business"))
    return (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    );
  if (n.includes("security") || n.includes("guard") || n.includes("police"))
    return (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    );
  if (n.includes("clean") || n.includes("house") || n.includes("domestic") || n.includes("maid"))
    return (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    );
  // default
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const { sortBy } = await searchParams;
  const cookieStore = await cookies();
  const lang = cookieStore.get("lang")?.value || "mz";

  // 1. Fetch categories, districts, and active banner advertisements
  const [categories, districts, advertisements] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.location.findMany({ orderBy: { name: "asc" } }),
    prisma.advertisement.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  let orderByClause: any = { createdAt: "desc" };
  if (sortBy === "name") {
    orderByClause = { title: "asc" };
  } else if (sortBy === "deadline") {
    orderByClause = { deadline: "asc" };
  }

  // 2. Fetch live listings
  const jobs = await prisma.jobPost.findMany({
    where: {
      status: "live",
      employer: { isDeleted: false },
    },
    include: { employer: true, category: true, location: true },
    orderBy: orderByClause,
  });

  return (
    <div className="flex-grow flex flex-col" style={{ background: "linear-gradient(160deg, #e8f1ff 0%, #f3f7ff 45%, #fafcff 100%)" }}>

      {/* ── HERO SECTION ── */}
      <section className="relative" style={{
        background: "radial-gradient(at 0% 0%, rgba(147, 197, 253, 0.45) 0px, transparent 60%), radial-gradient(at 100% 0%, rgba(122, 179, 250, 0.35) 0px, transparent 60%), radial-gradient(at 50% 100%, rgba(245, 248, 255, 1) 0px, transparent 50%), linear-gradient(135deg, #f0f6ff 0%, #ffffff 100%)"
      }}>

        {/* Background animations container (safely clips background blobs without clipping overlapping search bar) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-6 right-[10%] w-48 h-48 rounded-full bg-gradient-to-tr from-secondary/20 to-tertiary/20 blur-3xl animate-float-a" />
          <div className="absolute left-[5%] bottom-4 w-36 h-36 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 blur-2xl animate-float-b" />
        </div>

        {/* Floating Glassmorphic UI Card */}
        <div className="absolute right-[8%] top-1/2 -translate-y-1/2 w-56 h-52 rounded-2xl border border-white/50 bg-white/10 backdrop-blur-xl shadow-2xl shadow-blue-500/5 hidden xl:flex flex-col p-4 gap-3 animate-float-c" style={{ transform: "rotate(2deg)" }}>
          <div className="flex items-center justify-between">
            <span className="bg-primary/20 text-primary text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Featured vacancy
            </span>
            <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
          </div>
          <div className="flex gap-2.5 items-center">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center font-extrabold text-primary text-xs shadow-sm">
              M
            </div>
            <div className="flex-grow flex flex-col gap-1">
              <div className="h-2.5 w-24 bg-slate-800/20 rounded-full" />
              <div className="h-1.5 w-16 bg-slate-800/10 rounded-full" />
            </div>
          </div>
          <div className="space-y-1.5 mt-1">
            <div className="h-1.5 w-full bg-slate-800/10 rounded-full" />
            <div className="h-1.5 w-11/12 bg-slate-800/10 rounded-full" />
            <div className="h-1.5 w-4/5 bg-slate-800/10 rounded-full" />
          </div>
          <div className="flex justify-between items-center mt-auto pt-2.5 border-t border-slate-900/5">
            <div className="h-3 w-14 bg-slate-800/15 rounded-full" />
            <div className="h-6 w-16 bg-primary/20 text-primary rounded-lg" />
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-container-margin-mobile md:px-container-margin-desktop pt-8 pb-10 md:pt-10 md:pb-12 flex flex-col gap-3 items-start">
          {/* Badge */}
          <span className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 text-primary px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider shadow-sm">
            <svg className="w-3 h-3 text-primary" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            Mizoram Job Board
          </span>

          {/* Main heading */}
          <h1 className="headline-lg text-slate-900 font-extrabold tracking-tight" style={{ maxWidth: "520px" }}>
            {t("home.hero_title", lang)}
          </h1>

          <p className="text-slate-600 text-sm md:text-base font-medium leading-relaxed" style={{ maxWidth: "420px" }}>
            {t("home.hero_subtitle", lang)}
          </p>

          <Link
            href="/post-job"
            className="mt-1 inline-flex items-center gap-2 bg-gradient-to-r from-primary to-primary-container text-white hover:opacity-95 font-bold text-sm px-6 py-2.5 rounded-full transition-all duration-300 shadow-lg shadow-primary/25 hover:scale-105 active:scale-95"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            {t("nav.post_job", lang)}
          </Link>
        </div>


      </section>



      {/* ── MAIN CONTENT: Sidebar + Jobs ── */}
      <section
        className="py-12 px-container-margin-mobile md:px-container-margin-desktop max-w-7xl mx-auto w-full flex-grow flex flex-col"
      >
        {/* Section header */}
        <div className="flex flex-col gap-3 mb-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-display font-bold text-2xl text-on-background">
                Featured Job Listings
              </h2>
              <p className="text-sm text-slate-500 font-medium mt-0.5">
                {lang === "en" ? (
                  `${jobs.length} ${jobs.length === 1 ? "job opening" : "job openings"} found`
                ) : (
                  `${jobs.length} ${jobs.length === 1 ? "Hna ruak hmuh a ni" : "Hna ruak hmuh a ni"}`
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Content columns — Jobs + Ad Sidebar */}
        <div className="flex gap-8 items-start">

          {/* ─── Jobs Column ─── */}
          <div className="flex-1 min-w-0 flex flex-col gap-6">

            {jobs.length === 0 ? (
              <div className="py-24 flex flex-col items-center justify-center gap-4 text-center bg-white border border-blue-100 rounded-3xl p-8 shadow-sm">
                <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center text-primary">
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-on-background">{t("jobs.no_jobs", lang)}</h3>
                </div>
              </div>
            ) : (
              <FallbackJobList jobs={jobs} lang={lang} />
            )}

            {/* Banner Ads — shown below jobs on mobile / below jobs always */}
            {advertisements.length > 0 && (
              <div className="flex flex-col gap-4 mt-4 lg:hidden">
                {advertisements.map((ad) => {
                  const isSlot2 = ad.position === "sidebar_2";
                  const effectClass = isSlot2 ? "animate-ad-slot-2" : "animate-ad-slot-1";
                  
                  return (
                    <a
                      key={ad.id}
                      href={ad.targetUrl.startsWith("http") ? ad.targetUrl : `https://${ad.targetUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`block w-full rounded-2xl overflow-hidden border border-blue-100/80 shadow-md hover:scale-[1.03] hover:shadow-xl hover:shadow-primary/15 transition-all duration-300 bg-white cursor-pointer ad-shine-effect ${effectClass}`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={ad.imageUrl}
                        alt="Advertisement"
                        className="w-full h-auto object-cover max-h-40"
                      />
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {/* ─── Desktop Ad Sidebar (extra column when ads exist) ─── */}
          {advertisements.length > 0 && (
            <aside className="hidden xl:flex flex-col gap-4 w-48 shrink-0 sticky top-20">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Sponsored</p>
              {advertisements.map((ad) => {
                const isSlot2 = ad.position === "sidebar_2";
                const effectClass = isSlot2 ? "animate-ad-slot-2" : "animate-ad-slot-1";
                
                return (
                  <a
                    key={ad.id}
                    href={ad.targetUrl.startsWith("http") ? ad.targetUrl : `https://${ad.targetUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`block w-full rounded-2xl overflow-hidden border border-blue-100/80 shadow-md hover:scale-[1.03] hover:shadow-xl hover:shadow-primary/15 transition-all duration-300 bg-white cursor-pointer ad-shine-effect ${effectClass}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={ad.imageUrl}
                      alt="Advertisement"
                      className="w-full h-auto object-cover max-h-64"
                    />
                  </a>
                );
              })}
            </aside>
          )}

        </div>
      </section>

      {/* ── FEATURE STRIP ── */}
      <section className="relative z-10 bg-white border-t border-blue-100 py-16 pb-10">
        <div className="max-w-7xl mx-auto px-container-margin-mobile md:px-container-margin-desktop">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                ),
                title: "Easy Job Search",
                desc: "Search active job vacancies in Mizoram by category and district easily.",
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ),
                title: "Verified Employers",
                desc: "All employers are verified by administrators to ensure listing reliability.",
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ),
                title: "Daily Updates",
                desc: "New vacancies are added daily to keep your search fresh.",
              },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4 p-5 rounded-2xl hover:bg-blue-50 transition-colors group">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-sm">
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-on-background mb-1">{item.title}</h3>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
