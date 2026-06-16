import Link from "next/link";
import { cookies } from "next/headers";
import { t } from "@/lib/i18n";

export default async function TermsPage() {
  const cookieStore = await cookies();
  const lang = cookieStore.get("lang")?.value || "mz";

  const sections = [
    {
      num: "01",
      title: t("terms.section_1_title", lang),
      icon: (
        <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      content: t("terms.section_1_desc", lang),
    },
    {
      num: "02",
      title: t("terms.section_2_title", lang),
      icon: (
        <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
      content: t("terms.section_2_desc", lang),
    },
    {
      num: "03",
      title: t("terms.section_3_title", lang),
      icon: (
        <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      content: t("terms.section_3_desc", lang),
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
            <svg width="12" height="12" fill="white" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "white", letterSpacing: "0.08em", textTransform: "uppercase" }}>Hnaruak Mizoram</span>
          </div>
          <h1 style={{ fontSize: "clamp(28px,5vw,46px)", fontWeight: 800, color: "white", margin: "0 0 16px", letterSpacing: "-0.02em", lineHeight: 1.15 }}>
            {t("terms.title", lang)}
          </h1>
          <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.8)", margin: 0, fontWeight: 500, lineHeight: 1.7, maxWidth: "560px" }}>
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
            {sections.map((s) => (
              <a key={s.num} href={`#section-${s.num}`} style={{ fontSize: "13px", fontWeight: 600, color: "#1c7dfa", background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: "100px", padding: "5px 14px", textDecoration: "none" }}>
                {s.title}
              </a>
            ))}
          </div>
        </div>

        {/* Sections */}
        {sections.map((section, i) => (
          <div
            key={section.num}
            id={`section-${section.num}`}
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
            <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "linear-gradient(135deg,#e0f2fe,#bae6fd)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "#1c7dfa" }}>
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
                Hnaruak Mizoram hian a user zawng zawng an thiante tan a kal ngei dawn a ni.
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
