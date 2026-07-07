import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { cache } from "react";
import { headers, cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { t } from "@/lib/i18n";
import ReportTrigger from "@/components/ReportTrigger";

// ISR: revalidate job detail pages every 2 minutes
export const revalidate = 120;

interface JobDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

/**
 * Cached DB fetch shared by generateMetadata and the page component.
 * React cache() ensures only one DB query per request regardless of how
 * many callers invoke this function.
 */
const getJobById = cache(async (id: string) => {
  try {
    return await prisma.jobPost.findUnique({
      where: { id },
      include: { employer: true, category: true, location: true },
    });
  } catch (error) {
    console.error(`Failed to fetch job with ID ${id} from database:`, error);
    return null;
  }
});

export async function generateMetadata({ params }: JobDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const job = await getJobById(id);

  if (!job || job.status !== "live" || job.employer.isDeleted) {
    return {
      title: "Hna Hmuh A Ni Lo - Hnaruak Mizoram",
    };
  }

  const title = `${job.title} - ${job.employer.username}`;
  const description = `${job.category.name} hna ruak thar, District ${job.location.name}-ah a awm e. Apply deadline: ${new Date(job.deadline).toLocaleDateString()}.`;

  return {
    title: `${title} | Hnaruak Mizoram`,
    description,
    openGraph: {
      title,
      description,
      url: `/jobs/${job.id}`,
      type: "website",
      images: [
        {
          url: job.employer.logoUrl || "/icon-512.png",
          alt: `${job.employer.username} Logo`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [job.employer.logoUrl || "/icon-512.png"],
    },
  };
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const { id } = await params;
  const cookieStore = await cookies();
  const lang = cookieStore.get("lang")?.value || "mz";

  // 1. Fetch job post with relations (shared cache with generateMetadata)
  const job = await getJobById(id);

  // 2. Validate if job exists and is live/non-deleted
  if (!job || job.status !== "live" || job.employer.isDeleted) {
    return (
      <div style={{ display: "flex", flexDirection: "column", flexGrow: 1, backgroundColor: "#ffffff", alignItems: "center", justifyContent: "center", padding: "96px 24px", textAlign: "center", minHeight: "60vh", fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
        <div style={{ width: "64px", height: "64px", borderRadius: "50%", backgroundColor: "#fee2e2", color: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "24px", marginBottom: "16px", boxShadow: "0 4px 12px rgba(239,68,68,0.15)" }}>
          !
        </div>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#1c7dfa", margin: "0 0 8px" }}>{t("jobs.not_found", lang)}</h1>
        <Link
          href="/"
          style={{
            marginTop: "24px",
            background: "linear-gradient(135deg,#1c7dfa,#0a84ff)",
            color: "#ffffff",
            fontWeight: 700,
            fontSize: "13px",
            padding: "12px 28px",
            borderRadius: "100px",
            textDecoration: "none",
            boxShadow: "0 4px 12px rgba(28,125,250,0.2)",
            display: "inline-block",
          }}
        >
          I bul tanna (Home) pan leh rawh
        </Link>
      </div>
    );
  }

  // 3. Resolve share details
  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  const shareUrl = `${protocol}://${host}/jobs/${job.id}`;
  const shareText = `"${job.title}" hna ruak thar, Hnaruak Mizoram-ah hmuh theih a ni e: ${shareUrl}`;

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;

  // 4. Resolve Google Maps embed source
  const mapsEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(job.address)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  return (
    <div style={{ backgroundColor: "#fafbfc", minHeight: "100vh", padding: "48px 24px", fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
      <div style={{ maxWidth: "1120px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "32px" }}>

        {/* Back navigation */}
        <Link
          href="/"
          style={{
            alignSelf: "flex-start",
            color: "#4b5563",
            textDecoration: "none",
            fontSize: "12px",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: "6px",
            transition: "color 0.2s",
          }}
        >
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Kir leh rawh (Back to listings)
        </Link>

        {/* Dashboard Header block */}
        <div style={{
          backgroundColor: "#ffffff",
          border: "1px solid rgba(28,125,250,0.1)",
          borderRadius: "24px",
          padding: "32px",
          boxShadow: "0 10px 30px rgba(28,125,250,0.06)",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "24px"
        }} className="flex-col md:flex-row">
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "24px" }} className="flex-col md:flex-row text-center md:text-left">
            {/* Logo */}
            <div style={{
              width: "80px",
              height: "80px",
              borderRadius: "16px",
              backgroundColor: "#f0f9ff",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid #e0f2fe",
              flexShrink: 0
            }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <Image
                src={job.employer.logoUrl}
                alt={`${job.employer.username} logo`}
                width={80}
                height={80}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>

            {/* Title / Info */}
            <div>
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px" }} className="justify-center md:justify-start">
                <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#0f1b30", margin: 0, lineHeight: 1.2 }}>{job.title}</h1>
                {job.employer.isVerified && (
                  <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20" style={{ color: "#1c7dfa", width: "20px", height: "20px" }}>
                    <title>Verified Employer</title>
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <p style={{ fontSize: "14px", color: "#1c7dfa", fontWeight: 700, marginTop: "6px", marginBottom: 0 }}>
                {job.employer.username}
              </p>
              <p style={{ fontSize: "12px", color: "#6b7280", fontWeight: 600, marginTop: "4px", marginBottom: 0 }}>
                {job.category.name} • District: {job.location.name}
              </p>
            </div>
          </div>
        </div>

        {/* Workspace Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* Main Description */}
          <div style={{
            backgroundColor: "#ffffff",
            border: "1px solid rgba(28,125,250,0.1)",
            borderRadius: "24px",
            padding: "32px",
            boxShadow: "0 10px 30px rgba(28,125,250,0.06)",
            display: "flex",
            flexDirection: "column",
            gap: "24px"
          }} className="lg:col-span-2">
            <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#1c7dfa", borderBottom: "1px solid #f0f9ff", paddingBottom: "12px", margin: 0 }}>
              Hna chungchang (Job Details)
            </h2>
            <div style={{
              whiteSpace: "pre-wrap",
              lineHeight: 1.85,
              fontWeight: 500,
              fontSize: "15px",
              color: "#374151",
              fontFamily: "inherit"
            }}>
              {job.description}
            </div>
          </div>

          {/* Actions & Maps Sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

            {/* Details Panel */}
            <div style={{
              backgroundColor: "#ffffff",
              border: "1px solid rgba(28,125,250,0.1)",
              borderRadius: "24px",
              padding: "24px",
              boxShadow: "0 10px 30px rgba(28,125,250,0.06)",
              display: "flex",
              flexDirection: "column",
              gap: "16px"
            }}>
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#1c7dfa", borderBottom: "1px solid #f0f9ff", paddingBottom: "10px", margin: 0 }}>
                Hriattur Pawimawh
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "13px", fontWeight: 600, color: "#374151" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ color: "#6b7280", fontWeight: 500 }}>{t("jobs.deadline", lang)}:</span>
                  <span style={{ color: "#1c7dfa", fontWeight: 700 }}>{new Date(job.deadline).toLocaleDateString()}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ color: "#6b7280", fontWeight: 500 }}>{t("jobs.interview_time", lang)}:</span>
                  <span style={{ color: "#111827", fontWeight: 700 }}>{job.interviewTime}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ color: "#6b7280", fontWeight: 500 }}>{t("jobs.district", lang)}:</span>
                  <span style={{ color: "#111827", fontWeight: 700 }}>{job.location.name}</span>
                </div>
              </div>

              {/* Application Details */}
              <div style={{ marginTop: "8px", paddingTop: "16px", borderTop: "1px solid #f0f9ff", display: "flex", flexDirection: "column", gap: "12px" }}>
                <h4 style={{ fontSize: "11px", color: "#1c7dfa", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>
                  {t("jobs.how_to_apply", lang)}
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px", fontWeight: 600, color: "#4b5563" }}>
                  <p style={{ margin: 0 }}>Email: <span style={{ color: "#111827", fontWeight: 700, userSelect: "all" }}>{job.employer.email}</span></p>
                  <p style={{ margin: 0 }}>Phone: <span style={{ color: "#111827", fontWeight: 700, userSelect: "all" }}>{job.employer.phone}</span></p>
                  <p style={{ margin: 0, lineHeight: 1.4 }}>Awmna: <span style={{ color: "#111827", fontWeight: 700 }}>{job.address}</span></p>
                </div>
              </div>

              {/* PDF Circular Download */}
              {job.pdfUrl && (
                <div style={{ marginTop: "8px", paddingTop: "16px", borderTop: "1px solid #f0f9ff" }}>
                  <a
                    href={`https://docs.google.com/viewer?url=${encodeURIComponent(job.pdfUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      width: "100%",
                      boxSizing: "border-box",
                      background: "linear-gradient(135deg, #ef4444, #dc2626)",
                      color: "#ffffff",
                      fontWeight: 700,
                      fontSize: "13px",
                      padding: "12px",
                      borderRadius: "12px",
                      textAlign: "center",
                      textDecoration: "none",
                      boxShadow: "0 4px 12px rgba(239, 68, 68, 0.2)",
                    }}
                  >
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h7a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                    </svg>
                    {t("jobs.download_pdf", lang)}
                  </a>
                </div>
              )}

              {/* Social Shares */}
              <div style={{ marginTop: "8px", paddingTop: "16px", borderTop: "1px solid #f0f9ff", display: "flex", flexDirection: "column", gap: "12px" }}>
                <h4 style={{ fontSize: "11px", color: "#1c7dfa", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>
                  {t("jobs.share_title", lang)}
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      backgroundColor: "#25d366",
                      color: "#ffffff",
                      fontWeight: 700,
                      fontSize: "12px",
                      padding: "10px 0",
                      borderRadius: "10px",
                      textAlign: "center",
                      textDecoration: "none",
                      boxShadow: "0 2px 8px rgba(37,211,102,0.15)",
                      display: "block",
                    }}
                  >
                    WhatsApp
                  </a>
                  <a
                    href={facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      backgroundColor: "#1877f2",
                      color: "#ffffff",
                      fontWeight: 700,
                      fontSize: "12px",
                      padding: "10px 0",
                      borderRadius: "10px",
                      textAlign: "center",
                      textDecoration: "none",
                      boxShadow: "0 2px 8px rgba(24,119,242,0.15)",
                      display: "block",
                    }}
                  >
                    Facebook
                  </a>
                </div>
              </div>

              {/* Report Widget */}
              <div style={{ marginTop: "8px", paddingTop: "8px", borderTop: "1px solid #f0f9ff" }}>
                <ReportTrigger jobId={job.id} lang={lang} />
              </div>
            </div>

            {/* Google Maps Container */}
            <div style={{
              backgroundColor: "#ffffff",
              border: "1px solid rgba(28,125,250,0.1)",
              borderRadius: "24px",
              padding: "24px",
              boxShadow: "0 10px 30px rgba(28,125,250,0.06)",
              display: "flex",
              flexDirection: "column",
              gap: "16px"
            }}>
              <h3 style={{
                fontSize: "15px",
                fontWeight: 700,
                color: "#1c7dfa",
                borderBottom: "1px solid #f0f9ff",
                paddingBottom: "10px",
                margin: 0,
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}>
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Hmun Awmna (Map)
              </h3>
              <p style={{ fontSize: "13px", fontWeight: 600, color: "#4b5563", margin: 0, lineHeight: 1.4 }}>
                {job.address}
              </p>

              {/* Map Iframe */}
              <div style={{
                width: "100%",
                height: "240px",
                borderRadius: "16px",
                overflow: "hidden",
                border: "1px solid #e5e7eb",
                backgroundColor: "#f3f4f6",
                position: "relative"
              }}>
                <iframe
                  title="Google Maps Location Embed"
                  src={mapsEmbedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={false}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
