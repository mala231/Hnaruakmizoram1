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
  deadline: string;
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

  // Profile settings state
  const [profileUsername, setProfileUsername] = useState(employer.username);
  const [profileEmail, setProfileEmail] = useState(employer.email);
  const [profilePhone, setProfilePhone] = useState(employer.phone);
  const [profileAddress, setProfileAddress] = useState(employer.address);
  const [profileLogo, setProfileLogo] = useState<File | null>(null);
  const [profileLogoPreview, setProfileLogoPreview] = useState(employer.logoUrl);
  const [updatingProfile, setUpdatingProfile] = useState(false);

  const [locatingProfile, setLocatingProfile] = useState(false);
  const [profileMapCoords, setProfileMapCoords] = useState<{ lat: number; lon: number } | null>(null);

  const handleProfileLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileLogo(file);
      setProfileLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleProfileUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      triggerAlert("error", "I browser-in geolocation a support lo.");
      return;
    }

    setLocatingProfile(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setProfileMapCoords({ lat: latitude, lon: longitude });

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            {
              headers: {
                "Accept-Language": "en",
                "User-Agent": "HnaruakMizoramEmployerPortal"
              }
            }
          );

          if (!response.ok) throw new Error("Geocoding failed");

          const data = await response.json();
          if (data && data.display_name) {
            setProfileAddress(data.display_name);
          } else {
            setProfileAddress(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
          }
        } catch (err) {
          setProfileAddress(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
        } finally {
          setLocatingProfile(false);
        }
      },
      (geoErr) => {
        let errorMsg = "Awnna hmun zawn chhuah a hlawhchham rih.";
        if (geoErr.code === geoErr.PERMISSION_DENIED) {
          errorMsg = "Hmun tak (location) luhna permission i deny a ni.";
        }
        triggerAlert("error", errorMsg);
        setLocatingProfile(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingProfile(true);

    // Validate email
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(profileEmail)) {
      triggerAlert("error", "Email format a dik lo.");
      setUpdatingProfile(false);
      return;
    }

    // Validate phone
    const phoneRegex = /^(?:\+91|0)?[6-9]\d{9}$/;
    if (!phoneRegex.test(profilePhone.replace(/\s+/g, ""))) {
      triggerAlert("error", "Phone number a dik lo (digit 10 a ni tur a ni).");
      setUpdatingProfile(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("username", profileUsername);
      formData.append("email", profileEmail);
      formData.append("phone", profilePhone);
      formData.append("address", profileAddress);
      if (profileLogo) {
        formData.append("logo", profileLogo);
      }

      const res = await fetch("/api/employer/update-profile", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        triggerAlert("success", "Profile thlak a hlawhtling ta!");
        router.refresh();
      } else {
        triggerAlert("error", data.error || "Profile update a hlawhchham.");
      }
    } catch (err) {
      triggerAlert("error", "Server biak pawh a harsat rih e.");
    } finally {
      setUpdatingProfile(false);
    }
  };


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
          name: "Hnaruak Mizoram",
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
        alert("Account delete a ni ta.");
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
                  <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20" style={{ color: "#1c7dfa", width: "20px", height: "20px" }}>
                    <title>Verified Employer</title>
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
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
                        {job.deadline && (
                          <p style={{ fontSize: "11px", color: "#1c7dfa", fontWeight: 700, marginTop: "6px", marginBottom: 0 }}>
                            Deadline: {new Date(job.deadline).toLocaleDateString()}
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
                <Link
                  href="/contact"
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
                </Link>
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
          <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
            {/* Profile Edit Panel */}
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
                Profile Tihdanglamna (Edit Profile)
              </h2>

              <form onSubmit={handleUpdateProfile} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                {/* Logo Upload */}
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <label style={{ fontSize: "13px", fontWeight: 700, color: "#374151" }}>
                    Company Logo (Thlalak)
                  </label>
                  <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                    {/* Preview */}
                    <div
                      style={{
                        width: "80px",
                        height: "80px",
                        borderRadius: "16px",
                        border: "2px dashed #d1d5db",
                        background: "#f9fafb",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                        flexShrink: 0,
                      }}
                    >
                      {profileLogoPreview ? (
                        <img src={profileLogoPreview} alt="Logo preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#9ca3af">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      )}
                    </div>
                    {/* Upload button */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProfileLogoChange}
                        style={{ display: "none" }}
                        id="profile-logo-upload"
                      />
                      <label
                        htmlFor="profile-logo-upload"
                        style={{
                          display: "inline-block",
                          padding: "9px 18px",
                          background: "#f1f5f9",
                          border: "1.5px solid #cbd5e1",
                          borderRadius: "10px",
                          fontSize: "13px",
                          fontWeight: 700,
                          color: "#1c7dfa",
                          cursor: "pointer",
                          textAlign: "center"
                        }}
                      >
                        Thlalak thlang rawh (Choose Image)
                      </label>
                      <span style={{ fontSize: "11px", color: "#9ca3af", fontWeight: 500 }}>
                        PNG, JPG emaw WEBP (Max 2MB)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Form fields in a 2x2 grid */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#374151", marginBottom: "8px" }}>
                      Username (Mimal Hming)
                    </label>
                    <input
                      type="text"
                      required
                      value={profileUsername}
                      onChange={(e) => setProfileUsername(e.target.value)}
                      style={{
                        width: "100%",
                        boxSizing: "border-box",
                        padding: "12px 16px",
                        fontSize: "14px",
                        fontWeight: 500,
                        color: "#111827",
                        background: "#f9fafb",
                        border: "1.5px solid #e5e7eb",
                        borderRadius: "12px",
                        outline: "none",
                        fontFamily: "inherit"
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#374151", marginBottom: "8px" }}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={profileEmail}
                      onChange={(e) => setProfileEmail(e.target.value)}
                      style={{
                        width: "100%",
                        boxSizing: "border-box",
                        padding: "12px 16px",
                        fontSize: "14px",
                        fontWeight: 500,
                        color: "#111827",
                        background: "#f9fafb",
                        border: "1.5px solid #e5e7eb",
                        borderRadius: "12px",
                        outline: "none",
                        fontFamily: "inherit"
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#374151", marginBottom: "8px" }}>
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      required
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      style={{
                        width: "100%",
                        boxSizing: "border-box",
                        padding: "12px 16px",
                        fontSize: "14px",
                        fontWeight: 500,
                        color: "#111827",
                        background: "#f9fafb",
                        border: "1.5px solid #e5e7eb",
                        borderRadius: "12px",
                        outline: "none",
                        fontFamily: "inherit"
                      }}
                    />
                  </div>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <label style={{ fontSize: "13px", fontWeight: 700, color: "#374151", margin: 0 }}>
                        Physical Address (Awmna Hmun)
                      </label>
                      <button
                        type="button"
                        onClick={handleProfileUseCurrentLocation}
                        disabled={locatingProfile}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#1c7dfa",
                          fontSize: "12px",
                          fontWeight: 700,
                          cursor: locatingProfile ? "not-allowed" : "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          padding: 0,
                          fontFamily: "inherit"
                        }}
                      >
                        {locatingProfile ? (
                          <>
                            <svg style={{ animation: "spin 1s linear infinite" }} width="12" height="12" fill="none" viewBox="0 0 24 24">
                              <circle cx="12" cy="12" r="10" stroke="#1c7dfa" strokeWidth="4" strokeDasharray="40" strokeDashoffset="10" />
                            </svg>
                            Hmun zawng mek...
                          </>
                        ) : (
                          <>
                            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Ka Hmun Hmang Rawh
                          </>
                        )}
                      </button>
                    </div>
                    <input
                      type="text"
                      required
                      value={profileAddress}
                      onChange={(e) => setProfileAddress(e.target.value)}
                      style={{
                        width: "100%",
                        boxSizing: "border-box",
                        padding: "12px 16px",
                        fontSize: "14px",
                        fontWeight: 500,
                        color: "#111827",
                        background: "#f9fafb",
                        border: "1.5px solid #e5e7eb",
                        borderRadius: "12px",
                        outline: "none",
                        fontFamily: "inherit"
                      }}
                    />
                  </div>
                </div>

                {profileMapCoords && (
                  <div style={{ borderRadius: "12px", overflow: "hidden", border: "1.5px solid #e5e7eb" }}>
                    <iframe
                      title="Profile Location Map"
                      width="100%"
                      height="220"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      src={`https://maps.google.com/maps?q=${profileMapCoords.lat},${profileMapCoords.lon}&z=16&output=embed`}
                    />
                  </div>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={updatingProfile}
                  style={{
                    alignSelf: "flex-start",
                    background: updatingProfile ? "#dbeafe" : "linear-gradient(135deg,#1c7dfa,#0a84ff)",
                    color: updatingProfile ? "#6b7280" : "#ffffff",
                    fontWeight: 700,
                    fontSize: "14px",
                    padding: "12px 28px",
                    borderRadius: "100px",
                    border: "none",
                    cursor: updatingProfile ? "not-allowed" : "pointer",
                    boxShadow: updatingProfile ? "none" : "0 4px 14px rgba(28,125,250,0.25)",
                    fontFamily: "inherit",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                  }}
                >
                  {updatingProfile ? (
                    <>
                      <svg style={{ animation: "spin 1s linear infinite" }} width="16" height="16" fill="none" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" stroke="#6b7280" strokeWidth="3" strokeDasharray="60" strokeDashoffset="15" />
                      </svg>
                      Tihthar mek...
                    </>
                  ) : (
                    "Profile Update Rawh"
                  )}
                </button>
              </form>
              <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            </div>

            {/* Account Deletion Panel */}
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
