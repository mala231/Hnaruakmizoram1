"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { t } from "@/lib/i18n";

interface JobPost {
  id: string;
  title: string;
  shortDescription: string;
  status: string;
  durationDays: number;
  expiresAt: string | null;
  createdAt: string;
  category: { name: string };
  location: { name: string };
}

interface Payment {
  id: string;
  razorpayOrderId: string;
  razorpayPaymentId: string | null;
  amount: number;
  durationDays: number;
  createdAt: string;
  jobPost: { title: string };
}

interface Employer {
  username: string;
  email: string;
  phone: string;
  address: string;
  logoUrl: string;
  isVerified: boolean;
}

interface DashboardClientProps {
  employer: Employer;
  jobs: JobPost[];
  payments: Payment[];
}

export default function DashboardClient({ employer, jobs, payments }: DashboardClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"listings" | "billing" | "settings">("listings");
  const [listingsTab, setListingsTab] = useState<"live" | "expired" | "draft">("live");

  // Extension Modal States
  const [extendingJobId, setExtendingJobId] = useState<string | null>(null);
  const [extendingDuration, setExtendingDuration] = useState<15 | 30>(15);
  const [extendingTitle, setExtendingTitle] = useState("");

  // Alert states
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Dynamically load Razorpay script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const triggerAlert = (type: "success" | "error", message: string) => {
    if (type === "success") {
      setSuccessMsg(message);
      setErrorMsg("");
      setTimeout(() => setSuccessMsg(""), 4000);
    } else {
      setErrorMsg(message);
      setSuccessMsg("");
      setTimeout(() => setErrorMsg(""), 5000);
    }
  };

  // Filter listings
  const now = new Date();
  
  const liveJobs = jobs.filter(
    (j) => j.status === "live" && j.expiresAt && new Date(j.expiresAt) > now
  );

  const expiredJobs = jobs.filter(
    (j) => j.status === "expired" || (j.status === "live" && j.expiresAt && new Date(j.expiresAt) <= now)
  );

  const draftJobs = jobs.filter((j) => j.status === "draft");

  // Delete Listing Action
  const handleDeleteJob = async (id: string, title: string) => {
    const confirmMsg = `Hna puanzar "${title}" hi i delete duh takzet em?`;
    if (!window.confirm(confirmMsg)) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/jobs/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (data.success) {
        triggerAlert("success", "Hna puanzar delete a ni ta.");
        router.refresh();
      } else {
        triggerAlert("error", data.error || "Delete a hlawhchham rih.");
      }
    } catch (err) {
      triggerAlert("error", "Server biak pawh a harsat rih e.");
    } finally {
      setSubmitting(false);
    }
  };

  // Extend Checkout Trigger
  const handleExtendSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!extendingJobId) return;

    setSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch(`/api/jobs/${extendingJobId}/extend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ durationDays: extendingDuration }),
      });

      const data = await res.json();

      if (!data.success) {
        triggerAlert("error", data.error || "Extension request failed.");
        setSubmitting(false);
        setExtendingJobId(null);
        return;
      }

      if (data.isMock) {
        triggerAlert("success", "Razorpay Setup a awm loh vangin payment lem kalpui a ni dawn e...");
        
        const mockRes = await fetch("/api/payments/mock-success", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jobId: data.jobId }),
        });

        const mockData = await mockRes.json();
        if (mockData.success) {
          triggerAlert("success", "Listing extend/renew a hlawhtling ta!");
          setExtendingJobId(null);
          router.refresh();
        } else {
          triggerAlert("error", mockData.error || "Simulated confirmation failed.");
        }
      } else {
        // Razorpay checkout
        const options = {
          key: data.keyId,
          amount: data.amount,
          currency: "INR",
          name: "Mizoram Job Board",
          description: `Extend Listing: ${extendingTitle}`,
          order_id: data.orderId,
          handler: function () {
            triggerAlert("success", "Pekna a hlawhtling e! Extend a ni ta.");
            setExtendingJobId(null);
            router.refresh();
          },
          modal: {
            ondismiss: function () {
              triggerAlert("error", "Payment cancel a ni.");
              setSubmitting(false);
              setExtendingJobId(null);
            }
          },
          theme: { color: "#1c7dfa" }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      }

    } catch (err) {
      triggerAlert("error", "Server biak pawh a harsat rih e.");
      setSubmitting(false);
      setExtendingJobId(null);
    }
  };

  // Delete Account Action
  const handleDeleteAccount = async () => {
    const confirmMsg = t("dashboard.delete_account_warn");
    if (!window.confirm(confirmMsg)) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/employer/delete-account", {
        method: "POST",
      });

      const data = await res.json();
      if (data.success) {
        alert("Account delete a ni ta. Inhmupui leh vat kan beisei.");
        router.push("/login");
        router.refresh();
      } else {
        triggerAlert("error", data.error || "Delete account failed.");
      }
    } catch (err) {
      triggerAlert("error", "Server biak pawh a harsat rih e.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ backgroundColor: "#fafbfc", minHeight: "100vh", padding: "48px 24px", fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
      <div style={{ maxWidth: "1120px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "32px" }}>
        
        {/* Dynamic Alerts */}
        {successMsg && (
          <div style={{
            padding: "16px",
            borderRadius: "12px",
            backgroundColor: "#eff6ff",
            border: "1px solid rgba(28,125,250,0.15)",
            color: "#1c7dfa",
            fontSize: "13px",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{successMsg}</span>
          </div>
        )}
        
        {errorMsg && (
          <div style={{
            padding: "16px",
            borderRadius: "12px",
            backgroundColor: "#fee2e2",
            border: "1px solid rgba(239,68,68,0.15)",
            color: "#c53030",
            fontSize: "13px",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Profile Card Header */}
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
              <img
                src={employer.logoUrl}
                alt={`${employer.username} logo`}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
            <div>
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px" }} className="justify-center md:justify-start">
                <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#0f1b30", margin: 0, lineHeight: 1.2 }}>{employer.username}</h1>
                {employer.isVerified && (
                  <span style={{
                    backgroundColor: "#e0f2fe",
                    color: "#1c7dfa",
                    fontSize: "9px",
                    fontWeight: 800,
                    padding: "3px 8px",
                    borderRadius: "100px",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em"
                  }}>
                    Verified
                  </span>
                )}
              </div>
              <p style={{ fontSize: "14px", color: "#4b5563", fontWeight: 600, marginTop: "6px", marginBottom: 0 }}>
                {employer.email} • {employer.phone}
              </p>
              <p style={{ fontSize: "12px", color: "#6b7280", fontWeight: 600, marginTop: "4px", marginBottom: 0 }}>
                Awmna: {employer.address}
              </p>
            </div>
          </div>

          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              style={{
                backgroundColor: "#f3f4f6",
                border: "1px solid #e5e7eb",
                color: "#1c7dfa",
                fontWeight: 700,
                fontSize: "12px",
                padding: "12px 24px",
                borderRadius: "100px",
                cursor: "pointer",
                transition: "background-color 0.2s",
                fontFamily: "inherit"
              }}
            >
              {t("nav.logout")}
            </button>
          </form>
        </div>

        {/* Dashboard Tabs navigation */}
        <div style={{ display: "flex", borderBottom: "1px solid #e5e7eb", gap: "8px", overflowX: "auto" }}>
          {[
            { id: "listings", label: t("dashboard.my_listings") },
            { id: "billing", label: t("dashboard.payment_history") },
            { id: "settings", label: t("dashboard.account_settings") }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: "12px 24px",
                fontWeight: 700,
                fontSize: "14px",
                backgroundColor: "transparent",
                border: "none",
                borderBottom: activeTab === tab.id ? "3px solid #1c7dfa" : "3px solid transparent",
                color: activeTab === tab.id ? "#1c7dfa" : "#4b5563",
                cursor: "pointer",
                transition: "all 0.2s",
                fontFamily: "inherit",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dynamic Panels Workspace */}
        {activeTab === "listings" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Left/Middle Listings Main Feed */}
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
              
              {/* Inner Tabs selection */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #eef2ff", paddingBottom: "16px" }}>
                <div style={{ display: "flex", gap: "8px" }}>
                  {[
                    { id: "live", count: liveJobs.length, label: "Live" },
                    { id: "expired", count: expiredJobs.length, label: "Expired" },
                    { id: "draft", count: draftJobs.length, label: "Draft" }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setListingsTab(tab.id as any)}
                      style={{
                        fontSize: "12px",
                        fontWeight: 700,
                        padding: "6px 14px",
                        borderRadius: "100px",
                        border: "none",
                        cursor: "pointer",
                        backgroundColor: listingsTab === tab.id ? "#1c7dfa" : "#f3f4f6",
                        color: listingsTab === tab.id ? "#ffffff" : "#4b5563",
                        transition: "all 0.2s",
                        fontFamily: "inherit"
                      }}
                    >
                      {tab.label} ({tab.count})
                    </button>
                  ))}
                </div>

                <Link
                  href="/post-job"
                  style={{
                    background: "linear-gradient(135deg,#1c7dfa,#0a84ff)",
                    color: "#ffffff",
                    fontWeight: 700,
                    fontSize: "12px",
                    padding: "10px 20px",
                    borderRadius: "100px",
                    textDecoration: "none",
                    boxShadow: "0 4px 12px rgba(28,125,250,0.2)",
                  }}
                >
                  + {t("nav.post_job")}
                </Link>
              </div>

              {/* Listings Render */}
              {((listingsTab === "live" ? liveJobs : listingsTab === "expired" ? expiredJobs : draftJobs)).length === 0 ? (
                <div style={{ padding: "48px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", textAlign: "center" }}>
                  <div style={{ width: "64px", height: "64px", borderRadius: "50%", backgroundColor: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af" }}>
                    <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ margin: "auto" }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                  </div>
                  <div>
                    <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#111827", margin: 0 }}>Hna ruak he hmunah hian a awm lo</h3>
                    <p style={{ fontSize: "13px", color: "#6b7280", fontWeight: 500, marginTop: "4px", marginBottom: 0 }}>
                      {listingsTab === "live"
                        ? "Puanzar active lai i nei lo e."
                        : listingsTab === "expired"
                        ? "Hna puanzar hun tawp tawh a awm lo."
                        : "Hna tawlaili / payment la fel lo a awm lo."}
                    </p>
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {(listingsTab === "live" ? liveJobs : listingsTab === "expired" ? expiredJobs : draftJobs).map((job) => (
                    <div
                      key={job.id}
                      style={{
                        border: "1px solid #e5e7eb",
                        borderRadius: "16px",
                        padding: "20px",
                        display: "flex",
                        justifyContent: "space-between",
                        gap: "16px",
                        backgroundColor: "#ffffff",
                        transition: "border-color 0.2s"
                      }}
                      className="flex-col md:flex-row items-start md:items-center"
                    >
                      <div>
                        <h4 style={{ fontSize: "16px", fontWeight: 700, color: "#111827", margin: 0 }}>{job.title}</h4>
                        <p style={{ fontSize: "12px", color: "#6b7280", fontWeight: 600, marginTop: "4px", marginBottom: 0 }}>
                          {job.category.name} • District: {job.location.name}
                        </p>
                        {job.expiresAt && (
                          <p style={{ fontSize: "11px", color: "#1c7dfa", fontWeight: 700, marginTop: "6px", marginBottom: 0 }}>
                            Expires: {new Date(job.expiresAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }} className="shrink-0 self-end md:self-auto">
                        <Link
                          href={`/dashboard/edit/${job.id}`}
                          style={{
                            border: "1px solid #d1d5db",
                            backgroundColor: "#ffffff",
                            color: "#374151",
                            fontSize: "12px",
                            fontWeight: 700,
                            padding: "8px 16px",
                            borderRadius: "10px",
                            textDecoration: "none",
                            cursor: "pointer",
                          }}
                        >
                          {t("dashboard.edit_btn")}
                        </Link>
                        <button
                          onClick={() => handleDeleteJob(job.id, job.title)}
                          disabled={submitting}
                          style={{
                            border: "1px solid #fca5a5",
                            backgroundColor: "#fff5f5",
                            color: "#ef4444",
                            fontSize: "12px",
                            fontWeight: 700,
                            padding: "8px 16px",
                            borderRadius: "10px",
                            cursor: "pointer",
                            fontFamily: "inherit"
                          }}
                        >
                          {t("dashboard.delete_btn")}
                        </button>
                        
                        {(listingsTab === "expired" || listingsTab === "draft") && (
                          <button
                            onClick={() => {
                              setExtendingJobId(job.id);
                              setExtendingTitle(job.title);
                            }}
                            style={{
                              backgroundColor: "#1c7dfa",
                              color: "#ffffff",
                              fontSize: "12px",
                              fontWeight: 700,
                              padding: "8px 16px",
                              borderRadius: "10px",
                              border: "none",
                              cursor: "pointer",
                              fontFamily: "inherit"
                            }}
                          >
                            {t("dashboard.extend_btn")}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Stats sidebar panel */}
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div style={{
                background: "linear-gradient(135deg,#071022 0%,#0f1b30 50%,#1c7dfa 100%)",
                color: "#ffffff",
                borderRadius: "24px",
                padding: "24px",
                boxShadow: "0 10px 30px rgba(28,125,250,0.1)",
                display: "flex",
                flexDirection: "column",
                gap: "16px"
              }}>
                <h3 style={{ fontSize: "16px", fontWeight: 800, margin: 0 }}>Premium Banner Ad</h3>
                <p style={{ fontSize: "13px", fontWeight: 500, lineHeight: 1.5, opacity: 0.9, margin: 0 }}>
                  I hna puanzar hi he platform tlawh apiangte hmuh theih turin sidebar banner ads ah dah rawh. Contact Admin for pricing.
                </p>
                <a
                  href="mailto:admin@mizoramjobboard.com"
                  style={{
                    backgroundColor: "#ffffff",
                    color: "#1c7dfa",
                    fontWeight: 700,
                    fontSize: "12px",
                    padding: "10px 20px",
                    borderRadius: "100px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    alignSelf: "flex-start",
                    textDecoration: "none",
                    display: "inline-block",
                  }}
                >
                  Admin Be Rawh
                </a>
              </div>
            </div>

          </div>
        )}

        {activeTab === "billing" && (
          <div style={{
            backgroundColor: "#ffffff",
            border: "1px solid rgba(28,125,250,0.1)",
            borderRadius: "24px",
            padding: "32px",
            boxShadow: "0 10px 30px rgba(28,125,250,0.06)",
            display: "flex",
            flexDirection: "column",
            gap: "24px"
          }}>
            <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#1c7dfa", borderBottom: "1px solid #f0f9ff", paddingBottom: "16px", margin: 0 }}>
              {t("dashboard.payment_history")}
            </h2>

            {payments.length === 0 ? (
              <div style={{ padding: "48px 0", textAlign: "center", color: "#6b7280", fontSize: "14px", fontWeight: 600 }}>
                Pawisa pek tawh record hmuh tur a awm rih lo.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table style={{ width: "100%", textAlign: "left", fontSize: "14px", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1.5px solid #e5e7eb", color: "#6b7280", fontWeight: 700, fontSize: "12px", textTransform: "uppercase" }}>
                      <th style={{ padding: "12px 16px" }}>Job Title</th>
                      <th style={{ padding: "12px 16px" }}>{t("dashboard.amount")}</th>
                      <th style={{ padding: "12px 16px" }}>Duration</th>
                      <th style={{ padding: "12px 16px" }}>{t("dashboard.date")}</th>
                      <th style={{ padding: "12px 16px" }}>{t("dashboard.transaction_id")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p) => (
                      <tr
                        key={p.id}
                        style={{ borderBottom: "1px solid #f3f4f6", transition: "background-color 0.2s" }}
                        className="hover:bg-gray-50"
                      >
                        <td style={{ padding: "16px", fontWeight: 700, color: "#111827" }}>
                          {p.jobPost?.title || "Deleted Job Listing"}
                        </td>
                        <td style={{ padding: "16px", fontWeight: 700, color: "#1c7dfa" }}>
                          ₹{p.amount}
                        </td>
                        <td style={{ padding: "16px", fontWeight: 600, color: "#4b5563" }}>
                          {p.durationDays} Days
                        </td>
                        <td style={{ padding: "16px", color: "#4b5563" }}>
                          {new Date(p.createdAt).toLocaleDateString()}
                        </td>
                        <td style={{ padding: "16px", fontSize: "12px", fontFamily: "monospace", userSelect: "all", color: "#6b7280" }}>
                          {p.razorpayPaymentId || p.razorpayOrderId}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "settings" && (
          <div style={{
            backgroundColor: "#ffffff",
            border: "1px solid rgba(28,125,250,0.1)",
            borderRadius: "24px",
            padding: "32px",
            boxShadow: "0 10px 30px rgba(28,125,250,0.06)",
            display: "flex",
            flexDirection: "column",
            gap: "24px"
          }}>
            <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#ef4444", borderBottom: "1px solid #fee2e2", paddingBottom: "16px", margin: 0 }}>
              Account Hluai Leh Deletion
            </h2>

            <div
              style={{
                padding: "24px",
                borderRadius: "16px",
                backgroundColor: "#fee2e2",
                border: "1px solid rgba(239,68,68,0.15)",
                display: "flex",
                justifyContent: "space-between",
                gap: "24px"
              }}
              className="flex-col md:flex-row items-start md:items-center"
            >
              <div style={{ maxWidth: "560px" }}>
                <h3 style={{ fontSize: "15px", color: "#b91c1c", fontWeight: 700, margin: "0 0 6px" }}>
                  Account Delete Rawh (Soft-Delete Profile)
                </h3>
                <p style={{ fontSize: "13px", color: "#7f1d1d", fontWeight: 500, lineHeight: 1.5, margin: 0 }}>
                  I account i delete chuan i profile leh hna ruak puanzar zawng zawngte hi public feed atangin thup nghal vek an ni ang. I payments records te erawh financial history tan khek rih an ni thung dawn nia.
                </p>
              </div>

              <button
                onClick={handleDeleteAccount}
                disabled={submitting}
                style={{
                  backgroundColor: "#ef4444",
                  color: "#ffffff",
                  fontWeight: 700,
                  fontSize: "12px",
                  padding: "12px 24px",
                  borderRadius: "100px",
                  border: "none",
                  cursor: "pointer",
                  transition: "background-color 0.2s",
                  flexShrink: 0,
                  fontFamily: "inherit"
                }}
              >
                {submitting ? "Tih mek..." : t("dashboard.delete_account_btn")}
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Extension Popup Dialog Modal */}
      {extendingJobId && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "16px"
        }}>
          <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(4px)"
          }} onClick={() => setExtendingJobId(null)} />
          
          <div style={{
            position: "relative",
            width: "100%",
            maxWidth: "400px",
            backgroundColor: "#ffffff",
            border: "1px solid rgba(28,125,250,0.1)",
            borderRadius: "20px",
            padding: "24px",
            boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
            zIndex: 10,
          }}>
            
            <div style={{ display: "flex", alignItems: "center", borderBottom: "1px solid #f3f4f6", paddingBottom: "12px", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#1c7dfa", margin: 0 }}>Listing Renew / Extension</h3>
              <button
                onClick={() => setExtendingJobId(null)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "#9ca3af",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 0,
                  marginLeft: "auto"
                }}
              >
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleExtendSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <p style={{ fontSize: "13px", fontWeight: 500, color: "#4b5563", margin: 0, lineHeight: 1.4 }}>
                Hna ruak <strong>&ldquo;{extendingTitle}&rdquo;</strong> puanzarna hi a hnuaia mite thlang hian pawtsei rawh le.
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <button
                  type="button"
                  onClick={() => setExtendingDuration(15)}
                  style={{
                    padding: "16px",
                    borderRadius: "12px",
                    border: extendingDuration === 15 ? "2px solid #1c7dfa" : "1px solid #d1d5db",
                    backgroundColor: extendingDuration === 15 ? "#f0f9ff" : "#ffffff",
                    color: extendingDuration === 15 ? "#1c7dfa" : "#4b5563",
                    textAlign: "center",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "4px",
                    fontFamily: "inherit",
                    fontWeight: extendingDuration === 15 ? 700 : 500,
                  }}
                >
                  <span style={{ fontSize: "11px", textTransform: "uppercase" }}>Ni 15 (15 Days)</span>
                  <span style={{ fontSize: "18px", fontWeight: 800 }}>₹299</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => setExtendingDuration(30)}
                  style={{
                    padding: "16px",
                    borderRadius: "12px",
                    border: extendingDuration === 30 ? "2px solid #1c7dfa" : "1px solid #d1d5db",
                    backgroundColor: extendingDuration === 30 ? "#f0f9ff" : "#ffffff",
                    color: extendingDuration === 30 ? "#1c7dfa" : "#4b5563",
                    textAlign: "center",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "4px",
                    fontFamily: "inherit",
                    fontWeight: extendingDuration === 30 ? 700 : 500,
                  }}
                >
                  <span style={{ fontSize: "11px", textTransform: "uppercase" }}>Ni 30 (30 Days)</span>
                  <span style={{ fontSize: "18px", fontWeight: 800 }}>₹499</span>
                </button>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", paddingTop: "16px", borderTop: "1px solid #f3f4f6" }}>
                <button
                  type="button"
                  onClick={() => setExtendingJobId(null)}
                  style={{
                    backgroundColor: "#f3f4f6",
                    border: "1px solid #e5e7eb",
                    color: "#4b5563",
                    fontSize: "12px",
                    fontWeight: 700,
                    padding: "8px 16px",
                    borderRadius: "100px",
                    cursor: "pointer",
                    fontFamily: "inherit"
                  }}
                >
                  Tawp rawh
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    backgroundColor: "#1c7dfa",
                    border: "none",
                    color: "#ffffff",
                    fontSize: "12px",
                    fontWeight: 700,
                    padding: "8px 20px",
                    borderRadius: "100px",
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(28,125,250,0.2)",
                    fontFamily: "inherit"
                  }}
                >
                  {submitting ? "Payment..." : "Pay & Extend"}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
