"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { t } from "@/lib/i18n";

interface HeaderProps {
  lang: string;
  isLoggedIn?: boolean;
  logoUrl?: string | null;
}

export default function Header({ lang, isLoggedIn, logoUrl }: HeaderProps) {
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
      <div className="max-w-7xl mx-auto px-container-margin-mobile md:px-container-margin-desktop h-16 flex items-center justify-between gap-6">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-md shadow-primary/30 group-hover:scale-105 transition-transform">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 6h-2.18c.07-.44.18-.86.18-1a3 3 0 0 0-6 0c0 .14.11.56.18 1H10c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-5-2a1 1 0 0 1 1 1c0 .14-.15.78-.33 1h-1.34C14.15 5.78 14 5.14 14 5a1 1 0 0 1 1-1z"/>
            </svg>
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-display font-extrabold text-lg text-primary tracking-tight">Hnaruak</span>
            <span className="text-[10px] font-bold text-secondary/70 uppercase tracking-widest">Mizoram</span>
          </div>
        </Link>

        {/* Desktop CTA + Language Toggle */}
        <div className="flex items-center gap-3 shrink-0 ml-auto">
          {/* Language Toggle Dropdown */}
          <div className="relative flex items-center bg-blue-50 border border-blue-200/60 rounded-full px-3 py-1.5 text-xs font-bold text-slate-600 gap-1.5 hover:border-primary/50 transition-colors">
            <span>🌐</span>
            <select
              value={lang}
              onChange={(e) => setLangCookie(e.target.value)}
              className="bg-transparent border-none focus:outline-none text-xs font-bold text-slate-600 cursor-pointer pr-1"
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

        {/* Mobile profile icon + menu button */}
        <div className="lg:hidden flex items-center gap-3 shrink-0">
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
            className="text-slate-500 hover:text-primary focus:outline-none p-2 rounded-full hover:bg-primary/8 transition-colors"
            aria-label="Toggle menu"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {isOpen && (
        <div className="lg:hidden bg-white border-b border-blue-100 py-4 px-container-margin-mobile flex flex-col gap-4 shadow-lg">
          {/* Mobile Language Switcher Dropdown */}
          <div className="flex items-center justify-between px-4 py-2 bg-blue-50 rounded-2xl border border-blue-100">
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
              🌐 Language
            </span>
            <select
              value={lang}
              onChange={(e) => setLangCookie(e.target.value)}
              className="bg-white border border-blue-200/60 focus:outline-none rounded-xl px-3 py-1.5 text-xs font-bold text-slate-600 cursor-pointer"
            >
              <option value="mz">Mizo</option>
              <option value="en">English</option>
            </select>
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
