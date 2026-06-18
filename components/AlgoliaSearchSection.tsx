"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  InstantSearch,
  Configure,
  useInstantSearch,
  useSearchBox,
  useMenu,
  useHits,
  usePagination,
} from "react-instantsearch";
import { algoliasearch } from "algoliasearch";
import { t } from "@/lib/i18n";

// Category icon map - copies the inline SVGs from original homepage
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

interface Option {
  id: number;
  name: string;
}

interface AlgoliaSearchSectionProps {
  categories: Option[];
  districts: Option[];
  advertisements: any[];
  lang: string;
}

// Instantiate search client using public keys
const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || "";
const searchKey = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY || "";
const searchClient = algoliasearch(appId, searchKey);

export default function AlgoliaSearchSection({
  categories,
  districts,
  advertisements,
  lang,
}: AlgoliaSearchSectionProps) {
  return (
    <InstantSearch
      searchClient={searchClient}
      indexName="job_posts"
      routing={true}
    >
      {/* Lock results to 10 per page */}
      <Configure hitsPerPage={10} />
      <SearchContent
        categories={categories}
        districts={districts}
        advertisements={advertisements}
        lang={lang}
      />
    </InstantSearch>
  );
}

function SearchContent({
  categories,
  districts,
  advertisements,
  lang,
}: AlgoliaSearchSectionProps) {
  // Access Algolia search tools using hooks
  const { setIndexUiState } = useInstantSearch();
  const { query, refine: refineQuery } = useSearchBox();
  const categoryMenu = useMenu({ attribute: "categoryId" });
  const locationMenu = useMenu({ attribute: "locationId" });
  const { hits } = useHits();
  const pagination = usePagination();

  /** Safely clear a single menu facet via setIndexUiState — avoids refine("") crash */
  const clearMenuFacet = (attribute: "categoryId" | "locationId") => {
    setIndexUiState((prev: any) => {
      const menu = { ...(prev.menu || {}) };
      delete menu[attribute];
      return { ...prev, menu };
    });
  };

  // Local query state with instant-search debounce
  const [localQuery, setLocalQuery] = useState(query);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const searchWrapperRef = useRef<HTMLDivElement>(null);

  // Local filter state — explicitly controlled so that sidebar tags and
  // the search-bar dropdowns always stay in sync with each other.
  const [localLocationId, setLocalLocationId] = useState(locationMenu.currentRefinement || "");
  const [localCategoryId, setLocalCategoryId] = useState(categoryMenu.currentRefinement || "");

  // Keep local filter state in sync when Algolia's URL routing changes state externally
  useEffect(() => {
    setLocalLocationId(locationMenu.currentRefinement || "");
  }, [locationMenu.currentRefinement]);

  useEffect(() => {
    setLocalCategoryId(categoryMenu.currentRefinement || "");
  }, [categoryMenu.currentRefinement]);

  useEffect(() => {
    setLocalQuery(query);
  }, [query]);

  // Fire Algolia query 250ms after user stops typing (instant search)
  useEffect(() => {
    const timer = setTimeout(() => {
      refineQuery(localQuery);
    }, 250);
    return () => clearTimeout(timer);
  }, [localQuery]);

  // Collapse suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
        setActiveSuggestion(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Unique suggestion titles from hits (max 7) — Bug #1 fix: useMemo, not useCallback
  const suggestions = useMemo(() => {
    if (!localQuery.trim()) return [];
    const seen = new Set<string>();
    return hits
      .filter((h: any) => {
        const title = (h.title || "").toLowerCase();
        const q = localQuery.toLowerCase();
        if (!title.includes(q)) return false;
        if (seen.has(title)) return false;
        seen.add(title);
        return true;
      })
      .slice(0, 7);
  }, [hits, localQuery]);

  const handleSuggestionClick = (hit: any) => {
    setLocalQuery(hit.title);
    refineQuery(hit.title);
    setShowSuggestions(false);
    setActiveSuggestion(-1);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveSuggestion((prev) => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveSuggestion((prev) => Math.max(prev - 1, -1));
    } else if (e.key === "Enter" && activeSuggestion >= 0) {
      e.preventDefault();
      handleSuggestionClick(suggestions[activeSuggestion]);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setActiveSuggestion(-1);
    }
  };

  // Derive active IDs from local controlled state (not currentRefinement directly)
  // This ensures dropdowns + tags are always in sync.
  const activeCategoryId = localCategoryId;
  const activeLocationId = localLocationId;

  const isFiltered = !!(query || activeCategoryId || activeLocationId);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    refineQuery(localQuery);
  };

  const handleClearFilters = () => {
    setLocalQuery("");
    setLocalLocationId("");
    setLocalCategoryId("");
    refineQuery("");
    clearMenuFacet("categoryId");
    clearMenuFacet("locationId");
    pagination.refine(0);
  };

  return (
    <>
      {/* ── Search Bar Section (Floating overlap) ── */}
      <div className="relative z-30 w-full max-w-7xl mx-auto px-container-margin-mobile md:px-container-margin-desktop">
        <div className="bg-white rounded-2xl shadow-2xl shadow-blue-900/10 border border-blue-100/60 p-2 -mb-8">
          <form
            onSubmit={handleSearchSubmit}
            className="w-full flex flex-col md:flex-row items-stretch md:items-center gap-0"
          >
            {/* Search text input with suggestions dropdown */}
            <div ref={searchWrapperRef} className="relative flex items-center gap-2 px-4 py-3 flex-1 border-b md:border-b-0 md:border-r border-outline-variant/20">
              <svg className="w-5 h-5 text-primary/50 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={localQuery}
                onChange={(e) => {
                  setLocalQuery(e.target.value);
                  setShowSuggestions(true);
                  setActiveSuggestion(-1);
                }}
                onFocus={() => {
                  if (localQuery.trim()) setShowSuggestions(true);
                }}
                onKeyDown={handleInputKeyDown}
                placeholder={t("home.search_placeholder", lang)}
                autoComplete="off"
                className="w-full bg-transparent border-none focus:outline-none text-sm font-medium text-on-background placeholder-on-surface-variant/50"
              />
              {/* Clear button */}
              {localQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setLocalQuery("");
                    refineQuery("");
                    setShowSuggestions(false);
                  }}
                  className="shrink-0 w-5 h-5 rounded-full bg-slate-200 hover:bg-primary/20 flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Clear search"
                >
                  <svg className="w-3 h-3 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}

              {/* Suggestions dropdown */}
              {showSuggestions && localQuery.trim() && suggestions.length > 0 && (
                <div
                  className="absolute left-0 top-full mt-1.5 w-full bg-white rounded-2xl shadow-2xl shadow-blue-900/15 border border-blue-100/80 z-50 overflow-hidden"
                  style={{ minWidth: "260px" }}
                >
                  {/* Header */}
                  <div className="px-4 py-2 border-b border-blue-50 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-primary/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Suggestions</span>
                  </div>

                  {suggestions.map((hit: any, idx: number) => {
                    const isActive = activeSuggestion === idx;
                    // Highlight matching portion
                    const title: string = hit.title || "";
                    const q = localQuery.trim();
                    const matchIdx = title.toLowerCase().indexOf(q.toLowerCase());
                    const before = matchIdx >= 0 ? title.slice(0, matchIdx) : title;
                    const match = matchIdx >= 0 ? title.slice(matchIdx, matchIdx + q.length) : "";
                    const after = matchIdx >= 0 ? title.slice(matchIdx + q.length) : "";
                    return (
                      <button
                        key={hit.objectID}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => handleSuggestionClick(hit)}
                        onMouseEnter={() => setActiveSuggestion(idx)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors cursor-pointer group ${
                          isActive ? "bg-primary/8" : "hover:bg-blue-50/70"
                        }`}
                      >
                        {/* Job icon avatar */}
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-white text-xs font-bold shadow-sm"
                          style={{
                            background: `hsl(${((hit.employerName || "A").charCodeAt(0) * 137) % 360}, 55%, 48%)`,
                          }}
                        >
                          {(hit.employerName || "J").charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-on-background truncate leading-tight">
                            {before}
                            <span className="text-primary font-bold">{match}</span>
                            {after}
                          </p>
                          <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
                            {hit.employerName}{hit.locationName ? ` · ${hit.locationName}` : ""}
                          </p>
                        </div>
                        <svg className={`w-3.5 h-3.5 shrink-0 transition-opacity ${ isActive ? "text-primary opacity-100" : "text-slate-300 opacity-0 group-hover:opacity-100" }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    );
                  })}

                  {/* Footer hint */}
                  <div className="px-4 py-2 border-t border-blue-50 flex items-center gap-1.5">
                    <kbd className="text-[9px] font-bold text-slate-400 bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5">↑↓</kbd>
                    <span className="text-[10px] text-slate-400">navigate</span>
                    <kbd className="ml-1.5 text-[9px] font-bold text-slate-400 bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5">Enter</kbd>
                    <span className="text-[10px] text-slate-400">select</span>
                    <kbd className="ml-1.5 text-[9px] font-bold text-slate-400 bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5">Esc</kbd>
                    <span className="text-[10px] text-slate-400">close</span>
                  </div>
                </div>
              )}
            </div>

            {/* District dropdown filter */}
            <div className="flex items-center gap-2 px-4 py-3 border-b md:border-b-0 md:border-r border-outline-variant/20">
              <svg className="w-4 h-4 text-primary/50 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <select
                value={localLocationId}
                onChange={(e) => {
                  const val = e.target.value;
                  setLocalLocationId(val);
                  if (val) {
                    locationMenu.refine(val);
                  } else {
                    clearMenuFacet("locationId");
                  }
                  pagination.refine(0);
                }}
                className="bg-transparent border-none focus:outline-none text-sm font-medium text-on-background cursor-pointer w-full md:w-36"
              >
                <option value="">{t("home.all_districts", lang)}</option>
                {districts.map((d) => (
                  <option key={d.id} value={d.id.toString()}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Category dropdown filter */}
            <div className="flex items-center gap-2 px-4 py-3 border-b md:border-b-0 md:border-r border-outline-variant/20">
              <svg className="w-4 h-4 text-primary/50 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-5 5a2 2 0 01-2.828 0l-7-7A2 2 0 013 10V5a2 2 0 012-2z" />
              </svg>
              <select
                value={localCategoryId}
                onChange={(e) => {
                  const val = e.target.value;
                  setLocalCategoryId(val);
                  if (val) {
                    categoryMenu.refine(val);
                  } else {
                    clearMenuFacet("categoryId");
                  }
                  pagination.refine(0);
                }}
                className="bg-transparent border-none focus:outline-none text-sm font-medium text-on-background cursor-pointer w-full md:w-36"
              >
                <option value="">{t("home.all_categories", lang)}</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id.toString()}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit button */}
            <div className="p-2">
              <button
                type="submit"
                className="w-full md:w-auto bg-primary hover:bg-primary-container text-white font-bold text-sm px-8 py-3 rounded-xl transition-all duration-300 active:scale-95 shadow-md shadow-primary/20 hover:shadow-primary/30 cursor-pointer whitespace-nowrap"
              >
                {t("home.search_btn", lang)}
              </button>
            </div>
          </form>
        </div>
      </div>


      {/* ── MAIN CONTENT: Sidebar + Jobs ── */}
      <section className="pt-16 pb-12 px-container-margin-mobile md:px-container-margin-desktop max-w-7xl mx-auto w-full flex-grow flex flex-col">
        {/* Section header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-display font-bold text-2xl text-on-background">
              {isFiltered ? "Search Results" : "Featured Job Listings"}
            </h2>
            <p className="text-sm text-slate-500 font-medium mt-0.5">
              {/* Bug #3 fix: use nbHits (total across all pages) not hits.length (current page only) */}
              {pagination.nbHits} {pagination.nbHits === 1 ? "job opening" : "job openings"} found
            </p>
          </div>
          {isFiltered && (
            <button
              onClick={handleClearFilters}
              className="text-xs font-bold text-primary border border-primary/30 px-4 py-2 rounded-full hover:bg-primary/8 transition-colors cursor-pointer"
            >
              ✕ Clear Filters
            </button>
          )}
        </div>

        {/* Content columns - Sidebar left + Jobs right */}
        <div className="flex gap-8 items-start">
          {/* ─── Left Sidebar ─── */}
          <aside className="hidden lg:flex flex-col gap-5 w-52 shrink-0 sticky top-20">
            {/* Categories */}
            <div className="bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-blue-50 flex items-center gap-2">
                <div className="w-1.5 h-4 rounded-full bg-primary" />
                <h3 className="font-display font-bold text-xs text-on-background uppercase tracking-wider">
                  Categories
                </h3>
              </div>
              <nav className="flex flex-col py-2">
                <button
                  onClick={() => {
                    // Clear category via setIndexUiState — refine("") crashes
                    clearMenuFacet("categoryId");
                    pagination.refine(0);
                  }}
                  className={`flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-left transition-all w-full cursor-pointer ${
                    !activeCategoryId
                      ? "bg-primary/10 text-primary"
                      : "text-slate-500 hover:bg-blue-50 hover:text-primary"
                  }`}
                >
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  All Jobs
                </button>
                {categories.map((cat) => {
                  const isActive = activeCategoryId === cat.id.toString();
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        if (activeCategoryId === cat.id.toString()) {
                          // Already selected — deselect
                          setLocalCategoryId("");
                          clearMenuFacet("categoryId");
                        } else {
                          setLocalCategoryId(cat.id.toString());
                          categoryMenu.refine(cat.id.toString());
                        }
                        pagination.refine(0);
                      }}
                      className={`flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-left transition-all w-full cursor-pointer ${
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-slate-500 hover:bg-blue-50 hover:text-primary"
                      }`}
                    >
                      <span className="shrink-0 text-current">
                        <CategoryIcon name={cat.name} />
                      </span>
                      <span className="truncate">{cat.name}</span>
                    </button>
                  );
                })}
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

            {/* Districts list tag clouds */}
            <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4">
              <h3 className="font-display font-bold text-xs text-on-background mb-3 uppercase tracking-wider flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Districts
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {districts.map((d) => {
                  const isActive = activeLocationId === d.id.toString();
                  return (
                    <button
                      key={d.id}
                      onClick={() => {
                        if (activeLocationId === d.id.toString()) {
                          // Already selected — deselect
                          setLocalLocationId("");
                          clearMenuFacet("locationId");
                        } else {
                          setLocalLocationId(d.id.toString());
                          locationMenu.refine(d.id.toString());
                        }
                        pagination.refine(0);
                      }}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                        isActive
                          ? "bg-primary text-white"
                          : "bg-blue-50 hover:bg-primary hover:text-white text-slate-500"
                      }`}
                    >
                      {d.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* ─── Jobs Column ─── */}
          <div className="flex-1 min-w-0 flex flex-col gap-6">
            {/* Mobile category scroll bar */}
            <div className="lg:hidden flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
              <button
                onClick={() => {
                  // Clear category via setIndexUiState — refine("") crashes
                  clearMenuFacet("categoryId");
                  pagination.refine(0);
                }}
                className={`shrink-0 text-xs font-bold px-3.5 py-2 rounded-full transition-all cursor-pointer ${
                  !activeCategoryId
                    ? "bg-primary text-white shadow-sm"
                    : "bg-white border border-blue-200 text-slate-500 hover:text-primary"
                }`}
              >
                All
              </button>
              {categories.map((cat) => {
                const isActive = activeCategoryId === cat.id.toString();
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      if (activeCategoryId === cat.id.toString()) {
                        setLocalCategoryId("");
                        clearMenuFacet("categoryId");
                      } else {
                        setLocalCategoryId(cat.id.toString());
                        categoryMenu.refine(cat.id.toString());
                      }
                      pagination.refine(0);
                    }}
                    className={`shrink-0 text-xs font-bold px-3.5 py-2 rounded-full transition-all cursor-pointer ${
                      isActive
                        ? "bg-primary text-white shadow-sm"
                        : "bg-white border border-blue-200 text-slate-500 hover:text-primary"
                    }`}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>

            {hits.length === 0 ? (
              <div className="py-24 flex flex-col items-center justify-center gap-4 text-center bg-white border border-blue-100 rounded-3xl p-8 shadow-sm">
                <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center text-primary">
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-on-background">
                    {t("jobs.no_jobs", lang)}
                  </h3>
                  <p className="text-sm text-slate-500 font-medium mt-2" style={{ maxWidth: "320px" }}>
                    Please try different keywords or clear the filters to search again.
                  </p>
                </div>
                <button
                  onClick={handleClearFilters}
                  className="mt-2 text-sm font-bold text-white bg-primary hover:bg-primary-container px-6 py-2.5 rounded-full transition-colors shadow-md cursor-pointer"
                >
                  Reset Search
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {hits.map((hit: any, i) => (
                    <Link
                      key={hit.objectID}
                      href={`/jobs/${hit.objectID}`}
                      style={{ animationDelay: `${i * 40}ms` }}
                      className="animate-fade-in-up bg-white border border-blue-100 hover:border-primary/40 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 group flex flex-col cursor-pointer"
                    >
                      {/* Top accent bar */}
                      <div className="h-1 bg-gradient-to-r from-primary via-secondary to-tertiary" />

                      <div className="p-4 flex flex-col flex-grow gap-3">
                        {/* Logo + Category badge */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center shrink-0 shadow-sm relative">
                            {hit.employerLogoUrl ? (
                              <Image
                                src={hit.employerLogoUrl}
                                alt={`${hit.employerName} logo`}
                                width={40}
                                height={40}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div
                                className="w-full h-full flex items-center justify-center text-white text-sm font-bold"
                                style={{
                                  background: `hsl(${(hit.employerName?.charCodeAt(0) || 65) * 137 % 360}, 55%, 48%)`,
                                }}
                              >
                                {hit.employerName?.charAt(0)?.toUpperCase()}
                              </div>
                            )}
                          </div>
                          <span className="bg-primary/10 text-primary text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0">
                            {hit.categoryName}
                          </span>
                        </div>

                        {/* Text */}
                        <div className="flex-grow">
                          <h3 className="font-display font-bold text-sm text-on-background group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                            {hit.title}
                          </h3>
                          <div className="flex items-center gap-1 mt-1">
                            {hit.employerIsVerified && (
                              <svg className="w-3 h-3 text-primary" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            )}
                            <p className="text-[11px] text-secondary font-bold">{hit.employerName}</p>
                          </div>
                          <p className="text-xs text-slate-400 font-medium mt-2 line-clamp-2 leading-relaxed">
                            {hit.shortDescription}
                          </p>
                        </div>

                        {/* Footer */}
                        <div className="pt-3 border-t border-blue-50 flex items-center justify-between">
                          <div className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {hit.locationName}
                          </div>
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

                {/* ─── Pagination ─── */}
                {pagination.nbPages > 1 && (
                  <div className="mt-8 pt-6 border-t border-blue-100 flex flex-col items-center gap-4">
                    {/* Page info */}
                    <p className="text-xs font-semibold text-slate-400">
                      Page{" "}
                      <span className="text-primary font-bold">{pagination.currentRefinement + 1}</span>
                      {" "}of{" "}
                      <span className="font-bold text-slate-600">{pagination.nbPages}</span>
                      {" "}·{" "}
                      <span className="font-bold text-slate-600">{hits.length}</span> jobs on this page
                    </p>

                    <div className="flex items-center gap-1.5">
                      {/* First page */}
                      <button
                        onClick={() => { pagination.refine(0); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                        disabled={pagination.isFirstPage}
                        title="First page"
                        className="w-9 h-9 rounded-xl border border-blue-100 bg-white flex items-center justify-center text-slate-400 hover:bg-blue-50 hover:text-primary transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7M18 19l-7-7 7-7" />
                        </svg>
                      </button>

                      {/* Previous */}
                      <button
                        onClick={() => { pagination.refine(pagination.currentRefinement - 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                        disabled={pagination.isFirstPage}
                        title="Previous page"
                        className="w-9 h-9 rounded-xl border border-blue-100 bg-white flex items-center justify-center text-slate-400 hover:bg-blue-50 hover:text-primary transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>

                      {/* Page numbers with ellipsis */}
                      {(() => {
                        const current = pagination.currentRefinement;
                        const total = pagination.nbPages;
                        // Bug #2 fix: build page list safely, avoiding duplicate entries
                        const pageSet = new Set<number>();
                        const result: (number | "...")[] = [];
                        const delta = 1;
                        const rangeStart = Math.max(1, current - delta);
                        const rangeEnd = Math.min(total - 2, current + delta);

                        // Always show first page
                        pageSet.add(0);
                        result.push(0);

                        if (rangeStart > 1) result.push("...");
                        for (let i = rangeStart; i <= rangeEnd; i++) {
                          if (!pageSet.has(i)) { pageSet.add(i); result.push(i); }
                        }
                        if (rangeEnd < total - 2) result.push("...");

                        // Always show last page (only if different from first)
                        if (total > 1 && !pageSet.has(total - 1)) {
                          result.push(total - 1);
                        }

                        return result.map((p, idx) =>
                          p === "..." ? (
                            <span key={`ellipsis-${idx}`} className="w-9 h-9 flex items-center justify-center text-slate-400 text-sm font-bold select-none">
                              ···
                            </span>
                          ) : (
                            <button
                              key={`page-${p}`}
                              onClick={() => { pagination.refine(p as number); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                              className={`w-9 h-9 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                                current === p
                                  ? "bg-primary text-white shadow-md shadow-primary/25 scale-110"
                                  : "border border-blue-100 bg-white text-slate-600 hover:bg-blue-50 hover:text-primary hover:border-primary/30"
                              }`}
                            >
                              {(p as number) + 1}
                            </button>
                          )
                        );
                      })()}

                      {/* Next */}
                      <button
                        onClick={() => { pagination.refine(pagination.currentRefinement + 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                        disabled={pagination.isLastPage}
                        title="Next page"
                        className="w-9 h-9 rounded-xl border border-blue-100 bg-white flex items-center justify-center text-slate-400 hover:bg-blue-50 hover:text-primary transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>

                      {/* Last page */}
                      <button
                        onClick={() => { pagination.refine(pagination.nbPages - 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                        disabled={pagination.isLastPage}
                        title="Last page"
                        className="w-9 h-9 rounded-xl border border-blue-100 bg-white flex items-center justify-center text-slate-400 hover:bg-blue-50 hover:text-primary transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M6 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Banner Ads below jobs on mobile */}
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
                      <img src={ad.imageUrl} alt="Advertisement" className="w-full h-auto object-cover max-h-40" />
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {/* ─── Desktop Ad Sidebar (Extra column) ─── */}
          {advertisements.length > 0 && (
            <aside className="hidden xl:flex flex-col gap-4 w-48 shrink-0 sticky top-20">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">
                Sponsored
              </p>
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
                    <img src={ad.imageUrl} alt="Advertisement" className="w-full h-auto object-cover max-h-64" />
                  </a>
                );
              })}
            </aside>
          )}
        </div>
      </section>

      {/* ── FEATURE STRIP (below results for better mobile UX) ── */}
      <section className="relative z-10 bg-white border-t border-blue-100 py-10 w-full">
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
    </>
  );
}
