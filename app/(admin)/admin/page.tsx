"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { t } from "@/lib/i18n";

interface Item {
  id: number;
  name: string;
  createdAt: string;
}

interface TickerItem {
  id: number;
  text: string;
  isActive: boolean;
  createdAt: string;
}

interface AdItem {
  id: number;
  imageUrl: string;
  targetUrl: string;
  position: string;
  isActive: boolean;
  createdAt: string;
}

interface EmployerItem {
  id: string;
  username: string;
  email: string;
  phone: string;
  address: string;
  logoUrl: string;
  isVerified: boolean;
  isDeleted: boolean;
  createdAt: string;
}

interface ReportItem {
  id: number;
  jobPostId: string;
  reason: string;
  details: string | null;
  status: string;
  createdAt: string;
  jobPost?: {
    title: string;
    employer?: {
      username: string;
    };
  };
}

type TabType = "categories" | "locations" | "tickers" | "ads" | "employers" | "reports";

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("categories");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  interface ConfirmDialogState {
    title: string;
    message: string;
    onConfirm: () => void;
  }
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState | null>(null);

  // Alerts
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Data lists
  const [categories, setCategories] = useState<Item[]>([]);
  const [locations, setLocations] = useState<Item[]>([]);
  const [tickers, setTickers] = useState<TickerItem[]>([]);
  const [ads, setAds] = useState<AdItem[]>([]);
  const [employers, setEmployers] = useState<EmployerItem[]>([]);
  const [reports, setReports] = useState<ReportItem[]>([]);

  // Category/Location edit states
  const [newItemName, setNewItemName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");

  // Ticker edit states
  const [newTickerText, setNewTickerText] = useState("");
  const [editingTickerId, setEditingTickerId] = useState<number | null>(null);
  const [editingTickerText, setEditingTickerText] = useState("");

  // Ad form states
  const [newAdImage, setNewAdImage] = useState<File | null>(null);
  const [newAdTargetUrl, setNewAdTargetUrl] = useState("");
  const [newAdPosition, setNewAdPosition] = useState("sidebar");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [catRes, locRes, tickRes, adsRes, empRes, repRes] = await Promise.all([
        fetch("/api/admin/categories"),
        fetch("/api/admin/locations"),
        fetch("/api/admin/tickers"),
        fetch("/api/admin/ads"),
        fetch("/api/admin/employers"),
        fetch("/api/admin/reports"),
      ]);

      const catData = await catRes.json();
      const locData = await locRes.json();
      const tickData = await tickRes.json();
      const adsData = await adsRes.json();
      const empData = await empRes.json();
      const repData = await repRes.json();

      if (catData.success) setCategories(catData.data);
      if (locData.success) setLocations(locData.data);
      if (tickData.success) setTickers(tickData.data);
      if (adsData.success) setAds(adsData.data);
      if (empData.success) setEmployers(empData.data);
      if (repData.success) setReports(repData.data);
    } catch (err) {
      setErrorMsg("Data lak khawm a harsat rih e.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
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

  // CATEGORY & LOCATION CRUD
  const handleCreateCatLoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    setSubmitting(true);
    const apiPath = activeTab === "categories" ? "/api/admin/categories" : "/api/admin/locations";

    try {
      const res = await fetch(apiPath, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newItemName }),
      });
      const data = await res.json();
      if (data.success) {
        setNewItemName("");
        triggerAlert("success", "Option thar siam a ni ta.");
        fetchData();
      } else {
        triggerAlert("error", data.error || "Siam a hlawhchham.");
      }
    } catch (err) {
      triggerAlert("error", "Server biak pawh a harsat rih e.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveCatLocEdit = async (id: number) => {
    if (!editingName.trim()) return;

    setSubmitting(true);
    const apiPath = activeTab === "categories" ? `/api/admin/categories/${id}` : `/api/admin/locations/${id}`;

    try {
      const res = await fetch(apiPath, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editingName }),
      });
      const data = await res.json();
      if (data.success) {
        setEditingId(null);
        setEditingName("");
        triggerAlert("success", "Option thupui thlak a ni ta.");
        fetchData();
      } else {
        triggerAlert("error", data.error || "Thlak a hlawhchham.");
      }
    } catch (err) {
      triggerAlert("error", "Server biak pawh a harsat rih e.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCatLoc = (id: number, name: string) => {
    setConfirmDialog({
      title: activeTab === "categories" ? "Category Delete" : "District Delete",
      message: `Option "${name}" hi i delete duh takzet em?`,
      onConfirm: async () => {
        setSubmitting(true);
        const apiPath = activeTab === "categories" ? `/api/admin/categories/${id}` : `/api/admin/locations/${id}`;
        try {
          const res = await fetch(apiPath, { method: "DELETE" });
          const data = await res.json();
          if (data.success) {
            triggerAlert("success", "Delete hlawhtling a ni.");
            fetchData();
          } else {
            triggerAlert("error", data.error || "Delete a hlawhchham.");
          }
        } catch (err) {
          triggerAlert("error", "Server biak pawh a harsat.");
        } finally {
          setSubmitting(false);
        }
      }
    });
  };

  // TICKERS CRUD
  const handleCreateTicker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTickerText.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/tickers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: newTickerText }),
      });
      const data = await res.json();
      if (data.success) {
        setNewTickerText("");
        triggerAlert("success", "Ticker announcement thar siam a ni.");
        fetchData();
      } else {
        triggerAlert("error", data.error || "Ticker siam a hlawhchham.");
      }
    } catch (err) {
      triggerAlert("error", "Server biak pawh a harsat.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleTicker = async (item: TickerItem) => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/tickers/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !item.isActive }),
      });
      const data = await res.json();
      if (data.success) {
        triggerAlert("success", "Ticker status thlak a ni ta.");
        fetchData();
      } else {
        triggerAlert("error", data.error || "Toggling failed.");
      }
    } catch (err) {
      triggerAlert("error", "Server biak pawh a harsat.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveTickerEdit = async (id: number) => {
    if (!editingTickerText.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/tickers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: editingTickerText }),
      });
      const data = await res.json();
      if (data.success) {
        setEditingTickerId(null);
        setEditingTickerText("");
        triggerAlert("success", "Ticker text thlak a ni.");
        fetchData();
      } else {
        triggerAlert("error", data.error || "Thlak a hlawhchham.");
      }
    } catch (err) {
      triggerAlert("error", "Server biak pawh a harsat.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTicker = (id: number) => {
    setConfirmDialog({
      title: "Delete Ticker Announcement",
      message: "Ticker hi i delete duh takzet em?",
      onConfirm: async () => {
        setSubmitting(true);
        try {
          const res = await fetch(`/api/admin/tickers/${id}`, { method: "DELETE" });
          const data = await res.json();
          if (data.success) {
            triggerAlert("success", "Ticker delete a ni.");
            fetchData();
          } else {
            triggerAlert("error", data.error || "Delete failed.");
          }
        } catch (err) {
          triggerAlert("error", "Server biak pawh a harsat.");
        } finally {
          setSubmitting(false);
        }
      }
    });
  };

  // BANNER ADS CRUD
  const handleCreateAd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdImage || !newAdTargetUrl.trim() || !newAdPosition.trim()) return;

    setSubmitting(true);
    const formData = new FormData();
    formData.append("image", newAdImage);
    formData.append("targetUrl", newAdTargetUrl);
    formData.append("position", newAdPosition);

    try {
      const res = await fetch("/api/admin/ads", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setNewAdImage(null);
        setNewAdTargetUrl("");
        setNewAdPosition("sidebar");
        // Reset file input element
        const fileInput = document.getElementById("ad-image-input") as HTMLInputElement;
        if (fileInput) fileInput.value = "";

        triggerAlert("success", "Sidebar Ad thar siam a ni ta.");
        fetchData();
      } else {
        triggerAlert("error", data.error || "Ad uploader failed.");
      }
    } catch (err) {
      triggerAlert("error", "Server biak pawh a harsat.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleAd = async (item: AdItem) => {
    console.log("handleToggleAd called for item:", item);
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/ads/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !item.isActive }),
      });
      const data = await res.json();
      console.log("handleToggleAd response:", data);
      if (data.success) {
        triggerAlert("success", "Ad status thlak a ni.");
        fetchData();
      } else {
        triggerAlert("error", data.error || "Toggling failed.");
      }
    } catch (err) {
      console.error("handleToggleAd error:", err);
      triggerAlert("error", "Server biak pawh a harsat.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAd = (id: number) => {
    console.log("handleDeleteAd called for id:", id);
    setConfirmDialog({
      title: "Delete Ad Banner",
      message: "Ad banner hi i delete duh takzet em?",
      onConfirm: async () => {
        setSubmitting(true);
        try {
          const res = await fetch(`/api/admin/ads/${id}`, { method: "DELETE" });
          const data = await res.json();
          console.log("handleDeleteAd response:", data);
          if (data.success) {
            triggerAlert("success", "Ad delete a ni.");
            fetchData();
          } else {
            triggerAlert("error", data.error || "Delete failed.");
          }
        } catch (err) {
          console.error("handleDeleteAd error:", err);
          triggerAlert("error", "Server biak pawh a harsat.");
        } finally {
          setSubmitting(false);
        }
      }
    });
  };

  // EMPLOYERS MODERATION
  const handleToggleVerifyEmployer = async (item: EmployerItem) => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/employers/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVerified: !item.isVerified }),
      });
      const data = await res.json();
      if (data.success) {
        triggerAlert("success", "Employer verification updated.");
        fetchData();
      } else {
        triggerAlert("error", data.error || "Toggle failed.");
      }
    } catch (err) {
      triggerAlert("error", "Server biak pawh a harsat.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSuspendEmployer = (id: string, name: string) => {
    setConfirmDialog({
      title: "Suspend Employer",
      message: `Employer "${name}" hi suspend/delete i duh takzet em? A hna ruak dah zawng zawng a bo nghal ang.`,
      onConfirm: async () => {
        setSubmitting(true);
        try {
          const res = await fetch(`/api/admin/employers/${id}`, { method: "DELETE" });
          const data = await res.json();
          if (data.success) {
            triggerAlert("success", "Employer suspended (soft-deleted).");
            fetchData();
          } else {
            triggerAlert("error", data.error || "Suspension failed.");
          }
        } catch (err) {
          triggerAlert("error", "Server biak pawh a harsat.");
        } finally {
          setSubmitting(false);
        }
      }
    });
  };

  // REPORTS LOG MODERATION
  const handleDismissReport = async (id: number) => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/reports/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "dismissed" }),
      });
      const data = await res.json();
      if (data.success) {
        triggerAlert("success", "Report dismiss/reviewed a ni.");
        fetchData();
      } else {
        triggerAlert("error", data.error || "Status update failed.");
      }
    } catch (err) {
      triggerAlert("error", "Server biak pawh a harsat.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReportedPost = (reportId: number, title: string) => {
    setConfirmDialog({
      title: "Delete Reported Job",
      message: `Hna rawt "${title}" hi i delete duh takzet em?`,
      onConfirm: async () => {
        setSubmitting(true);
        try {
          const res = await fetch(`/api/admin/reports/${reportId}`, { method: "DELETE" });
          const data = await res.json();
          if (data.success) {
            triggerAlert("success", "Reported job post deleted and resolved.");
            fetchData();
          } else {
            triggerAlert("error", data.error || "Action failed.");
          }
        } catch (err) {
          triggerAlert("error", "Server biak pawh a harsat.");
        } finally {
          setSubmitting(false);
        }
      }
    });
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } catch (err) {
      triggerAlert("error", "Logout failed.");
    }
  };

  return (
    <div className="flex-grow bg-background">
      {/* Admin Top Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-outline-variant/30 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-container-margin-mobile md:px-container-margin-desktop h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-on-primary font-bold text-lg shadow-md">
              A
            </span>
            <span className="font-display font-extrabold text-xl text-primary tracking-tight">
              Mizoram Job Board <span className="text-secondary font-medium text-xs border border-secondary/20 bg-secondary/5 rounded-full px-2 py-0.5 ml-1">Admin Panel</span>
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="bg-surface-container hover:bg-surface-container-high border border-outline/20 text-primary font-bold text-xs px-5 py-2.5 rounded-full transition-all duration-200 flex items-center gap-1.5 shadow-sm no-underline"
            >
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11v11a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Bul Tanna (Home)
            </Link>
            <button
              onClick={handleLogout}
              className="bg-primary hover:bg-primary-container text-white font-bold text-xs px-5 py-2.5 rounded-full transition-colors shadow-sm cursor-pointer border-none"
            >
              Chhuahna (Logout)
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto py-12 px-container-margin-mobile md:px-container-margin-desktop flex flex-col gap-8">
        
        {/* Intro */}
        <div className="flex flex-col gap-2">
          <h1 className="headline-lg text-primary">Admin Control Center</h1>
          <p className="text-sm text-on-surface-variant font-medium font-sans">
            Mizoram Job Board governing tools: Categories, Districts, Tickers, Banners, Verification, and Flag reports.
          </p>
        </div>

        {/* Dynamic Alerts */}
        {successMsg && (
          <div className="p-4 rounded-xl bg-success-container border border-success/20 text-on-success-container text-xs font-semibold flex items-center gap-2">
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{successMsg}</span>
          </div>
        )}
        
        {errorMsg && (
          <div className="p-4 rounded-xl bg-error-container border border-error/20 text-on-error-container text-xs font-semibold flex items-center gap-2">
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Tab Selection Row */}
        <div className="flex border-b border-outline-variant/30 gap-2 overflow-x-auto select-none">
          {[
            { id: "categories", label: "Category-te" },
            { id: "locations", label: "District-te" },
            { id: "tickers", label: t("admin.tickers") },
            { id: "ads", label: t("admin.ads") },
            { id: "employers", label: t("admin.employers") },
            { id: "reports", label: t("admin.reports") },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as TabType);
                setNewItemName("");
                setNewTickerText("");
                setEditingId(null);
                setEditingTickerId(null);
              }}
              className={`px-5 py-3 font-display font-bold text-xs shrink-0 transition-all relative ${
                activeTab === tab.id
                  ? "text-primary border-b-2 border-primary"
                  : "text-on-surface-variant hover:text-primary"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Loader */}
        {loading ? (
          <div className="py-24 flex justify-center items-center">
            <svg className="animate-spin h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* CATEGORIES & LOCATIONS PANELS */}
            {(activeTab === "categories" || activeTab === "locations") && (
              <>
                {/* Form */}
                <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-md flex flex-col gap-4">
                  <h3 className="title-md text-primary">
                    {activeTab === "categories" ? "Category Thar Siam" : "District Thar Siam"}
                  </h3>
                  <form onSubmit={handleCreateCatLoc} className="flex flex-col gap-4">
                    <div>
                      <label className="label-sm text-on-background/80 mb-1.5 block">Hming</label>
                      <input
                        type="text"
                        required
                        disabled={submitting}
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        className="w-full bg-surface-container border border-outline-variant/40 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:border-primary transition-colors text-on-background"
                        placeholder={activeTab === "categories" ? "e.g. Retail Job..." : "e.g. Aizawl..."}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={submitting || !newItemName.trim()}
                      className="w-full bg-primary hover:bg-primary-container disabled:bg-surface-dim disabled:text-on-surface-variant text-on-primary font-bold text-xs py-3 rounded-xl transition-all shadow-sm cursor-pointer"
                    >
                      {submitting ? "Siam mek..." : "Siam rawh"}
                    </button>
                  </form>
                </div>

                {/* Table List */}
                <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-md">
                  <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4 mb-4">
                    <h3 className="title-md text-primary">
                      {activeTab === "categories" ? "Categories List" : "Districts List"}
                    </h3>
                  </div>
                  <table className="w-full text-left text-sm font-medium border-collapse">
                    <thead>
                      <tr className="border-b border-outline-variant/20 text-on-surface-variant font-bold text-xs uppercase tracking-wider">
                        <th className="py-3 px-4">Hming</th>
                        <th className="py-3 px-4 text-right">Rilru</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(activeTab === "categories" ? categories : locations).map((item) => (
                        <tr key={item.id} className="border-b border-outline-variant/10 hover:bg-surface-container-low transition-colors">
                          <td className="py-3 px-4 font-semibold text-on-background">
                            {editingId === item.id ? (
                              <input
                                type="text"
                                value={editingName}
                                onChange={(e) => setEditingName(e.target.value)}
                                className="bg-surface-container border border-primary/45 rounded-lg px-2 py-1 w-full text-sm font-semibold"
                              />
                            ) : (
                              item.name
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            {editingId === item.id ? (
                              <div className="flex items-center justify-end gap-2">
                                <button onClick={() => handleSaveCatLocEdit(item.id)} className="bg-primary text-on-primary text-xs font-bold px-3 py-1 rounded-lg cursor-pointer">Khawl</button>
                                <button onClick={() => setEditingId(null)} className="bg-surface-container text-on-surface text-xs font-bold px-3 py-1 rounded-lg cursor-pointer">Cancel</button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-end gap-3 text-xs font-bold">
                                <button onClick={() => { setEditingId(item.id); setEditingName(item.name); }} className="text-secondary hover:underline cursor-pointer">Edit</button>
                                <button onClick={() => handleDeleteCatLoc(item.id, item.name)} className="text-error hover:underline cursor-pointer">Delete</button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* TICKER MANAGER TAB */}
            {activeTab === "tickers" && (
              <>
                {/* Form */}
                <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-md flex flex-col gap-4">
                  <h3 className="title-md text-primary">{t("admin.add_ticker_btn")}</h3>
                  <form onSubmit={handleCreateTicker} className="flex flex-col gap-4">
                    <div>
                      <label className="label-sm text-on-background/80 mb-1.5 block">Ticker Text</label>
                      <textarea
                        required
                        disabled={submitting}
                        value={newTickerText}
                        onChange={(e) => setNewTickerText(e.target.value)}
                        className="w-full bg-surface-container border border-outline-variant/40 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-primary transition-colors text-on-background"
                        placeholder={t("admin.ticker_placeholder")}
                        rows={4}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={submitting || !newTickerText.trim()}
                      className="w-full bg-primary hover:bg-primary-container disabled:bg-surface-dim disabled:text-on-surface-variant text-on-primary font-bold text-xs py-3 rounded-xl transition-all shadow-sm cursor-pointer"
                    >
                      {submitting ? "Siam mek..." : "Siam rawh"}
                    </button>
                  </form>
                </div>

                {/* List */}
                <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-md flex flex-col gap-4">
                  <h3 className="title-md text-primary border-b border-outline-variant/20 pb-2">Announcements List</h3>
                  
                  {tickers.length === 0 ? (
                    <div className="py-12 text-center text-on-surface-variant text-sm font-semibold">
                      Ticker text siam a la awm lo.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {tickers.map((item) => (
                        <div key={item.id} className="border border-outline-variant/20 rounded-2xl p-4 bg-surface-container-lowest flex flex-col gap-3">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-grow font-semibold text-sm text-on-background leading-relaxed">
                              {editingTickerId === item.id ? (
                                <textarea
                                  value={editingTickerText}
                                  onChange={(e) => setEditingTickerText(e.target.value)}
                                  className="w-full bg-surface-container border border-primary/40 rounded-lg p-2 text-sm font-semibold"
                                  rows={2}
                                />
                              ) : (
                                item.text
                              )}
                            </div>
                            
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              item.isActive ? "bg-success-container text-on-success-container" : "bg-surface-container text-on-surface-variant"
                            }`}>
                              {item.isActive ? "Active" : "Inactive"}
                            </span>
                          </div>

                          <div className="flex items-center justify-between border-t border-outline-variant/10 pt-3 text-xs font-bold">
                            <button
                              onClick={() => handleToggleTicker(item)}
                              disabled={submitting}
                              className="text-primary hover:underline cursor-pointer"
                            >
                              {item.isActive ? "Deactivate" : "Activate"}
                            </button>

                            <div className="flex gap-4">
                              {editingTickerId === item.id ? (
                                <>
                                  <button onClick={() => handleSaveTickerEdit(item.id)} className="text-secondary hover:underline cursor-pointer">Khawl</button>
                                  <button onClick={() => setEditingTickerId(null)} className="text-on-surface-variant hover:underline cursor-pointer">Tawp</button>
                                </>
                              ) : (
                                <>
                                  <button onClick={() => { setEditingTickerId(item.id); setEditingTickerText(item.text); }} className="text-secondary hover:underline cursor-pointer">Edit</button>
                                  <button onClick={() => handleDeleteTicker(item.id)} className="text-error hover:underline cursor-pointer">Delete</button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* BANNER ADS MANAGER TAB */}
            {activeTab === "ads" && (
              <>
                {/* Form */}
                <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-md flex flex-col gap-4">
                  <h3 className="title-md text-primary">{t("admin.add_ad_btn")}</h3>
                  <form onSubmit={handleCreateAd} className="flex flex-col gap-4">
                    <div>
                      <label className="label-sm text-on-background/80 mb-1.5 block">Ad Banner Image File</label>
                      <input
                        id="ad-image-input"
                        type="file"
                        accept="image/*"
                        required
                        disabled={submitting}
                        onChange={(e) => setNewAdImage(e.target.files?.[0] || null)}
                        className="w-full text-xs text-on-surface-variant file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-surface-container file:text-primary file:cursor-pointer"
                      />
                    </div>
                    
                    <div>
                      <label className="label-sm text-on-background/80 mb-1.5 block">Target Website URL</label>
                      <input
                        type="text"
                        required
                        disabled={submitting}
                        value={newAdTargetUrl}
                        onChange={(e) => setNewAdTargetUrl(e.target.value)}
                        className="w-full bg-surface-container border border-outline-variant/40 rounded-xl px-4 py-2 text-sm font-semibold focus:outline-none focus:border-primary text-on-background"
                        placeholder="e.g. google.com"
                      />
                    </div>

                    <div>
                      <label className="label-sm text-on-background/80 mb-1.5 block">{t("admin.position_label")}</label>
                      <select
                        value={newAdPosition}
                        disabled={submitting}
                        onChange={(e) => setNewAdPosition(e.target.value)}
                        className="w-full bg-surface-container border border-outline-variant/40 rounded-xl px-4 py-2 text-sm font-semibold focus:outline-none cursor-pointer"
                      >
                        <option value="sidebar">Sidebar Slot 1</option>
                        <option value="sidebar_2">Sidebar Slot 2</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting || !newAdImage || !newAdTargetUrl.trim()}
                      className="w-full bg-primary hover:bg-primary-container disabled:bg-surface-dim disabled:text-on-surface-variant text-on-primary font-bold text-xs py-3 rounded-xl transition-all shadow-sm cursor-pointer"
                    >
                      {submitting ? "Upload mek..." : "Upload & Siam"}
                    </button>
                  </form>
                </div>

                {/* Grid List */}
                <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-md flex flex-col gap-4">
                  <h3 className="title-md text-primary border-b border-outline-variant/20 pb-2">Active Banners</h3>
                  
                  {ads.length === 0 ? (
                    <div className="py-12 text-center text-on-surface-variant text-sm font-semibold">
                      Ad banner dah a la awm lo.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {ads.map((item) => (
                        <div key={item.id} className="border border-outline-variant/30 rounded-2xl overflow-hidden bg-surface-container-lowest shadow-sm flex flex-col justify-between">
                          <div className="relative aspect-video w-full bg-surface-container">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={item.imageUrl} alt="Advertisement" className="w-full h-full object-cover" />
                          </div>

                          <div className="p-4 flex flex-col gap-2">
                            <p className="text-xs font-mono select-all truncate text-on-surface-variant">URL: {item.targetUrl}</p>
                            <p className="text-[11px] font-bold text-secondary">Position: {item.position}</p>
                            
                            <div className="flex items-center justify-between border-t border-outline-variant/15 pt-3 mt-2 text-xs font-bold">
                              <button
                                onClick={() => handleToggleAd(item)}
                                disabled={submitting}
                                className="text-primary hover:underline cursor-pointer relative z-10 py-1 px-2"
                              >
                                {item.isActive ? "Deactivate" : "Activate"}
                              </button>

                              <button
                                onClick={() => handleDeleteAd(item.id)}
                                disabled={submitting}
                                className="text-error hover:underline cursor-pointer relative z-10 py-1 px-2"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* EMPLOYERS MODERATION TAB */}
            {activeTab === "employers" && (
              <div className="lg:col-span-3 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-md">
                <h3 className="title-md text-primary border-b border-outline-variant/20 pb-4 mb-4">Employers Moderation Feed</h3>
                
                {employers.length === 0 ? (
                  <div className="py-12 text-center text-on-surface-variant text-sm font-semibold">
                    Employer inregistrete an la awm lo.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm font-medium border-collapse">
                      <thead>
                        <tr className="border-b border-outline-variant/20 text-on-surface-variant font-bold text-xs uppercase tracking-wider">
                          <th className="py-3 px-4">Employer</th>
                          <th className="py-3 px-4">Contact</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">Moderations</th>
                        </tr>
                      </thead>
                      <tbody>
                        {employers.map((item) => (
                          <tr key={item.id} className="border-b border-outline-variant/10 hover:bg-surface-container-low transition-colors">
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-surface-container overflow-hidden shrink-0 flex items-center justify-center border border-outline-variant/20">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={item.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                                </div>
                                <div>
                                  <div className="font-bold text-on-background flex items-center gap-1.5">
                                    {item.username}
                                    {item.isVerified && (
                                      <span className="bg-primary-container text-on-primary-container text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase">V</span>
                                    )}
                                  </div>
                                  <span className="text-[10px] text-on-surface-variant/80 font-semibold">{item.address}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-xs font-semibold text-on-surface-variant">
                              <p>{item.email}</p>
                              <p className="mt-0.5 text-on-surface-variant/70">{item.phone}</p>
                            </td>
                            <td className="py-4 px-4">
                              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                                item.isDeleted ? "bg-error-container text-on-error-container" : "bg-success-container text-on-success-container"
                              }`}>
                                {item.isDeleted ? "Suspended" : "Active"}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-right">
                              <div className="flex items-center justify-end gap-3 text-xs font-bold">
                                {!item.isDeleted && (
                                  <>
                                    <button
                                      onClick={() => handleToggleVerifyEmployer(item)}
                                      disabled={submitting}
                                      className="text-secondary hover:underline cursor-pointer"
                                    >
                                      {item.isVerified ? "Unverify" : "Verify"}
                                    </button>
                                    <button
                                      onClick={() => handleSuspendEmployer(item.id, item.username)}
                                      disabled={submitting}
                                      className="text-error hover:underline cursor-pointer"
                                    >
                                      Suspend
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* USER REPORTS TAB */}
            {activeTab === "reports" && (
              <div className="lg:col-span-3 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-md">
                <h3 className="title-md text-primary border-b border-outline-variant/20 pb-4 mb-4">Seeker Reports Log</h3>
                
                {reports.length === 0 ? (
                  <div className="py-12 text-center text-on-surface-variant text-sm font-semibold">
                    Reports a la awm lo e.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm font-medium border-collapse">
                      <thead>
                        <tr className="border-b border-outline-variant/20 text-on-surface-variant font-bold text-xs uppercase tracking-wider">
                          <th className="py-3 px-4">Report Details</th>
                          <th className="py-3 px-4">Reason & Message</th>
                          <th className="py-3 px-4">Report Status</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reports.map((item) => (
                          <tr key={item.id} className="border-b border-outline-variant/10 hover:bg-surface-container-low transition-colors">
                            <td className="py-4 px-4">
                              <div className="font-bold text-on-background">{item.jobPost?.title || "Deleted Job Post"}</div>
                              <span className="text-[10px] text-on-surface-variant/80 font-semibold">
                                Employer: {item.jobPost?.employer?.username || "N/A"}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-xs font-semibold text-on-surface-variant leading-relaxed max-w-sm">
                              <p className="font-bold text-error">Chhan: {item.reason}</p>
                              {item.details && <p className="mt-1 font-medium text-on-surface-variant/80 select-all">{item.details}</p>}
                            </td>
                            <td className="py-4 px-4">
                              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                                item.status === "pending"
                                  ? "bg-error-container text-on-error-container"
                                  : "bg-surface-container text-on-surface-variant"
                              }`}>
                                {item.status}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-right">
                              <div className="flex items-center justify-end gap-3 text-xs font-bold">
                                {item.status === "pending" && (
                                  <>
                                    <button
                                      onClick={() => handleDismissReport(item.id)}
                                      disabled={submitting}
                                      className="text-secondary hover:underline cursor-pointer"
                                    >
                                      Dismiss
                                    </button>
                                    {item.jobPost && (
                                      <button
                                        onClick={() => handleDeleteReportedPost(item.id, item.jobPost?.title || "")}
                                        disabled={submitting}
                                        className="text-error hover:underline cursor-pointer"
                                      >
                                        Delete Post
                                      </button>
                                    )}
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                 )}
              </div>
            )}

          </div>
        )}
      </main>

      {/* Custom Confirm Modal */}
      {confirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl flex flex-col gap-4">
            <h3 className="title-md text-primary">{confirmDialog.title}</h3>
            <p className="text-sm text-on-surface-variant font-medium font-sans leading-relaxed">
              {confirmDialog.message}
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setConfirmDialog(null)}
                className="bg-surface-container hover:bg-surface-container-high text-primary font-bold text-xs px-5 py-2.5 rounded-full transition-colors cursor-pointer border-none"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  confirmDialog.onConfirm();
                  setConfirmDialog(null);
                }}
                className="bg-error hover:bg-error/90 text-white font-bold text-xs px-5 py-2.5 rounded-full transition-colors cursor-pointer border-none"
              >
                Tihpuitling (Confirm)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
