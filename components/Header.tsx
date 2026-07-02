"use client";

import { useState, useEffect, Suspense, useRef, useCallback, createContext, useContext } from "react";
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

const SearchContext = createContext<{
  locationId: string;
  setLocationId: (id: string) => void;
  categoryId: string;
  setCategoryId: (id: string) => void;
} | null>(null);

function useSearch() {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error("useSearch must be used within a SearchProvider");
  }
  return context;
}

function SearchProvider({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [locationId, setLocationId] = useState(searchParams?.get("locationId") || "");
  const [categoryId, setCategoryId] = useState(() => {
    const match = pathname?.match(/\/categories\/([^/]+)/);
    return match && match[1] !== "all" ? match[1] : "";
  });

  // Sync state from URL changes caused by external navigation (category pills, clear filters, etc.)
  useEffect(() => {
    setLocationId(searchParams?.get("locationId") || "");
    const match = pathname?.match(/\/categories\/([^/]+)/);
    if (match && match[1] !== "all") {
      setCategoryId(match[1]);
    } else {
      setCategoryId("");
    }
  }, [searchParams, pathname]);

  return (
    <SearchContext.Provider value={{ locationId, setLocationId, categoryId, setCategoryId }}>
      {children}
    </SearchContext.Provider>
  );
}

export default function Header(props: HeaderProps) {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <Suspense fallback={
      <header className="sticky top-0 z-40 w-full bg-white/96 border-b border-blue-100/70 h-[108px] animate-pulse">
        <div className="max-w-full mx-auto px-container-margin-mobile md:px-container-margin-desktop py-2.5 md:h-16 flex items-center justify-between">
          <div className="w-24 h-8 bg-slate-100 rounded-lg" />
          <div className="flex-grow max-w-lg md:mx-4 h-9 bg-slate-100 rounded-xl" />
          <div className="w-32 h-9 bg-slate-100 rounded-lg" />
        </div>
        <div className="w-full bg-slate-50 border-b border-blue-100/40 h-11" />
      </header>
    }>
      <SearchProvider>
        <HeaderContent {...props} />
      </SearchProvider>
    </Suspense>
  );
}

function HeaderContent({
  lang,
  isLoggedIn,
  logoUrl,
  categories,
  districts,
}: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const { categoryId, setCategoryId, locationId } = useSearch();

  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(e.target as Node)) {
        setIsCategoryOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleCategorySelect = (id: string) => {
    setCategoryId(id);
    const params = new URLSearchParams();
    const query = searchParams?.get("query");
    if (query) params.set("query", query);
    if (locationId) params.set("locationId", locationId);
    const searchStr = params.toString();
    const targetPath = `/categories/${id || "all"}`;
    router.push(searchStr ? `${targetPath}?${searchStr}` : targetPath);
  };

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const setLangCookie = (newLang: string) => {
    if (newLang === lang) return;
    document.cookie = `lang=${newLang}; path=/; max-age=31536000`;
    window.location.reload();
  };

  return (
    <header className="relative sticky top-0 z-40 w-full bg-white/96 backdrop-blur-lg shadow-[0_2px_16px_rgba(79,142,247,0.06)] border-b border-blue-100/70 transition-all duration-300">
      {/* Top Row: Logo, Search Bar, CTAs */}
      <div className="max-w-full mx-auto px-container-margin-mobile md:px-container-margin-desktop py-2.5 md:h-16 flex flex-col md:flex-row md:items-center justify-between gap-2.5 md:gap-6">

        {/* Logo and Mobile Controls */}
        <div className="flex items-center justify-between w-full md:w-auto gap-4">
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <Image
              src="/logo.png"
              alt="Hnaruak Mizoram Logo"
              width={36}
              height={36}
              className="w-8 h-8 md:w-9 md:h-9 rounded-lg object-contain group-hover:scale-105 transition-transform"
            />
            <div className="flex flex-col leading-none">
              <span className="font-display font-extrabold text-base md:text-lg text-blue-700 tracking-tight">Hnaruak</span>
              <span className="text-[9px] md:text-[10px] font-bold text-slate-600 uppercase tracking-widest">Mizoram</span>
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
        <div className="w-full md:flex-grow md:max-w-2xl lg:max-w-4xl md:mx-4 flex flex-col gap-1.5">
          <Suspense fallback={
            <div className="w-full h-9 md:h-10 bg-slate-100 rounded-xl animate-pulse" />
          }>
            <HeaderSearchForm districts={districts} lang={lang} />
          </Suspense>

          {/* Categories dropdown under search bar on mobile only */}
          <div ref={categoryDropdownRef} className="flex sm:hidden w-full relative">
            <div className="relative w-[105px] max-w-[105px]">
              <button
                type="button"
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                className={`relative flex items-center justify-center h-[34px] px-3 rounded-md border text-[14px] font-bold transition-all w-full cursor-pointer focus:outline-none ${(categoryId && categoryId !== "11")
                  ? "bg-primary/10 border-primary/70 text-blue-700"
                  : "bg-white border-slate-300 text-slate-700 hover:border-primary/30"
                  }`}
              >
                <span className="truncate pr-3.5">
                  {categoryId === "all"
                    ? (lang === "mz" ? "Hna Zawng Zawng" : "All Categories")
                    : (categories.find(c => c.id.toString() === categoryId)?.name || (lang === "mz" ? "Hna" : "Jobs"))
                  }
                </span>
                <span className="absolute right-2 text-[8px] text-slate-500">▼</span>
              </button>

              {isCategoryOpen && (
                <div className="absolute top-full left-0 mt-1.5 w-44 max-h-60 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-1 flex flex-col animate-scaleIn">
                  <button
                    type="button"
                    onClick={() => {
                      handleCategorySelect("");
                      setIsCategoryOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-[10px] font-bold transition-colors cursor-pointer hover:bg-slate-50 ${!categoryId ? "text-primary bg-primary/5" : "text-slate-600"
                      }`}
                  >
                    {lang === "mz" ? "Hna" : "Jobs"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleCategorySelect("all");
                      setIsCategoryOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-[10px] font-bold transition-colors cursor-pointer hover:bg-slate-50 ${categoryId === "all" ? "text-primary bg-primary/5" : "text-slate-600"
                      }`}
                  >
                    {lang === "mz" ? "Hna Zawng Zawng" : "All Categories"}
                  </button>
                  {categories
                    .filter((cat) => cat.id !== 11)
                    .map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          handleCategorySelect(cat.id.toString());
                          setIsCategoryOpen(false);
                        }}
                        className={`w-full text-left px-3.5 py-2 text-[10px] font-bold transition-colors cursor-pointer hover:bg-slate-50 ${categoryId === cat.id.toString() ? "text-primary bg-primary/5" : "text-slate-600"
                          }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                </div>
              )}
            </div>
          </div>
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
              aria-label="Select language"
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
      <div className="hidden sm:block">
        <Suspense fallback={
          <div className="w-full h-11 bg-slate-50 border-b border-blue-100/40 animate-pulse" />
        }>
          <CategoryNavStrip categories={categories} lang={lang} />
        </Suspense>
      </div>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <>
          {/* Transparent backdrop — tap anywhere outside to close */}
          <div
            className="lg:hidden fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Dropdown card anchored below the ≡ button */}
          <div className="lg:hidden absolute top-full right-4 mt-2 w-56 bg-white border border-blue-100/80 rounded-2xl shadow-xl shadow-blue-100/50 z-50 overflow-hidden animate-fade-in-down">

            {/* Language row */}
            <div className="px-3 pt-3 pb-2 border-b border-blue-50">
              <div className="flex items-center justify-between px-3 py-2 bg-blue-50/70 rounded-xl border border-blue-100/60">
                <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">🌐 Language</span>
                <div className="relative flex items-center bg-white border border-blue-200/60 rounded-lg px-3 py-1 text-xs font-bold text-slate-600 gap-1 active:bg-primary/10 transition-colors">
                  <span className="pr-3.5 select-none">{lang === "mz" ? "Mz" : "En"}</span>
                  <span className="absolute right-2 pointer-events-none text-[8px] text-slate-400">▼</span>
                  <select
                    value={lang}
                    onChange={(e) => setLangCookie(e.target.value)}
                    aria-label="Select language"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  >
                    <option value="mz">Mizo</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Nav links */}
            <div className="px-2 py-2 flex flex-col gap-1">
              {isLoggedIn && (
                <Link
                  href="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 text-slate-700 font-semibold text-sm px-4 py-2.5 rounded-xl hover:bg-primary/6 active:bg-primary/12 transition-colors"
                >
                  <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Dashboard
                </Link>
              )}

              {!isLoggedIn && (
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 text-primary font-semibold text-sm px-4 py-2.5 rounded-xl hover:bg-primary/6 active:bg-primary/12 transition-colors"
                >
                  <svg className="w-4 h-4 text-primary/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  {t("nav.employer_login", lang)}
                </Link>
              )}

              <Link
                href="/post-job"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-primary to-secondary text-white font-bold text-sm px-4 py-2.5 rounded-xl active:scale-95 active:opacity-90 transition-all shadow-sm shadow-primary/25 mt-1"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                {t("nav.post_job", lang)}
              </Link>
            </div>
          </div>
        </>
      )}
    </header>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   SUB-COMPONENT: HeaderSearchForm
   Displays Districts dropdown (left), query input (middle), and orange search button (right)
   ────────────────────────────────────────────────────────────────────────── */
type Suggestion = {
  type: "job" | "category" | "location";
  label: string;
  id?: number;
};

function HeaderSearchForm({
  districts,
  lang,
}: {
  districts: Option[];
  lang: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [query, setQuery] = useState(searchParams?.get("query") || "");
  const { locationId, setLocationId } = useSearch();

  const [isDistrictOpen, setIsDistrictOpen] = useState(false);
  const districtRef = useRef<HTMLDivElement>(null);

  // Auto-suggest state
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const userIsTypingRef = useRef(false);
  const isInitialMount = useRef(true);

  // Build URL params helper
  const buildParams = (q: string, locId: string) => {
    const params = new URLSearchParams();
    if (q.trim()) params.set("query", q.trim());
    if (locId) params.set("locationId", locId);
    return params;
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
        setActiveIndex(-1);
      }
      if (districtRef.current && !districtRef.current.contains(e.target as Node)) {
        setIsDistrictOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Sync state from URL changes caused by external navigation (category pills, etc.)
  useEffect(() => {
    if (!userIsTypingRef.current) {
      setQuery(searchParams?.get("query") || "");
    }
  }, [searchParams]);

  // Fetch auto-suggestions with 200ms debounce
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    setIsFetchingSuggestions(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/suggestions?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setSuggestions(data.suggestions || []);
        setShowSuggestions(data.suggestions?.length > 0);
        setActiveIndex(-1);
      } catch {
        setSuggestions([]);
      } finally {
        setIsFetchingSuggestions(false);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [query]);

  // Debounced instant search — fires 350ms after user stops typing
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Only allow auto-redirect on category pages or when there's an active query.
    // If we are on static pages (about, contact, etc.) or home without a query, do nothing.
    const isCategoryPage = pathname?.startsWith("/categories/");
    if (!isCategoryPage && !query.trim()) {
      return;
    }

    userIsTypingRef.current = true;
    const timer = setTimeout(() => {
      userIsTypingRef.current = false;
      const params = buildParams(query, locationId);
      const searchStr = params.toString();

      // Synchronously extract active category from pathname to prevent race condition loop
      const match = pathname?.match(/\/categories\/([^/]+)/);
      const pathCatId = match ? match[1] : "";
      const targetPath = `/categories/${pathCatId || "all"}`;
      const nextURL = searchStr ? `${targetPath}?${searchStr}` : targetPath;

      // Prevent redundant router replacement to avoid reload/infinite loop
      const currentParams = searchParams?.toString();
      const currentURL = pathname + (currentParams ? `?${currentParams}` : "");

      if (nextURL !== currentURL) {
        router.replace(nextURL);
      }
    }, 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, pathname, locationId]);

  // Explicit submit — closes suggestions and pushes to history
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    userIsTypingRef.current = false;
    setShowSuggestions(false);
    const params = buildParams(query, locationId);
    const searchStr = params.toString();

    const match = pathname?.match(/\/categories\/([^/]+)/);
    const pathCatId = match ? match[1] : "";
    const targetPath = `/categories/${pathCatId || "all"}`;
    router.push(searchStr ? `${targetPath}?${searchStr}` : targetPath);
  };

  // Handle suggestion click
  const handleSuggestionClick = (s: Suggestion) => {
    setShowSuggestions(false);
    setActiveIndex(-1);
    const match = pathname?.match(/\/categories\/([^/]+)/);
    const pathCatId = match ? match[1] : "";

    if (s.type === "category" && s.id) {
      // Navigate to category filter directly
      const params = new URLSearchParams();
      if (query.trim()) params.set("query", query.trim());
      if (locationId) params.set("locationId", locationId);
      router.push(`/categories/${s.id}?${params.toString()}`);
    } else if (s.type === "location" && s.id) {
      // Set location filter
      const params = new URLSearchParams();
      if (query.trim()) params.set("query", query.trim());
      params.set("locationId", s.id.toString());
      router.push(`/categories/${pathCatId || "all"}?${params.toString()}`);
    } else {
      // Job title — fill input and search
      setQuery(s.label);
      userIsTypingRef.current = false;
      const params = buildParams(s.label, locationId);
      const searchStr = params.toString();
      const targetPath = `/categories/${pathCatId || "all"}`;
      router.push(searchStr ? `${targetPath}?${searchStr}` : targetPath);
    }
    inputRef.current?.blur();
  };

  // Keyboard navigation inside dropdown
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, -1));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      handleSuggestionClick(suggestions[activeIndex]);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setActiveIndex(-1);
    }
  };

  // Icon per suggestion type
  const typeIcon = (type: Suggestion["type"]) => {
    if (type === "category") return (
      <svg className="w-3.5 h-3.5 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h10M4 18h7" />
      </svg>
    );
    if (type === "location") return (
      <svg className="w-3.5 h-3.5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    );
    return (
      <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    );
  };

  const typeLabel = (type: Suggestion["type"]) => {
    if (type === "category") return "Category";
    if (type === "location") return "District";
    return null;
  };

  // Group suggestions by type for section headers
  const jobSuggestions = suggestions.filter((s) => s.type === "job");
  const categorySuggestions = suggestions.filter((s) => s.type === "category");
  const locationSuggestions = suggestions.filter((s) => s.type === "location");

  // Flat ordered list for keyboard navigation
  const orderedSuggestions: Suggestion[] = [
    ...jobSuggestions,
    ...categorySuggestions,
    ...locationSuggestions,
  ];

  return (
    <div ref={wrapperRef} className="relative w-full">
      <form
        onSubmit={handleSearch}
        className="w-full flex items-center border border-slate-200/80 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 rounded-xl bg-white shadow-sm transition-all h-9 md:h-10"
      >
        {/* District Dropdown Selector */}
        <div ref={districtRef} className="relative h-full shrink-0">
          <button
            type="button"
            onClick={() => setIsDistrictOpen(!isDistrictOpen)}
            className="h-full bg-slate-50 border-r border-slate-300 hover:bg-slate-200 transition-colors w-[105px] min-w-[105px] max-w-[105px] sm:w-[150px] flex items-center justify-center pl-2 pr-6 text-[14px] font-bold text-slate-700 cursor-pointer focus:outline-none rounded-l-xl"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23475569' stroke-width='3'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19.5 8.25l-7.5 7.5-7.5-7.5'/%3E%3C/svg%3E")`,
              backgroundPosition: "right 6px center",
              backgroundSize: "8px",
              backgroundRepeat: "no-repeat"
            }}
          >
            <span className="truncate pr-1">
              {locationId
                ? (districts.find(d => d.id.toString() === locationId)?.name || "District")
                : (lang === "mz" ? "District" : "District")
              }
            </span>
          </button>

          {isDistrictOpen && (
            <div className="absolute top-full left-0 mt-1.5 w-44 max-h-60 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-1 flex flex-col animate-scaleIn">
              <button
                type="button"
                onClick={() => {
                  setLocationId("");
                  setIsDistrictOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2 text-[10px] font-bold transition-colors cursor-pointer hover:bg-slate-50 ${!locationId ? "text-primary bg-primary/5" : "text-slate-600"
                  }`}
              >
                {lang === "mz" ? "District zawng zawng" : "All Districts"}
              </button>
              {districts.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => {
                    setLocationId(d.id.toString());
                    setIsDistrictOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 text-[10px] font-bold transition-colors cursor-pointer hover:bg-slate-50 ${locationId === d.id.toString() ? "text-primary bg-primary/5" : "text-slate-600"
                    }`}
                >
                  {d.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Text search query — instant search + autocomplete */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          autoComplete="off"
          onChange={(e) => {
            userIsTypingRef.current = true;
            setQuery(e.target.value);
          }}
          onFocus={() => {
            if (suggestions.length > 0) setShowSuggestions(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={lang === "mz" ? "Hna hming, hmun, company..." : "Search jobs, location, company..."}
          className="flex-grow h-full bg-transparent px-3 text-xs md:text-sm text-slate-800 focus:outline-none placeholder-slate-400 font-medium min-w-0"
        />

        {/* Clear (✕) button */}
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setSuggestions([]);
              setShowSuggestions(false);
              const params = buildParams("", locationId);
              const searchStr = params.toString();
              const match = pathname?.match(/\/categories\/([^/]+)/);
              const pathCatId = match ? match[1] : "";
              const targetPath = `/categories/${pathCatId || "all"}`;
              router.replace(searchStr ? `${targetPath}?${searchStr}` : targetPath);
            }}
            className="h-full px-2 text-slate-400 hover:text-slate-600 transition-colors flex items-center justify-center shrink-0 cursor-pointer"
            aria-label="Clear search"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* Blue search submit button */}
        <button
          type="submit"
          className="h-full px-4 md:px-5 bg-primary hover:bg-primary-container text-white transition-colors flex items-center justify-center shrink-0 cursor-pointer rounded-r-xl"
          aria-label="Search"
        >
          <svg className="w-3 md:w-3.5 h-3 md:h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </form>

      {/* ── SUGGESTION DROPDOWN ── */}
      {showSuggestions && orderedSuggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
          {/* Job title suggestions */}
          {jobSuggestions.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 border-b border-slate-100">
                Jobs
              </div>
              {jobSuggestions.map((s) => {
                const idx = orderedSuggestions.indexOf(s);
                return (
                  <button
                    key={`job-${s.label}`}
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); handleSuggestionClick(s); }}
                    className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-left text-sm text-slate-700 hover:bg-primary/5 transition-colors cursor-pointer ${activeIndex === idx ? "bg-primary/8 text-primary" : ""}`}
                  >
                    {typeIcon(s.type)}
                    <span className="flex-1 truncate">{s.label}</span>
                    <span className="text-[10px] text-slate-300">↵</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Category suggestions */}
          {categorySuggestions.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 border-y border-slate-100">
                Categories
              </div>
              {categorySuggestions.map((s) => {
                const idx = orderedSuggestions.indexOf(s);
                return (
                  <button
                    key={`cat-${s.id}`}
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); handleSuggestionClick(s); }}
                    className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-left text-sm text-slate-700 hover:bg-primary/5 transition-colors cursor-pointer ${activeIndex === idx ? "bg-primary/8 text-primary" : ""}`}
                  >
                    {typeIcon(s.type)}
                    <span className="flex-1 truncate">{s.label}</span>
                    <span className="text-[10px] font-medium text-blue-400 bg-blue-50 px-1.5 py-0.5 rounded">Category</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Location suggestions */}
          {locationSuggestions.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 border-y border-slate-100">
                Districts
              </div>
              {locationSuggestions.map((s) => {
                const idx = orderedSuggestions.indexOf(s);
                return (
                  <button
                    key={`loc-${s.id}`}
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); handleSuggestionClick(s); }}
                    className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-left text-sm text-slate-700 hover:bg-primary/5 transition-colors cursor-pointer ${activeIndex === idx ? "bg-primary/8 text-primary" : ""}`}
                  >
                    {typeIcon(s.type)}
                    <span className="flex-1 truncate">{s.label}</span>
                    <span className="text-[10px] font-medium text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded">District</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   SUB-COMPONENT: CategoryNavStrip
   Left: dropdown selector. Right: scrollable pills. Both synced via URL.
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
  const pathname = usePathname();
  const match = pathname?.match(/\/categories\/([^/]+)/);
  const pathId = match ? match[1] : "";
  const activeCategoryId = pathId === "all" || pathId === "12" ? "" : pathId;
  const { categoryId, setCategoryId } = useSearch();

  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const rafRef = useRef<number | null>(null);

  // Defer layout reads (scrollLeft, clientWidth, scrollWidth) into a rAF to
  // avoid forced synchronous reflow after DOM mutations.
  const updateScrollState = useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const el = scrollRef.current;
      if (!el) return;
      setCanScrollLeft(el.scrollLeft > 4);
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    });
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });
    const ro = new ResizeObserver(updateScrollState);
    ro.observe(el);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      el.removeEventListener("scroll", updateScrollState);
      ro.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateScrollState]);

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
    const searchStr = params.toString();
    const targetPath = `/categories/${id || "all"}`;
    router.push(searchStr ? `${targetPath}?${searchStr}` : targetPath);
  };

  return (
    <div className="w-full bg-slate-50 border-b border-blue-100/40">
      <div className="max-w-full mx-auto flex items-center h-8 sm:h-11 gap-0 px-container-margin-mobile md:px-container-margin-desktop">

        {/* ── LEFT: Category Dropdown ── */}
        <div className="relative shrink-0 h-full flex items-center pr-0 sm:pr-3 mr-0 sm:mr-2 border-none sm:border-r border-blue-100/60 w-[125px] sm:w-auto">
          <div className="relative flex items-center w-full">
            {categoryId && (
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-primary z-10 ring-2 ring-slate-50" />
            )}
            <select
              value={categoryId}
              onChange={(e) => handleCategorySelect(e.target.value)}
              aria-label="Filter by category"
              className={`appearance-none h-[25px] sm:h-8 pl-2.5 pr-7 text-[10px] sm:text-[11px] font-bold rounded-lg border cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all w-full min-w-0 truncate ${categoryId
                ? "bg-primary/10 border-primary/30 text-blue-700"
                : "bg-white border-slate-200 text-slate-700 hover:border-primary/30"
                }`}
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23475569' stroke-width='3'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19.5 8.25l-7.5 7.5-7.5-7.5'/%3E%3C/svg%3E")`,
                backgroundPosition: "right 8px center",
                backgroundSize: "8px sm:10px",
                backgroundRepeat: "no-repeat"
              }}
            >
              <option value="" disabled hidden>{lang === "mz" ? "Category-te" : "Categories"}</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id.toString()}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ── RIGHT: Scrollable pills ── */}
        <div className="relative flex-1 hidden sm:flex items-center h-full overflow-hidden">
          {canScrollLeft && (
            <button
              onClick={() => scroll("left")}
              className="absolute left-0 z-10 h-full px-1 hidden md:flex items-center bg-gradient-to-r from-slate-50 via-slate-50/90 to-transparent cursor-pointer"
              aria-label="Scroll categories left"
            >
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-white border border-slate-200 shadow-sm text-slate-500 hover:text-primary transition-colors">
                <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </span>
            </button>
          )}

          <div
            ref={scrollRef}
            className="flex items-center gap-2 overflow-x-auto scrollbar-none whitespace-nowrap h-full pl-1 pr-4 md:pr-12 w-full"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            <button
              onClick={() => handleCategorySelect("")}
              className={`px-2.5 py-1 md:px-3 md:py-1.5 rounded-full text-[11px] md:text-xs font-semibold transition-all shrink-0 border cursor-pointer ${!activeCategoryId
                ? "bg-primary/10 border-primary/20 text-primary font-bold"
                : "bg-white border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-primary hover:border-primary/20"
                }`}
            >
              All
            </button>
            {categories.map((cat) => {
              const isActive = activeCategoryId === cat.id.toString();
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.id.toString())}
                  className={`px-2.5 py-1 md:px-3 md:py-1.5 rounded-full text-[11px] md:text-xs font-semibold transition-all shrink-0 border cursor-pointer ${isActive
                    ? "bg-primary/10 border-primary/20 text-primary font-bold"
                    : "bg-white border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-primary hover:border-primary/20"
                    }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>

          {canScrollRight && (
            <button
              onClick={() => scroll("right")}
              className="absolute right-0 z-10 h-full px-1 hidden md:flex items-center bg-gradient-to-l from-slate-50 via-slate-50/90 to-transparent cursor-pointer"
              aria-label="Scroll categories right"
            >
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-white border border-slate-200 shadow-sm text-slate-500 hover:text-primary transition-colors">
                <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
}

