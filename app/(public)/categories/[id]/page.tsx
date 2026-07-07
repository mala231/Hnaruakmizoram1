import Link from "next/link";
import { cookies } from "next/headers";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCachedCategories, getCachedDistricts, getCachedAdvertisements } from "@/lib/queries";
import { FALLBACK_CATEGORIES, FALLBACK_DISTRICTS } from "@/lib/fallbacks";
import { t } from "@/lib/i18n";
import FallbackJobList from "@/components/FallbackJobList";

interface CategoryPageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    query?: string;
    locationId?: string;
    sortBy?: string;
  }>;
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { id } = await params;
  const { query, locationId, sortBy } = await searchParams;
  const cookieStore = await cookies();
  const lang = cookieStore.get("lang")?.value || "mz";

  // 1. Fetch cached categories, locations/districts, and active banner advertisements
  let categories: any[] = [];
  let districts: any[] = [];
  let advertisements: any[] = [];

  try {
    const [cats, dists, ads] = await Promise.all([
      getCachedCategories(),
      getCachedDistricts(),
      getCachedAdvertisements(),
    ]);
    categories = cats;
    districts = dists;
    advertisements = ads;
  } catch (error) {
    console.error("Categories page failed to fetch cached categories/districts/advertisements. Using fallbacks.", error);
    categories = FALLBACK_CATEGORIES;
    districts = FALLBACK_DISTRICTS;
    advertisements = [];
  }

  const allCategoriesItem = categories.find((c) => c.name.toLowerCase() === "all categories");

  // Redirect /categories/all to the database category ID for "All Categories"
  if (id === "all" && allCategoriesItem) {
    const searchParamsObj = await searchParams;
    const paramsStr = new URLSearchParams(searchParamsObj).toString();
    redirect(`/categories/${allCategoriesItem.id}${paramsStr ? `?${paramsStr}` : ""}`);
  }

  const isAllCategories = id === "all" || (allCategoriesItem && parseInt(id, 10) === allCategoriesItem.id);

  // 2. Build where filter clauses
  let categoryName = "";
  const whereClause: any = {
    status: "live",
    employer: { isDeleted: false },
  };

  if (!isAllCategories) {
    const catId = parseInt(id, 10);
    if (!isNaN(catId)) {
      whereClause.categoryId = catId;
      categoryName = categories.find((c) => c.id === catId)?.name || "";
    }
  }

  if (locationId) {
    const locId = parseInt(locationId, 10);
    if (!isNaN(locId)) {
      whereClause.locationId = locId;
    }
  }

  if (query && query.trim()) {
    whereClause.OR = [
      { title: { contains: query.trim(), mode: "insensitive" } },
      { shortDescription: { contains: query.trim(), mode: "insensitive" } },
    ];
  }

  let orderByClause: any = { createdAt: "desc" };
  if (sortBy === "name") {
    orderByClause = { title: "asc" };
  } else if (sortBy === "deadline") {
    orderByClause = { deadline: "asc" };
  }

  // 3. Fetch filtered listings
  let jobs: any[] = [];
  try {
    jobs = await prisma.jobPost.findMany({
      where: whereClause,
      include: { employer: true, category: true, location: true },
      orderBy: orderByClause,
    });
  } catch (error) {
    console.error("Categories page failed to query jobs:", error);
  }

  const isFiltered = !!(query || locationId || !isAllCategories);

  // Determine section title
  let sectionTitle = "Job Listings";
  if (isAllCategories) {
    sectionTitle = query || locationId ? "Search Results" : "All Job Listings";
  } else {
    sectionTitle = categoryName ? `${categoryName} Jobs` : "Category Job Listings";
  }

  return (
    <div className="flex-grow flex flex-col" style={{ background: "linear-gradient(160deg, #e8f1ff 0%, #f3f7ff 45%, #fafcff 100%)" }}>
      {/* ── MAIN CONTENT: Sidebar + Jobs ── */}
      <section
        className="py-12 px-container-margin-mobile md:px-container-margin-desktop max-w-full mx-auto w-full flex-grow flex flex-col"
      >
        {/* Section header */}
        <div className="flex flex-col gap-3 mb-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-display font-bold text-2xl text-on-background">
                {sectionTitle}
              </h2>
              <p className="text-sm text-slate-500 font-medium mt-0.5">
                {lang === "en" ? (
                  `${jobs.length} ${jobs.length === 1 ? "job opening" : "job openings"} found`
                ) : (
                  `${jobs.length} ${jobs.length === 1 ? "Hna ruak hmuh a ni" : "Hna ruak hmuh a ni"}`
                )}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {isFiltered && (
                <Link
                  href="/categories/all"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-red-500 border border-red-200 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-full transition-colors shrink-0"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Clear All
                </Link>
              )}
            </div>
          </div>
          {/* Active filter tags */}
          {isFiltered && (
            <div className="flex flex-wrap gap-2">
              {query && (
                <Link
                  href={`/categories/${id}?${new URLSearchParams({ ...(locationId ? { locationId } : {}) }).toString()}`}
                  className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 text-primary text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-colors group"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  &ldquo;{query}&rdquo;
                  <svg className="w-3.5 h-3.5 group-hover:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Link>
              )}
              {!isAllCategories && (
                <Link
                  href={`/categories/all?${new URLSearchParams({ ...(query ? { query } : {}), ...(locationId ? { locationId } : {}) }).toString()}`}
                  className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-colors group"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a2 2 0 012-2z" />
                  </svg>
                  {categoryName || "Category"}
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Link>
              )}
              {locationId && (
                <Link
                  href={`/categories/${id}?${new URLSearchParams({ ...(query ? { query } : {}) }).toString()}`}
                  className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-colors group"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {districts.find((d) => d.id.toString() === locationId)?.name ?? "District"}
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Link>
              )}
            </div>
          )}
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
                  <p className="text-sm text-slate-500 font-medium mt-2" style={{ maxWidth: "320px" }}>
                    Please try different keywords or clear the filters to search again.
                  </p>
                </div>
                <Link
                  href="/categories/all"
                  className="mt-2 text-sm font-bold text-white bg-primary hover:bg-primary-container px-6 py-2.5 rounded-full transition-colors shadow-md"
                >
                  Reset Search
                </Link>
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
        <div className="max-w-full mx-auto px-container-margin-mobile md:px-container-margin-desktop">
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
