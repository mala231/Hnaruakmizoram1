"use client";

import Link from "next/link";
import Image from "next/image";
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
    <footer className="relative bg-gradient-to-b from-slate-50 via-blue-50/20 to-blue-100/40 text-slate-600 border-t border-blue-100/80 pt-10 pb-16 mt-auto overflow-hidden">
      {/* Decorative top ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-px bg-gradient-to-r from-transparent via-blue-200/50 to-transparent" />
      
      <div className="max-w-full mx-auto px-container-margin-mobile md:px-container-margin-desktop relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">

          {/* Column 1: Brand & Logo */}
          <div className="flex flex-col gap-5 items-start">
            <Link href="/" className="flex items-center justify-start group h-14 overflow-hidden">
              <Image
                src="/logohnaruakmizoram.png"
                alt="Hnaruak Mizoram Logo"
                width={180}
                height={120}
                className="h-24 w-auto object-contain hover:scale-[1.02] transition-transform"
              />
            </Link>
            
            <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-xs">
              {t("footer.tagline", lang)}
            </p>
            
            <div className="flex items-center gap-2.5 px-3 py-1.5 bg-emerald-50/80 rounded-full border border-emerald-100 shadow-sm w-fit">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] text-emerald-700 font-bold tracking-wider uppercase">
                Live Job Board
              </span>
            </div>
          </div>

          {/* Column 2: About Us */}
          <div className="flex flex-col gap-5">
            <h4 className="font-display font-bold text-xs text-blue-900 uppercase tracking-wider">
              {lang === "mz" ? "Kan Chanchin" : "About Us"}
            </h4>
            <nav className="flex flex-col gap-3">
              {[
                { href: "/about", label: t("nav.about", lang) },
                { href: "/contact", label: t("nav.contact", lang) },
                { href: "/privacy", label: t("nav.privacy", lang) },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-slate-500 hover:text-blue-600 transition-all duration-300 font-medium flex items-center gap-2.5 group hover:translate-x-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500/20 group-hover:bg-blue-500 group-hover:scale-125 transition-all duration-300" />
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Column 3: Legal & Terms */}
          <div className="flex flex-col gap-5">
            <h4 className="font-display font-bold text-xs text-blue-900 uppercase tracking-wider">
              {lang === "mz" ? "Dan leh Kaidawn" : "Legal & Terms"}
            </h4>
            <nav className="flex flex-col gap-3">
              {[
                { href: "/terms", label: t("nav.terms", lang) },
                { href: "/refund", label: t("nav.refund", lang) },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-slate-500 hover:text-blue-600 transition-all duration-300 font-medium flex items-center gap-2.5 group hover:translate-x-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500/20 group-hover:bg-blue-500 group-hover:scale-125 transition-all duration-300" />
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Column 4: Employer CTA Card */}
          <div className="flex flex-col gap-5">
            <div className="relative group/card p-5 rounded-2xl bg-white/80 border border-blue-100/85 backdrop-blur-sm shadow-[0_8px_30px_rgba(79,142,247,0.03)] flex flex-col gap-4 overflow-hidden transition-all duration-300 hover:border-blue-200/80 hover:shadow-[0_8px_30px_rgba(79,142,247,0.06)]">
              {/* Subtle card radial gradient hover effect */}
              <div className="absolute -top-12 -right-12 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover/card:bg-blue-500/10 transition-all duration-500 pointer-events-none" />
              
              <div className="flex flex-col gap-1.5">
                <h5 className="text-sm font-bold text-slate-800 tracking-wide">
                  {lang === "mz" ? "Hnathawk i mamawh em?" : "Are you hiring?"}
                </h5>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  {lang === "mz" 
                    ? "I hnaruak te tlawm takin tar chhuak la, hna zawngtu thalaiten an lo hmu nghal dawn a ni." 
                    : "Post your job vacancies affordably and connect with talented job seekers across Mizoram."}
                </p>
              </div>
              
              <Link
                href="/register"
                className="w-full inline-flex items-center justify-center gap-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 px-4 py-2.5 rounded-xl transition-all duration-300 shadow-md shadow-blue-500/10 hover:scale-[1.02] active:scale-[0.98]"
              >
                {lang === "mz" ? "Employer register-na →" : "Register as Employer →"}
              </Link>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-blue-100/60 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 text-center sm:text-left">
            <p className="text-xs text-slate-400 font-medium">
              {t("footer.copyright", lang)}
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium select-none">
              <span className="text-slate-400/70">Powered by</span>
              <a
                href="https://www.lushaitech.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center"
              >
                <Image
                  src="/lush-ai-tech-logo.png"
                  alt="LushAI Tech Logo"
                  width={120}
                  height={32}
                  className="h-6.5 w-auto object-contain opacity-90 hover:opacity-100 transition-opacity"
                />
              </a>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <Link 
              href="/admin/login" 
              className="text-xs text-slate-400 hover:text-blue-600 transition-colors font-semibold"
            >
              {t("nav.admin_login", lang)}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
