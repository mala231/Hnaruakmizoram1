import Link from "next/link";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { t } from "@/lib/i18n";
import SearchFilterBar from "@/components/SearchFilterBar";

interface HomePageProps {
  searchParams: Promise<{
    query?: string;
    locationId?: string;
    categoryId?: string;
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
  const { query, locationId, categoryId } = await searchParams;
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

  // 2. Build where filter clauses
  const whereClause: any = {
    status: "live",
    employer: { isDeleted: false },
  };

  if (locationId) {
    const locId = parseInt(locationId, 10);
    if (!isNaN(locId)) whereClause.locationId = locId;
  }
  if (categoryId) {
    const catId = parseInt(categoryId, 10);
    if (!isNaN(catId)) whereClause.categoryId = catId;
  }
  if (query && query.trim()) {
    whereClause.OR = [
      { title: { contains: query.trim(), mode: "insensitive" } },
      { shortDescription: { contains: query.trim(), mode: "insensitive" } },
    ];
  }

  // 3. Fetch filtered live listings
  const jobs = await prisma.jobPost.findMany({
    where: whereClause,
    include: { employer: true, category: true, location: true },
    orderBy: { createdAt: "desc" },
  });

  const isFiltered = !!(query || locationId || categoryId);

  return (
    <div className="flex-grow flex flex-col" style={{ background: "linear-gradient(160deg, #e8f1ff 0%, #f3f7ff 45%, #fafcff 100%)" }}>

      {/* ── HERO SECTION ── */}
      <section className="relative" style={{
        minHeight: "500px",
        background: "radial-gradient(at 0% 0%, rgba(147, 197, 253, 0.45) 0px, transparent 60%), radial-gradient(at 100% 0%, rgba(122, 179, 250, 0.35) 0px, transparent 60%), radial-gradient(at 50% 100%, rgba(245, 248, 255, 1) 0px, transparent 50%), linear-gradient(135deg, #f0f6ff 0%, #ffffff 100%)"
      }}>

        {/* Background animations container (safely clips background blobs without clipping overlapping search bar) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Ambient mesh background shapes */}
          <div className="absolute top-12 right-[10%] w-72 h-72 rounded-full bg-gradient-to-tr from-secondary/25 to-tertiary/25 blur-3xl animate-float-a" />
          <div className="absolute left-[5%] bottom-10 w-56 h-56 rounded-full bg-gradient-to-br from-primary/15 to-secondary/15 blur-2xl animate-float-b" />
        </div>

        {/* Floating Glassmorphic UI Card (Mock Job Post) in Right Half */}
        <div className="absolute right-[10%] top-1/2 -translate-y-1/2 w-80 h-72 rounded-3xl border border-white/50 bg-white/10 backdrop-blur-xl shadow-2xl shadow-blue-500/5 hidden lg:flex flex-col p-6 gap-4 animate-float-c" style={{ transform: "rotate(2deg)" }}>
          <div className="flex items-center justify-between">
            <span className="bg-primary/20 text-primary text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
              Featured vacancy
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-ping" />
          </div>
          <div className="flex gap-3 items-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center font-extrabold text-primary text-sm shadow-sm">
              M
            </div>
            <div className="flex-grow flex flex-col gap-1">
              <div className="h-3 w-32 bg-slate-800/20 rounded-full" />
              <div className="h-2 w-20 bg-slate-800/10 rounded-full" />
            </div>
          </div>
          <div className="space-y-2 mt-2">
            <div className="h-2 w-full bg-slate-800/10 rounded-full" />
            <div className="h-2 w-11/12 bg-slate-800/10 rounded-full" />
            <div className="h-2 w-4/5 bg-slate-800/10 rounded-full" />
          </div>
          <div className="flex justify-between items-center mt-auto pt-3 border-t border-slate-900/5">
            <div className="h-3.5 w-16 bg-slate-800/15 rounded-full" />
            <div className="h-7 w-20 bg-primary/20 text-primary rounded-xl" />
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-container-margin-mobile md:px-container-margin-desktop pt-16 pb-24 md:pt-20 md:pb-28 flex flex-col gap-5 items-start">
          {/* Badge */}
          <span className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 text-primary px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
            <svg className="w-3 h-3 text-primary" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            Mizoram No.1 Job Directory
          </span>

          {/* Main heading */}
          <h1 className="display-lg text-slate-900 font-extrabold tracking-tight" style={{ maxWidth: "600px" }}>
            {t("home.hero_title", lang)}
          </h1>

          <p className="text-slate-600 text-base md:text-lg font-medium leading-relaxed" style={{ maxWidth: "480px" }}>
            {t("home.hero_subtitle", lang)}
          </p>

          <Link
            href="/post-job"
            className="mt-2 inline-flex items-center gap-2 bg-gradient-to-r from-primary to-primary-container text-white hover:opacity-95 font-bold text-sm px-7 py-3.5 rounded-full transition-all duration-300 shadow-xl shadow-primary/25 hover:scale-105 active:scale-95"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            {t("nav.post_job", lang)}
          </Link>
        </div>

        {/* ── Floating Search Bar ── */}
        <div className="relative z-30 w-full max-w-7xl mx-auto px-container-margin-mobile md:px-container-margin-desktop">
          <div className="bg-white rounded-2xl shadow-2xl shadow-blue-900/10 border border-blue-100/60 p-2 -mb-8">
            <SearchFilterBar districts={districts} categories={categories} lang={lang} />
          </div>
        </div>
      </section>

      {/* ── FEATURE STRIP ── */}
      <section className="relative z-10 bg-white border-b border-blue-100 pt-16 pb-10">
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

      {/* ── MAIN CONTENT: Sidebar + Jobs ── */}
      <section className="py-12 px-container-margin-mobile md:px-container-margin-desktop max-w-7xl mx-auto w-full flex-grow flex flex-col">

        {/* Section header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-display font-bold text-2xl text-on-background">
              {isFiltered ? "Search Results" : "Featured Job Listings"}
            </h2>
            <p className="text-sm text-slate-500 font-medium mt-0.5">
              {jobs.length} {jobs.length === 1 ? "job opening" : "job openings"} found
            </p>
          </div>
          {isFiltered && (
            <Link
              href="/"
              className="text-xs font-bold text-primary border border-primary/30 px-4 py-2 rounded-full hover:bg-primary/8 transition-colors"
            >
              ✕ Clear Filters
            </Link>
          )}
        </div>

        {/* Content columns — Sidebar left + Jobs right */}
        <div className="flex gap-8 items-start">

          {/* ─── Left Sidebar ─── */}
          <aside className="hidden lg:flex flex-col gap-5 w-52 shrink-0 sticky top-20">

            {/* Categories */}
            <div className="bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-blue-50 flex items-center gap-2">
                <div className="w-1.5 h-4 rounded-full bg-primary" />
                <h3 className="font-display font-bold text-xs text-on-background uppercase tracking-wider">Categories</h3>
              </div>
              <nav className="flex flex-col py-2">
                <Link
                  href="/"
                  className={`flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold transition-all ${
                    !categoryId ? "bg-primary/10 text-primary" : "text-slate-500 hover:bg-blue-50 hover:text-primary"
                  }`}
                >
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  All Jobs
                </Link>
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/?categoryId=${cat.id}`}
                    className={`flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold transition-all ${
                      categoryId === cat.id.toString()
                        ? "bg-primary/10 text-primary"
                        : "text-slate-500 hover:bg-blue-50 hover:text-primary"
                    }`}
                  >
                    <span className="shrink-0 text-current">
                      <CategoryIcon name={cat.name} />
                    </span>
                    <span className="truncate">{cat.name}</span>
                  </Link>
                ))}
              </nav>
            </div>

            {/* Post Job CTA */}
            <div className="bg-gradient-to-br from-primary to-primary-container rounded-2xl p-5 text-white shadow-xl shadow-primary/20">
              <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h3 className="font-display font-bold text-sm mb-1.5">Post a Job</h3>
              <p className="text-white/80 text-xs font-medium leading-relaxed mb-4">
                Reach thousands of job seekers in Mizoram. Starting at ₹299.
              </p>
              <Link
                href="/post-job"
                className="w-full block text-center bg-white text-primary hover:bg-blue-50 font-bold text-xs py-2.5 rounded-xl transition-colors shadow-md"
              >
                {t("nav.post_job", lang)}
              </Link>
            </div>

            {/* Districts */}
            <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4">
              <h3 className="font-display font-bold text-xs text-on-background mb-3 uppercase tracking-wider flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Districts
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {districts.slice(0, 12).map((d) => (
                  <Link
                    key={d.id}
                    href={`/?locationId=${d.id}`}
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full transition-all ${
                      locationId === d.id.toString()
                        ? "bg-primary text-white"
                        : "bg-blue-50 hover:bg-primary hover:text-white text-slate-500"
                    }`}
                  >
                    {d.name}
                  </Link>
                ))}
              </div>
            </div>
          </aside>

          {/* ─── Jobs Column ─── */}
          <div className="flex-1 min-w-0 flex flex-col gap-6">

            {/* Mobile category scroll */}
            <div className="lg:hidden flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
              <Link
                href="/"
                className={`shrink-0 text-xs font-bold px-3.5 py-2 rounded-full transition-all ${
                  !categoryId ? "bg-primary text-white shadow-sm" : "bg-white border border-blue-200 text-slate-500 hover:text-primary"
                }`}
              >
                All
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/?categoryId=${cat.id}`}
                  className={`shrink-0 text-xs font-bold px-3.5 py-2 rounded-full transition-all ${
                    categoryId === cat.id.toString()
                      ? "bg-primary text-white shadow-sm"
                      : "bg-white border border-blue-200 text-slate-500 hover:text-primary"
                  }`}
                >
                  {cat.name}
                </Link>
              ))}
            </div>

            {jobs.length === 0 ? (
              <div className="py-24 flex flex-col items-center justify-center gap-4 text-center bg-white border border-blue-100 rounded-3xl p-8 shadow-sm">
                <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center text-primary">
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-on-background">{t("jobs.no_jobs", lang)}</h3>
                  <p className="text-sm text-slate-500 font-medium mt-2" style={{ maxWidth: "320px" }}>
                    Please try different keywords or clear the filters to search again.
                  </p>
                </div>
                <Link href="/" className="mt-2 text-sm font-bold text-white bg-primary hover:bg-primary-container px-6 py-2.5 rounded-full transition-colors shadow-md">
                  Reset Search
                </Link>
              </div>
            ) : (
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
                        <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 overflow-hidden flex items-center justify-center shrink-0 shadow-sm">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={job.employer.logoUrl}
                            alt={`${job.employer.username} logo`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="bg-primary/10 text-primary text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0">
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
                            <svg className="w-3 h-3 text-primary" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          )}
                          <p className="text-[11px] text-secondary font-bold">{job.employer.username}</p>
                        </div>
                        <p className="text-xs text-slate-400 font-medium mt-2 line-clamp-2 leading-relaxed">
                          {job.shortDescription}
                        </p>
                      </div>

                      {/* Footer */}
                      <div className="pt-3 border-t border-blue-50 flex items-center justify-between">
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {job.location.name}
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 bg-blue-50 px-2.5 py-1 rounded-full">
                          {job.durationDays}d
                        </span>
                      </div>
                    </div>

                    {/* View button */}
                    <div className="px-4 pb-4">
                      <div className="w-full bg-blue-50 group-hover:bg-primary text-primary group-hover:text-white text-xs font-bold py-2.5 rounded-xl transition-all duration-300 text-center">
                        {t("jobs.view_details", lang)}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Banner Ads — shown below jobs on mobile / below jobs always */}
            {advertisements.length > 0 && (
              <div className="flex flex-col gap-4 mt-4 lg:hidden">
                {advertisements.map((ad) => (
                  <a
                    key={ad.id}
                    href={ad.targetUrl.startsWith("http") ? ad.targetUrl : `https://${ad.targetUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full rounded-2xl overflow-hidden border border-blue-100 shadow-md hover:scale-[1.02] hover:shadow-lg transition-all bg-white cursor-pointer"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={ad.imageUrl}
                      alt="Advertisement"
                      className="w-full h-auto object-cover max-h-40"
                    />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* ─── Desktop Ad Sidebar (extra column when ads exist) ─── */}
          {advertisements.length > 0 && (
            <aside className="hidden xl:flex flex-col gap-4 w-48 shrink-0 sticky top-20">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Sponsored</p>
              {advertisements.map((ad) => (
                <a
                  key={ad.id}
                  href={ad.targetUrl.startsWith("http") ? ad.targetUrl : `https://${ad.targetUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full rounded-2xl overflow-hidden border border-blue-100 shadow-md hover:scale-[1.02] hover:shadow-lg transition-all bg-white cursor-pointer"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={ad.imageUrl}
                    alt="Advertisement"
                    className="w-full h-auto object-cover max-h-64"
                  />
                </a>
              ))}
            </aside>
          )}

        </div>
      </section>

    </div>
  );
}
