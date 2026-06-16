"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { t } from "@/lib/i18n";

interface Option {
  id: number;
  name: string;
}

interface SearchFilterBarProps {
  districts: Option[];
  categories: Option[];
  lang: string;
}

export default function SearchFilterBar({ districts, categories, lang }: SearchFilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get("query") || "");
  const [locationId, setLocationId] = useState(searchParams.get("locationId") || "");
  const [categoryId, setCategoryId] = useState(searchParams.get("categoryId") || "");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("query", query.trim());
    if (locationId) params.set("locationId", locationId);
    if (categoryId) params.set("categoryId", categoryId);
    const searchStr = params.toString();
    router.push(searchStr ? `/?${searchStr}` : "/");
  };

  return (
    <form
      onSubmit={handleSearch}
      className="w-full flex flex-col md:flex-row items-stretch md:items-center gap-0"
    >
      {/* Search text input */}
      <div className="flex items-center gap-2 px-4 py-3 flex-1 border-b md:border-b-0 md:border-r border-outline-variant/20">
        <svg className="w-5 h-5 text-primary/50 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("home.search_placeholder", lang)}
          className="w-full bg-transparent border-none focus:outline-none text-sm font-medium text-on-background placeholder-on-surface-variant/50"
        />
      </div>

      {/* District filter */}
      <div className="flex items-center gap-2 px-4 py-3 border-b md:border-b-0 md:border-r border-outline-variant/20">
        <svg className="w-4 h-4 text-primary/50 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <select
          value={locationId}
          onChange={(e) => setLocationId(e.target.value)}
          className="bg-transparent border-none focus:outline-none text-sm font-medium text-on-background cursor-pointer w-full md:w-36"
        >
          <option value="">{t("home.all_districts", lang)}</option>
          {districts.map((d) => (
            <option key={d.id} value={d.id.toString()}>{d.name}</option>
          ))}
        </select>
      </div>

      {/* Category filter */}
      <div className="flex items-center gap-2 px-4 py-3 border-b md:border-b-0 md:border-r border-outline-variant/20">
        <svg className="w-4 h-4 text-primary/50 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-5 5a2 2 0 01-2.828 0l-7-7A2 2 0 013 10V5a2 2 0 012-2z" />
        </svg>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="bg-transparent border-none focus:outline-none text-sm font-medium text-on-background cursor-pointer w-full md:w-36"
        >
          <option value="">{t("home.all_categories", lang)}</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id.toString()}>{c.name}</option>
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
  );
}
