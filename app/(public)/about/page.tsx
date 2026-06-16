import Link from "next/link";
import { cookies } from "next/headers";
import { t } from "@/lib/i18n";

export default async function AboutPage() {
  const cookieStore = await cookies();
  const lang = cookieStore.get("lang")?.value || "mz";

  const whyUs = [
    {
      icon: (
        <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
        </svg>
      ),
      title: lang === "mz" ? "Mizo & English Hman Theihna" : "English & Mizo Support",
      desc: t("about.why_us_1", lang),
    },
    {
      icon: (
        <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
      title: "Self-Serve Payment",
      desc: t("about.why_us_2", lang),
    },
    {
      icon: (
        <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      title: lang === "mz" ? "Awlsam leh Fel" : "Simple & Direct",
      desc: t("about.why_us_3", lang),
    },
  ];

  const stats = [
    { value: "11+", label: "Districts" },
    { value: "₹299", label: lang === "mz" ? "A bikin tarh" : "Featured Listings" },
    { value: "100%", label: lang === "mz" ? "Bilingual" : "Bilingual Support" },
    { value: "24h", label: lang === "mz" ? "Live atang" : "Goes Live" },
  ];

  return (
    <div style={{ background: "#ffffff", minHeight: "100vh", fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>

      {/* ── HERO ── */}
      <div
        style={{
          background: "linear-gradient(135deg,#071022 0%,#0f1b30 50%,#1c7dfa 100%)",
          padding: "72px 24px 100px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative circles */}
        <div style={{ position: "absolute", top: "-60px", right: "-60px", width: "360px", height: "360px", borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
        <div style={{ position: "absolute", bottom: "-80px", left: "5%", width: "240px", height: "240px", borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />

        <div style={{ maxWidth: "780px", margin: "0 auto", position: "relative", zIndex: 1 }}>
          {/* Badge */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: "100px", padding: "6px 18px", marginBottom: "24px" }}>
            <svg width="13" height="13" fill="white" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "white", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              {lang === "mz" ? "Kan Chanchin" : "About Us"}
            </span>
          </div>

          <h1 style={{ fontSize: "clamp(30px,5vw,52px)", fontWeight: 800, color: "white", margin: "0 0 20px", letterSpacing: "-0.02em", lineHeight: 1.12 }}>
            {t("about.title", lang)}
          </h1>
          <p style={{ fontSize: "17px", color: "rgba(255,255,255,0.82)", margin: "0 0 36px", fontWeight: 500, lineHeight: 1.75, maxWidth: "600px" }}>
            {t("about.description", lang)}
          </p>

          {/* Stats row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "12px", maxWidth: "520px" }}>
            {stats.map((s) => (
              <div key={s.label} style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "14px", padding: "14px 10px", textAlign: "center" }}>
                <div style={{ fontSize: "22px", fontWeight: 800, color: "white", lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.7)", fontWeight: 600, marginTop: "4px", textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div style={{ maxWidth: "780px", margin: "0 auto", padding: "0 24px 80px", marginTop: "-40px", position: "relative", zIndex: 2 }}>

        {/* Description card */}
        <div
          style={{
            background: "white",
            borderRadius: "24px",
            boxShadow: "0 12px 40px rgba(28,125,250,0.14)",
            border: "1px solid rgba(28,125,250,0.1)",
            padding: "36px 40px",
            marginBottom: "28px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
            <div style={{ width: "4px", height: "36px", background: "linear-gradient(180deg,#1c7dfa,#0a84ff)", borderRadius: "4px" }} />
            <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#0f1b30", margin: 0 }}>
              {lang === "mz" ? "Kan Bul Tan Dan" : "Our Origin Story"}
            </h2>
          </div>
          <p style={{ fontSize: "16px", color: "#374151", lineHeight: 1.85, margin: 0, fontWeight: 400 }}>
            {lang === "mz"
              ? "Hnaruak Mizoram hi Mizoram chhunga hnaruak zawng zawng te hmun khata awlsam taka zawn hmuh theihna tura siam a ni. Hna zawnna kawngah harsatna thleng thin te sukiang turin, a bikin Mizo tawng ngei hman theih a nihna hian hna zawngtu leh hna petu te a chawm let dawn a ni."
              : "Hnaruak Mizoram is a platform built to consolidate all job vacancies in Mizoram in one easy-to-search place. By solving the challenges faced in job discovery, we aim to bridge the gap between job seekers and employers, with support for the Mizo language."}
          </p>
        </div>

        {/* Mission card */}
        <div
          style={{
            background: "linear-gradient(135deg,#f0f9ff,#e0f2fe)",
            borderRadius: "24px",
            border: "1px solid #bae6fd",
            padding: "36px 40px",
            marginBottom: "28px",
          }}
        >
          <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
            <div
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "16px",
                background: "linear-gradient(135deg,#1c7dfa,#0a84ff)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                boxShadow: "0 6px 16px rgba(28,125,250,0.3)",
              }}
            >
              <svg width="26" height="26" fill="none" viewBox="0 0 24 24" stroke="white">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#0f1b30", margin: "0 0 12px" }}>
                {t("about.mission_title", lang)}
              </h2>
              <p style={{ fontSize: "15px", color: "#374151", lineHeight: 1.85, margin: 0, fontWeight: 400 }}>
                {t("about.mission_desc", lang)}
              </p>
            </div>
          </div>
        </div>

        {/* Why Us */}
        <div style={{ marginBottom: "28px" }}>
          <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#0f1b30", margin: "0 0 20px", letterSpacing: "-0.01em" }}>
            {t("about.why_us_title", lang)}
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {whyUs.map((item, i) => (
              <div
                key={i}
                style={{
                  background: "white",
                  borderRadius: "18px",
                  border: "1px solid rgba(28,125,250,0.1)",
                  boxShadow: "0 3px 12px rgba(28,125,250,0.07)",
                  padding: "22px 26px",
                  display: "flex",
                  gap: "18px",
                  alignItems: "flex-start",
                  transition: "box-shadow 0.2s",
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "14px",
                    background: "linear-gradient(135deg,#e0f2fe,#bae6fd)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    color: "#1c7dfa",
                  }}
                >
                  {item.icon}
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                    <span style={{ fontSize: "11px", fontWeight: 800, color: "#0a84ff", letterSpacing: "0.08em" }}>0{i + 1}</span>
                    <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#0f1b30", margin: 0 }}>{item.title}</h3>
                  </div>
                  <p style={{ fontSize: "14px", color: "#4b5563", lineHeight: 1.75, margin: 0 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Banner */}
        <div
          style={{
            background: "linear-gradient(135deg,#1c7dfa 0%,#0a84ff 100%)",
            borderRadius: "24px",
            padding: "36px 40px",
            display: "flex",
            flexWrap: "wrap",
            gap: "20px",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <h3 style={{ fontSize: "20px", fontWeight: 800, color: "white", margin: "0 0 8px" }}>
              {lang === "mz" ? "I hna ruak dah duh em?" : "Want to post a job vacancy?"}
            </h3>
            <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.8)", margin: 0, fontWeight: 500 }}>
              {lang === "mz"
                ? "₹299 atangin i hna ruak dah thei dawn a ni. Register leh post — minute tlem chauh."
                : "Post your job vacancy starting at ₹299. Register and post in just a few minutes."}
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <Link
              href="/register"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "white",
                color: "#1c7dfa",
                fontWeight: 700,
                fontSize: "14px",
                padding: "13px 24px",
                borderRadius: "12px",
                textDecoration: "none",
                boxShadow: "0 4px 12px rgba(28,125,250,0.15)",
                whiteSpace: "nowrap",
              }}
            >
              {lang === "mz" ? "Register Rawh" : "Register Now"}
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </Link>
            <Link
              href="/contact"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "rgba(255,255,255,0.15)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.3)",
                color: "white",
                fontWeight: 700,
                fontSize: "14px",
                padding: "13px 24px",
                borderRadius: "12px",
                textDecoration: "none",
                whiteSpace: "nowrap",
              }}
            >
              {lang === "mz" ? "Min Be Pawh" : "Contact Us"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
