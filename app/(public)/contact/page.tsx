import { cookies } from "next/headers";
import { t } from "@/lib/i18n";
import ContactForm from "@/components/ContactForm";

export default async function ContactPage() {
  const cookieStore = await cookies();
  const lang = cookieStore.get("lang")?.value || "mz";

  return (
    <div style={{ background: "#ffffff", minHeight: "100vh", fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>

      {/* ── HERO BANNER ── */}
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

        <div style={{ maxWidth: "960px", margin: "0 auto", position: "relative", zIndex: 1 }}>
          {/* Badge */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: "100px", padding: "6px 18px", marginBottom: "24px" }}>
            <svg width="12" height="12" fill="white" viewBox="0 0 24 24">
              <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
            </svg>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "white", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              {lang === "mz" ? "Biak Pawhna" : "Contact Us"}
            </span>
          </div>

          <h1 style={{ fontSize: "clamp(30px,5vw,52px)", fontWeight: 800, color: "white", margin: "0 0 20px", letterSpacing: "-0.02em", lineHeight: 1.12 }}>
            {t("contact.title", lang)}
          </h1>
          <p style={{ fontSize: "17px", color: "rgba(255,255,255,0.82)", margin: 0, fontWeight: 500, lineHeight: 1.7, maxWidth: "600px" }}>
            {t("contact.subtitle", lang)}
          </p>
        </div>
      </div>

      {/* ── CONTENT CONTAINER ── */}
      <div style={{ maxWidth: "960px", margin: "0 auto", padding: "0 24px 80px", marginTop: "-40px", position: "relative", zIndex: 2 }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

          {/* Left Side: Contact Information Cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

            {/* Email Card */}
            <div
              style={{
                background: "white",
                borderRadius: "20px",
                border: "1px solid rgba(28,125,250,0.1)",
                boxShadow: "0 4px 20px rgba(28,125,250,0.08)",
                padding: "24px 28px",
                display: "flex",
                gap: "20px",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "14px",
                  background: "linear-gradient(135deg,#e0f2fe,#bae6fd)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#1c7dfa",
                  flexShrink: 0,
                }}
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h4 style={{ fontSize: "12px", color: "#6b7280", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 4px" }}>
                  {t("contact.email", lang)}
                </h4>
                <p style={{ fontSize: "16px", color: "#0f1b30", fontWeight: 700, margin: 0 }}>
                  {process.env.SMTP_USER || "hnaruakmizoramofficial@gmail.com"}
                </p>
              </div>
            </div>

            {/* Phone Card */}
            <div
              style={{
                background: "white",
                borderRadius: "20px",
                border: "1px solid rgba(28,125,250,0.1)",
                boxShadow: "0 4px 20px rgba(28,125,250,0.08)",
                padding: "24px 28px",
                display: "flex",
                gap: "20px",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "14px",
                  background: "linear-gradient(135deg,#e0f2fe,#bae6fd)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#1c7dfa",
                  flexShrink: 0,
                }}
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div>
                <h4 style={{ fontSize: "12px", color: "#6b7280", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 4px" }}>
                  {t("contact.phone", lang)}
                </h4>
                <p style={{ fontSize: "16px", color: "#0f1b30", fontWeight: 700, margin: 0 }}>
                  +91 98765 43210
                </p>
              </div>
            </div>

            {/* Address Card */}
            <div
              style={{
                background: "white",
                borderRadius: "20px",
                border: "1px solid rgba(28,125,250,0.1)",
                boxShadow: "0 4px 20px rgba(28,125,250,0.08)",
                padding: "24px 28px",
                display: "flex",
                gap: "20px",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "14px",
                  background: "linear-gradient(135deg,#e0f2fe,#bae6fd)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#1c7dfa",
                  flexShrink: 0,
                }}
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h4 style={{ fontSize: "12px", color: "#6b7280", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 4px" }}>
                  {t("contact.address", lang)}
                </h4>
                <p style={{ fontSize: "15px", color: "#374151", fontWeight: 600, margin: 0, lineHeight: 1.4 }}>
                  Tlangnuam, Aizawl, Mizoram, 796190, India
                </p>
              </div>
            </div>

          </div>

          {/* Right Side: Form Container */}
          <ContactForm lang={lang} />

        </div>
      </div>

    </div>
  );
}
