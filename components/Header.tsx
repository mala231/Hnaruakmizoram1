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

  const navLinks = [
    { href: "/", label: t("nav.home", lang) },
    { href: "/about", label: t("nav.about", lang) },
    { href: "/contact", label: t("nav.contact", lang) },
    { href: "/privacy", label: t("nav.privacy", lang) },
  ];

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

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                pathname === link.href
                  ? "bg-primary/10 text-primary"
                  : "text-slate-500 hover:text-primary hover:bg-primary/8"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA + Language Toggle */}
        <div className="hidden lg:flex items-center gap-3 shrink-0">
          {/* Language Toggle */}
          <div className="flex items-center bg-blue-50 border border-blue-200/60 rounded-full p-0.5">
            <button
              onClick={() => setLangCookie("mz")}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${
                lang === "mz"
                  ? "bg-primary text-white shadow-sm shadow-primary/30"
                  : "text-slate-500 hover:text-primary"
              }`}
            >
              Mizo
            </button>
            <button
              onClick={() => setLangCookie("en")}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${
                lang === "en"
                  ? "bg-primary text-white shadow-sm shadow-primary/30"
                  : "text-slate-500 hover:text-primary"
              }`}
            >
              English
            </button>
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
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`px-4 py-3 rounded-2xl text-sm font-semibold transition-colors ${
                  pathname === link.href
                    ? "bg-primary/10 text-primary"
                    : "text-slate-500 hover:text-primary hover:bg-primary/8"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <hr className="border-blue-100" />

          {/* Mobile Language Switcher */}
          <div className="flex items-center justify-between px-4 py-1.5 bg-blue-50 rounded-2xl border border-blue-100">
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
              🌐 Language
            </span>
            <div className="flex items-center bg-white border border-blue-200/60 rounded-full p-0.5">
              <button
                onClick={() => setLangCookie("mz")}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all duration-300 ${
                  lang === "mz"
                    ? "bg-primary text-white shadow-sm"
                    : "text-slate-500 hover:text-primary"
                }`}
              >
                Mizo
              </button>
              <button
                onClick={() => setLangCookie("en")}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all duration-300 ${
                  lang === "en"
                    ? "bg-primary text-white shadow-sm"
                    : "text-slate-500 hover:text-primary"
                }`}
              >
                English
              </button>
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
