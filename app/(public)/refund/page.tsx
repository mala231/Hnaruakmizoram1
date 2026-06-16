import Link from "next/link";
import { cookies } from "next/headers";
import { t } from "@/lib/i18n";

export default async function RefundPage() {
  const cookieStore = await cookies();
  const lang = cookieStore.get("lang")?.value || "mz";

  const sections = [
    {
      num: "01",
      title: t("refund.section_1_title", lang),
      icon: (
        <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
        </svg>
      ),
      content: t("refund.section_1_desc", lang),
    },
    {
      num: "02",
      title: t("refund.section_2_title", lang),
      icon: (
        <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
      content: t("refund.section_2_desc", lang),
    },
    {
      num: "03",
      title: t("refund.section_3_title", lang),
      icon: (
        <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      content: t("refund.section_3_desc", lang),
    },
  ];

  return (
    <div style={{ background: "linear-gradient(180deg,#f0f9ff 0%,#ffffff 400px)", minHeight: "100vh", fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>

      {/* Hero Banner */}
      <div style={{ background: "linear-gradient(135deg,#071022 0%,#0f1b30 60%,#1c7dfa 100%)", padding: "64px 24px 80px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-40px", right: "-40px", width: "300px", height: "300px", borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
        <div style={{ position: "absolute", bottom: "-60px", left: "10%", width: "200px", height: "200px", borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
        <div style={{ maxWidth: "760px", margin: "0 auto", position: "relative", zIndex: 1 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: "100px", padding: "6px 16px", marginBottom: "20px" }}>
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "white", letterSpacing: "0.08em", textTransform: "uppercase" }}>Hnaruak Mizoram</span>
          </div>
          <h1 style={{ fontSize: "clamp(28px,5vw,46px)", fontWeight: 800, color: "white", margin: "0 0 16px", letterSpacing: "-0.02em", lineHeight: 1.15 }}>
            {t("refund.title", lang)}
          </h1>
          <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.85)", margin: 0, fontWeight: 500, lineHeight: 1.7, maxWidth: "560px" }}>
            {t("refund.subtitle", lang)}
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

        {/* Alert banner */}
        <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "20px", padding: "20px 28px", marginBottom: "28px", display: "flex", gap: "14px", alignItems: "flex-start", boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}>
          <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#d97706" style={{ flexShrink: 0, marginTop: "1px" }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p style={{ fontSize: "14px", fontWeight: 700, color: "#92400e", margin: "0 0 4px" }}>
              {lang === "mz" ? "Pawimawh: Hna live tawh hnu refund a ni lo" : "Important: No refunds once job listing goes live"}
            </p>
            <p style={{ fontSize: "13px", color: "#b45309", margin: 0, lineHeight: 1.6, fontWeight: 500 }}>
              {lang === "mz"
                ? "Payment i thlak hnu a, hna i tar tawh hnu refund dil theih a ni lo. Dan kan ziah ang zelin payment hma hian lo ngaih thlap rawh."
                : "Once payment is completed and the job is live, no refund requests can be processed. Please read these terms carefully before proceeding."}
            </p>
          </div>
        </div>

        {/* Quick nav */}
        <div style={{ background: "white", borderRadius: "20px", boxShadow: "0 8px 32px rgba(28,125,250,0.12)", border: "1px solid rgba(28,125,250,0.1)", padding: "24px 28px", marginBottom: "32px" }}>
          <p style={{ fontSize: "12px", fontWeight: 700, color: "#1c7dfa", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 12px" }}>
            {lang === "mz" ? "Dan zawng zawng" : "All Sections"}
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {sections.map((s) => (
              <a key={s.num} href={`#ref-${s.num}`} style={{ fontSize: "13px", fontWeight: 600, color: "#1c7dfa", background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: "100px", padding: "5px 14px", textDecoration: "none" }}>
                {s.title}
              </a>
            ))}
          </div>
        </div>

        {/* Sections */}
        {sections.map((section) => (
          <div
            key={section.num}
            id={`ref-${section.num}`}
            style={{
              background: "white",
              borderRadius: "20px",
              boxShadow: "0 4px 20px rgba(28,125,250,0.08)",
              border: "1px solid rgba(28,125,250,0.08)",
              padding: "28px 32px",
              marginBottom: "20px",
              display: "flex",
              gap: "20px",
              alignItems: "flex-start",
            }}
          >
            <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "linear-gradient(135deg,#e0f2fe,#bae6fd)", display: "flex", alignItems: "center", justifyItems: "center", flexShrink: 0, color: "#1c7dfa" }}>
              {section.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                <span style={{ fontSize: "11px", fontWeight: 800, color: "#0a84ff", letterSpacing: "0.1em" }}>{section.num}</span>
                <h2 style={{ fontSize: "17px", fontWeight: 700, color: "#0f1b30", margin: 0 }}>{section.title}</h2>
              </div>
              <p style={{ fontSize: "15px", color: "#4b5563", lineHeight: 1.8, margin: 0, fontWeight: 400 }}>{section.content}</p>
            </div>
          </div>
        ))}

        {/* Contact CTA */}
        <div style={{ background: "linear-gradient(135deg,#1c7dfa,#0a84ff)", borderRadius: "20px", padding: "28px 32px", display: "flex", flexWrap: "wrap", gap: "16px", alignItems: "center", justifyItems: "space-between" }}>
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "white", margin: "0 0 6px" }}>
              {lang === "mz" ? "Harsatna i neih em?" : "Are you having issues?"}
            </h3>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.8)", margin: 0, fontWeight: 500 }}>
              {lang === "mz"
                ? "Admin team hi min be pawh vat la, darkar 24 chhungin kan lo chhang ang."
                : "Please reach out to our admin team, and we will respond within 24 hours."}
            </p>
          </div>
          <Link href="/contact" style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "white", color: "#1c7dfa", fontWeight: 700, fontSize: "13px", padding: "12px 22px", borderRadius: "12px", textDecoration: "none", whiteSpace: "nowrap" }}>
            {lang === "mz" ? "Min be pawh rawh" : "Contact Us Now"}
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
