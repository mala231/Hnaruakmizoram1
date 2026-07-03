import Link from "next/link";
import { cookies } from "next/headers";
import { t } from "@/lib/i18n";

export default async function TermsPage() {
  const cookieStore = await cookies();
  const lang = cookieStore.get("lang")?.value || "mz";

  const jobSeekerSections = [
    {
      num: "01",
      key: "section_1",
      icon: (
        <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      num: "02",
      key: "section_2",
      icon: (
        <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      num: "03",
      key: "section_3",
      icon: (
        <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
        </svg>
      ),
    },
    {
      num: "04",
      key: "section_4",
      icon: (
        <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  const employerSections = [
    {
      num: "05",
      key: "section_5",
      icon: (
        <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    {
      num: "06",
      key: "section_6",
      icon: (
        <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      num: "07",
      key: "section_7",
      icon: (
        <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
    },
    {
      num: "08",
      key: "section_8",
      icon: (
        <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      num: "09",
      key: "section_9",
      icon: (
        <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
    },
  ];

  const SectionCard = ({ section, accentColor }: { section: typeof jobSeekerSections[0]; accentColor: string }) => (
    <div
      id={`section-${section.num}`}
      style={{
        background: "white",
        borderRadius: "20px",
        boxShadow: "0 4px 20px rgba(28,125,250,0.08)",
        border: "1px solid rgba(28,125,250,0.08)",
        padding: "28px 32px",
        marginBottom: "16px",
        display: "flex",
        gap: "20px",
        alignItems: "flex-start",
      }}
    >
      <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: `linear-gradient(135deg,${accentColor}22,${accentColor}44)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: accentColor }}>
        {section.icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
          <span style={{ fontSize: "11px", fontWeight: 800, color: accentColor, letterSpacing: "0.1em" }}>{section.num}</span>
          <h2 style={{ fontSize: "17px", fontWeight: 700, color: "#0f1b30", margin: 0 }}>{t(`terms.${section.key}_title`, lang)}</h2>
        </div>
        <p style={{ fontSize: "15px", color: "#4b5563", lineHeight: 1.8, margin: 0, fontWeight: 400 }}>{t(`terms.${section.key}_desc`, lang)}</p>
      </div>
    </div>
  );

  return (
    <div style={{ background: "linear-gradient(180deg,#f0f9ff 0%,#ffffff 400px)", minHeight: "100vh", fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>

      {/* Hero Banner */}
      <div style={{ background: "linear-gradient(135deg,#071022 0%,#0f1b30 60%,#1c7dfa 100%)", padding: "64px 24px 80px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-40px", right: "-40px", width: "300px", height: "300px", borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
        <div style={{ position: "absolute", bottom: "-60px", left: "10%", width: "200px", height: "200px", borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
        <div style={{ maxWidth: "760px", margin: "0 auto", position: "relative", zIndex: 1 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: "100px", padding: "6px 16px", marginBottom: "20px" }}>
            <svg width="12" height="12" fill="white" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "white", letterSpacing: "0.08em", textTransform: "uppercase" }}>Hnaruak Mizoram</span>
          </div>
          <h1 style={{ fontSize: "clamp(28px,5vw,46px)", fontWeight: 800, color: "white", margin: "0 0 16px", letterSpacing: "-0.02em", lineHeight: 1.15 }}>
            {t("terms.title", lang)}
          </h1>
          <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.8)", margin: 0, fontWeight: 500, lineHeight: 1.7, maxWidth: "600px" }}>
            {t("terms.subtitle", lang)}
          </p>
          <div style={{ marginTop: "24px", display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#bae6fd" }} />
            <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>
              {lang === "mz" ? "Last updated: June 2026" : "Last updated: June 2026"}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "0 24px 80px", marginTop: "-32px", position: "relative", zIndex: 2 }}>

        {/* Quick nav card */}
        <div style={{ background: "white", borderRadius: "20px", boxShadow: "0 8px 32px rgba(28,125,250,0.12)", border: "1px solid rgba(28,125,250,0.1)", padding: "24px 28px", marginBottom: "32px" }}>
          <p style={{ fontSize: "12px", fontWeight: 700, color: "#1c7dfa", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 12px" }}>
            {lang === "mz" ? "Dan zawng zawng" : "All Sections"}
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {[...jobSeekerSections, ...employerSections].map((s) => (
              <a key={s.num} href={`#section-${s.num}`} style={{ fontSize: "13px", fontWeight: 600, color: "#1c7dfa", background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: "100px", padding: "5px 14px", textDecoration: "none" }}>
                {t(`terms.${s.key}_title`, lang)}
              </a>
            ))}
          </div>
        </div>

        {/* For Job Seekers */}
        <div style={{ marginBottom: "32px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
            <div style={{ height: "2px", flex: 1, background: "linear-gradient(90deg,#10b981,transparent)" }} />
            <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "linear-gradient(135deg,#ecfdf5,#d1fae5)", border: "1px solid #6ee7b7", borderRadius: "100px", padding: "8px 20px" }}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#10b981"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              <span style={{ fontSize: "13px", fontWeight: 800, color: "#065f46", letterSpacing: "0.04em", textTransform: "uppercase" }}>{t("terms.job_seekers_title", lang)}</span>
            </div>
            <div style={{ height: "2px", flex: 1, background: "linear-gradient(90deg,transparent,#10b981)" }} />
          </div>
          {jobSeekerSections.map((section) => (
            <SectionCard key={section.num} section={section} accentColor="#10b981" />
          ))}
        </div>

        {/* For Employers */}
        <div style={{ marginBottom: "32px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
            <div style={{ height: "2px", flex: 1, background: "linear-gradient(90deg,#1c7dfa,transparent)" }} />
            <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "linear-gradient(135deg,#eff6ff,#dbeafe)", border: "1px solid #93c5fd", borderRadius: "100px", padding: "8px 20px" }}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#1c7dfa"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
              <span style={{ fontSize: "13px", fontWeight: 800, color: "#1e3a8a", letterSpacing: "0.04em", textTransform: "uppercase" }}>{t("terms.employers_title", lang)}</span>
            </div>
            <div style={{ height: "2px", flex: 1, background: "linear-gradient(90deg,transparent,#1c7dfa)" }} />
          </div>
          {employerSections.map((section) => (
            <SectionCard key={section.num} section={section} accentColor="#1c7dfa" />
          ))}
        </div>

        {/* Footer note */}
        <div style={{ background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: "16px", padding: "20px 24px", display: "flex", gap: "12px", alignItems: "flex-start" }}>
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#1c7dfa" style={{ flexShrink: 0, marginTop: "2px" }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p style={{ fontSize: "13px", color: "#0c4a6e", margin: 0, fontWeight: 500, lineHeight: 1.7 }}>
            {lang === "mz" ? (
              <>
                Dan te hi zawhna emaw harsatna i neih chuan{" "}
                <Link href="/contact" style={{ color: "#1c7dfa", fontWeight: 700 }}>min be pawh rawh</Link>.
                Hnaruak Mizoram hian a user zawhna leh harstanate sutkiang sak kan tum ani.
              </>
            ) : (
              <>
                If you have any questions or issues regarding our terms, please{" "}
                <Link href="/contact" style={{ color: "#1c7dfa", fontWeight: 700 }}>contact us</Link>.
                Hnaruak Mizoram will always support and stand by our users.
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

