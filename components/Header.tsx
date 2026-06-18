"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { t } from "@/lib/i18n";

interface Option {
  id: number;
  name: string;
}

interface HeaderProps {
  lang: string;
  isLoggedIn?: boolean;
  logoUrl?: string | null;
  categories: Option[];
  districts: Option[];
}

export default function Header({
  lang,
  isLoggedIn,
  logoUrl,
  categories,
  districts,
}: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const setLangCookie = (newLang: string) => {
    if (newLang === lang) return;
    document.cookie = `lang=${newLang}; path=/; max-age=31536000`;
    window.location.reload();
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/96 backdrop-blur-lg shadow-[0_2px_16px_rgba(79,142,247,0.06)] border-b border-blue-100/70 transition-all duration-300">
      {/* Top Row: Logo, Search Bar, CTAs */}
      <div className="max-w-7xl mx-auto px-container-margin-mobile md:px-container-margin-desktop py-2.5 md:h-16 flex flex-col md:flex-row md:items-center justify-between gap-2.5 md:gap-6">
        
        {/* Logo and Mobile Controls */}
        <div className="flex items-center justify-between w-full md:w-auto gap-4">
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-md shadow-primary/30 group-hover:scale-105 transition-transform">
              <svg className="w-4.5 h-4.5 md:w-5 md:h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 6h-2.18c.07-.44.18-.86.18-1a3 3 0 0 0-6 0c0 .14.11.56.18 1H10c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-5-2a1 1 0 0 1 1 1c0 .14-.15.78-.33 1h-1.34C14.15 5.78 14 5.14 14 5a1 1 0 0 1 1-1z"/>
              </svg>
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-display font-extrabold text-base md:text-lg text-primary tracking-tight">Hnaruak</span>
              <span className="text-[9px] md:text-[10px] font-bold text-secondary/70 uppercase tracking-widest">Mizoram</span>
            </div>
          </Link>

          {/* Mobile Profile + Hamburger Menu Button */}
          <div className="lg:hidden flex items-center gap-2.5 shrink-0">
            {isLoggedIn && (
              <Link
                href="/dashboard"
                onClick={() => setIsOpen(false)}
                className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-primary/30 hover:border-primary transition-all duration-300 hover:scale-105 active:scale-95 shadow-sm block shrink-0"
                title="Dashboard / Profile"
              >
                {logoUrl ? (
                  <Image
                    src={logoUrl}
                    alt="Employer Logo"
                    width={32}
                    height={32}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-blue-50 flex items-center justify-center text-primary">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
              </Link>
            )}

            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="text-slate-500 hover:text-primary focus:outline-none p-1.5 rounded-full hover:bg-primary/8 transition-colors"
              aria-label="Toggle menu"
            >
              <svg className="h-5.5 w-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Search Bar (centered on desktop, second row on mobile) */}
        <div className="w-full md:flex-grow md:max-w-lg lg:max-w-xl md:mx-4">
          <Suspense fallback={
            <div className="w-full h-9 md:h-10 bg-slate-100 rounded-xl animate-pulse" />
          }>
            <HeaderSearchForm districts={districts} lang={lang} />
          </Suspense>
        </div>

        {/* Desktop CTA + Language Toggle */}
        <div className="hidden lg:flex items-center gap-3 shrink-0 ml-auto">
          {/* Language Toggle Dropdown */}
          <div className="relative flex items-center bg-blue-50 border border-blue-200/60 rounded-full px-2 py-1 text-[11px] font-bold text-slate-600 gap-1 hover:border-primary/50 transition-colors">
            <span className="text-xs">🌐</span>
            <span className="pr-3 select-none">{lang === "mz" ? "Mz" : "En"}</span>
            <span className="absolute right-2 pointer-events-none text-[8px] text-slate-400">▼</span>
            <select
              value={lang}
              onChange={(e) => setLangCookie(e.target.value)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            >
              <option value="mz">Mizo</option>
              <option value="en">English</option>
            </select>
          </div>

          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="relative w-9 h-9 rounded-full overflow-hidden border-2 border-primary/30 hover:border-primary transition-all duration-300 hover:scale-105 active:scale-95 shadow-sm block shrink-0"
              title="Dashboard / Profile"
            >
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt="Employer Logo"
                  width={36}
                  height={36}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-blue-50 flex items-center justify-center text-primary">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
            </Link>
          ) : (
            <Link
              href="/login"
              className="text-primary hover:text-primary-container transition-colors text-sm font-bold px-4 py-2 rounded-full hover:bg-primary/8"
            >
              {t("nav.employer_login", lang)}
            </Link>
          )}
          <Link
            href="/post-job"
            className="bg-gradient-to-r from-primary to-secondary hover:from-primary-container hover:to-primary text-white font-bold text-sm px-5 py-2.5 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 shadow-md shadow-primary/25 flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            {t("nav.post_job", lang)}
          </Link>
        </div>
      </div>

      {/* Bottom Row (Sub-header): Category Navigation */}
      <Suspense fallback={
        <div className="w-full h-11 bg-slate-50 border-b border-blue-100/40 animate-pulse" />
      }>
        <CategoryNavStrip categories={categories} lang={lang} />
      </Suspense>

      {/* Mobile Navigation Drawer */}
      {isOpen && (
        <div className="lg:hidden bg-white border-b border-blue-100 py-4 px-container-margin-mobile flex flex-col gap-4 shadow-lg animate-fade-in-down">
          {/* Mobile Language Switcher Dropdown */}
          <div className="flex items-center justify-between px-4 py-2 bg-blue-50 rounded-2xl border border-blue-100">
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
              🌐 Language
            </span>
            <div className="relative flex items-center bg-white border border-blue-200/60 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-600 gap-1">
              <span className="pr-3.5 select-none">{lang === "mz" ? "Mz" : "En"}</span>
              <span className="absolute right-2.5 pointer-events-none text-[8px] text-slate-400">▼</span>
              <select
                value={lang}
                onChange={(e) => setLangCookie(e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              >
                <option value="mz">Mizo</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>

          <hr className="border-blue-100" />
          <div className="flex flex-col gap-2.5">
            {!isLoggedIn && (
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="text-primary font-bold text-sm text-center py-3 border-2 border-primary/30 rounded-2xl hover:bg-primary/8 transition-colors"
              >
                {t("nav.employer_login", lang)}
              </Link>
            )}
            <Link
              href="/post-job"
              onClick={() => setIsOpen(false)}
              className="bg-gradient-to-r from-primary to-secondary text-white font-bold text-sm px-6 py-3 rounded-2xl transition-all shadow-md text-center"
            >
              {t("nav.post_job", lang)}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   SUB-COMPONENT: HeaderSearchForm
   Displays Districts dropdown (left), query input (middle), and orange search button (right)
   ────────────────────────────────────────────────────────────────────────── */
function HeaderSearchForm({
  districts,
  lang,
}: {
  districts: Option[];
  lang: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams?.get("query") || "");
  const [locationId, setLocationId] = useState(searchParams?.get("locationId") || "");

  // Tracks whether user is actively typing — prevents URL sync from overwriting input
  const userIsTypingRef = useRef(false);

  // Build URL params helper (preserves active categoryId)
  const buildParams = (q: string, locId: string) => {
    const params = new URLSearchParams();
    if (q.trim()) params.set("query", q.trim());
    if (locId) params.set("locationId", locId);
    const activeCategoryId = searchParams?.get("categoryId");
    if (activeCategoryId) params.set("categoryId", activeCategoryId);
    return params;
  };

  // Sync state from URL changes caused by external navigation (category pills, Clear Filters, etc.)
  // Skipped while the user is actively typing to avoid overwriting the input
  useEffect(() => {
    if (!userIsTypingRef.current) {
      setQuery(searchParams?.get("query") || "");
      setLocationId(searchParams?.get("locationId") || "");
    }
  }, [searchParams]);

  // Debounced instant search — fires 350ms after user stops typing
  // Uses router.replace so keystrokes don't spam browser history
  useEffect(() => {
    userIsTypingRef.current = true;
    const timer = setTimeout(() => {
      userIsTypingRef.current = false;
      const params = buildParams(query, locationId);
      const searchStr = params.toString();
      router.replace(searchStr ? `/?${searchStr}` : "/");
    }, 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  // Explicit submit (orange button / Enter) — uses router.push for a history entry
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    userIsTypingRef.current = false;
    const params = buildParams(query, locationId);
    const searchStr = params.toString();
    router.push(searchStr ? `/?${searchStr}` : "/");
  };

  return (
    <form
      onSubmit={handleSearch}
      className="w-full flex items-center border border-slate-200/80 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 rounded-xl overflow-hidden bg-white shadow-sm transition-all h-9 md:h-10"
    >
      {/* District Dropdown Selector */}
      <div className="relative h-full flex items-center bg-slate-50 border-r border-slate-200 hover:bg-slate-100 transition-colors shrink-0">
        <span className="absolute left-2.5 pointer-events-none text-[10px]">📍</span>
        <select
          value={locationId}
          onChange={(e) => {
            const val = e.target.value;
            setLocationId(val);
            // District changes are instant — no debounce
            const params = buildParams(query, val);
            const searchStr = params.toString();
            router.push(searchStr ? `/?${searchStr}` : "/");
          }}
          className="appearance-none bg-transparent h-full pl-7 pr-7 text-[11px] font-extrabold text-slate-600 cursor-pointer focus:outline-none"
        >
          <option value="">{lang === "mz" ? "District tin" : "All Districts"}</option>
          {districts.map((d) => (
            <option key={d.id} value={d.id.toString()}>
              {d.name}
            </option>
          ))}
        </select>
        <span className="absolute right-2.5 pointer-events-none text-[7px] text-slate-400">▼</span>
      </div>

      {/* Text search query — instant search on change */}
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={lang === "mz" ? "Hna hming, hmun, company..." : "Search jobs, location, company..."}
        className="flex-grow h-full bg-transparent px-3 text-xs md:text-sm text-slate-800 focus:outline-none placeholder-slate-400 font-medium min-w-0"
      />

      {/* Clear (✕) button — visible when query has text */}
      {query && (
        <button
          type="button"
          onClick={() => {
            setQuery("");
            const params = buildParams("", locationId);
            const searchStr = params.toString();
            router.replace(searchStr ? `/?${searchStr}` : "/");
          }}
          className="h-full px-2 text-slate-400 hover:text-slate-600 transition-colors flex items-center justify-center shrink-0 cursor-pointer"
          aria-label="Clear search"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      {/* Orange search submit button */}
      <button
        type="submit"
        className="h-full px-4 md:px-5 bg-amber-500 hover:bg-amber-600 text-white transition-colors flex items-center justify-center shrink-0 cursor-pointer"
        aria-label="Search"
      >
        <svg className="w-3.5 md:w-4 h-3.5 md:h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>
    </form>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   SUB-COMPONENT: CategoryNavStrip
   Displays "ALL CATEGORIES" blue button and horizontal scroll list of categories
   ────────────────────────────────────────────────────────────────────────── */
function CategoryNavStrip({
  categories,
  lang,
}: {
  categories: Option[];
  lang: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCategoryId = searchParams?.get("categoryId") || "";

  // Ref to the scrollable list container
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Update arrow visibility whenever scroll position or size changes
  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });
    const ro = new ResizeObserver(updateScrollState);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      ro.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -240 : 240, behavior: "smooth" });
  };

  const handleCategorySelect = (id: string) => {
    const params = new URLSearchParams();
    const query = searchParams?.get("query");
    const locationId = searchParams?.get("locationId");
    if (query) params.set("query", query);
    if (locationId) params.set("locationId", locationId);
    if (id) params.set("categoryId", id);
    const searchStr = params.toString();
    router.push(searchStr ? `/?${searchStr}` : "/");
  };

  return (
    <div className="w-full bg-slate-50 border-b border-blue-100/40 relative">
      <div className="max-w-7xl mx-auto relative flex items-center h-11">

        {/* ← Left scroll arrow */}
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 z-10 h-full px-1.5 flex items-center bg-gradient-to-r from-slate-50 via-slate-50/90 to-transparent cursor-pointer"
            aria-label="Scroll categories left"
          >
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white border border-slate-200 shadow-sm text-slate-500 hover:text-primary hover:border-primary/30 transition-colors">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </span>
          </button>
        )}

        {/* Scrollable pills list */}
        <div
          ref={scrollRef}
          className="flex items-center gap-2 overflow-x-auto scrollbar-none whitespace-nowrap px-container-margin-mobile md:px-container-margin-desktop h-full"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {/* ALL CATEGORIES Button */}
          <button
            onClick={() => handleCategorySelect("")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
              !activeCategoryId
                ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                : "bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-800"
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            {lang === "mz" ? "Hna zawng zawng" : "All Categories"}
          </button>

          {/* Category pills */}
          {categories.map((cat) => {
            const isActive = activeCategoryId === cat.id.toString();
            return (
              <button
                key={cat.id}
                onClick={() => handleCategorySelect(cat.id.toString())}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 border cursor-pointer ${
                  isActive
                    ? "bg-primary/10 border-primary/20 text-primary font-bold"
                    : "bg-white border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-primary hover:border-primary/20"
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* → Right scroll arrow */}
        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 z-10 h-full px-1.5 flex items-center bg-gradient-to-l from-slate-50 via-slate-50/90 to-transparent cursor-pointer"
            aria-label="Scroll categories right"
          >
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white border border-slate-200 shadow-sm text-slate-500 hover:text-primary hover:border-primary/30 transition-colors">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
