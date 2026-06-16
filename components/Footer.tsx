"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { t } from "@/lib/i18n";

interface FooterProps {
  lang: string;
}

export default function Footer({ lang }: FooterProps) {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="bg-white border-t-2 border-blue-100 text-on-surface py-14 mt-auto">
      <div className="max-w-7xl mx-auto px-container-margin-mobile md:px-container-margin-desktop">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

          {/* Column 1: Brand */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-md shadow-primary/25 group-hover:scale-105 transition-transform">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 6h-2.18c.07-.44.18-.86.18-1a3 3 0 0 0-6 0c0 .14.11.56.18 1H10c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-5-2a1 1 0 0 1 1 1c0 .14-.15.78-.33 1h-1.34C14.15 5.78 14 5.14 14 5a1 1 0 0 1 1-1z"/>
                </svg>
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-display font-extrabold text-lg text-primary tracking-tight">Mamawh</span>
                <span className="text-[10px] font-bold text-secondary/70 uppercase tracking-widest">Job Board</span>
              </div>
            </Link>
            <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-xs">
              {t("footer.tagline", lang)}
            </p>
            <div className="flex items-center gap-2 pt-1">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-green-600 font-bold">Live Job Board</span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="flex flex-col gap-4">
            <h4 className="font-display font-bold text-sm text-primary uppercase tracking-wider">
              About Us
            </h4>
            <nav className="flex flex-col gap-2.5">
              {[
                { href: "/about", label: t("nav.about", lang) },
                { href: "/contact", label: t("nav.contact", lang) },
                { href: "/privacy", label: t("nav.privacy", lang) },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-slate-500 hover:text-primary transition-colors font-medium flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Column 3: Legal */}
          <div className="flex flex-col gap-4">
            <h4 className="font-display font-bold text-sm text-primary uppercase tracking-wider">
              Legal & Terms
            </h4>
            <nav className="flex flex-col gap-2.5">
              {[
                { href: "/terms", label: t("nav.terms", lang) },
                { href: "/refund", label: t("nav.refund", lang) },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-slate-500 hover:text-primary transition-colors font-medium flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Employer CTA */}
            <div className="mt-2 p-4 bg-blue-50 rounded-2xl border border-blue-100">
              <p className="text-xs font-semibold text-slate-500 mb-2">Want to post a job vacancy?</p>
              <Link
                href="/register"
                className="inline-block text-xs font-bold text-primary hover:text-white bg-primary/10 hover:bg-primary px-4 py-2 rounded-xl transition-all"
              >
                Register as Employer →
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-blue-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-400 font-medium">
            {t("footer.copyright", lang)}
          </p>
          <div className="flex items-center gap-6 text-xs text-slate-400">
            <Link href="/admin/login" className="hover:text-primary transition-colors font-semibold">
              {t("nav.admin_login", lang)}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
