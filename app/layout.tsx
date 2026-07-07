import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";
import Ticker from "@/components/Ticker";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PWARegistration from "@/components/PWARegistration";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCachedCategories, getCachedDistricts } from "@/lib/queries";
import { FALLBACK_CATEGORIES, FALLBACK_DISTRICTS } from "@/lib/fallbacks";
import NextTopLoader from "nextjs-toploader";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: "Hnaruak Mizoram",
  description: "The most affordable and easiest way to search and post jobs in Mizoram.",
  manifest: "/manifest.json",
  openGraph: {
    title: "Hnaruak Mizoram",
    description: "The most affordable and easiest way to search and post jobs in Mizoram.",
    url: "/",
    siteName: "Hnaruak Mizoram",
    images: [
      {
        url: "/icon-512.png",
        width: 512,
        height: 512,
        alt: "Hnaruak Mizoram Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Hnaruak Mizoram",
    description: "The most affordable and easiest way to search and post jobs in Mizoram.",
    images: ["/icon-512.png"],
  },
};

export const viewport = {
  themeColor: "#1c7dfa",
};

const r2PreconnectUrl = (() => {
  const publicUrl = process.env.R2_PUBLIC_URL;
  if (!publicUrl) {
    return null;
  }

  try {
    return new URL(publicUrl).origin;
  } catch {
    return null;
  }
})();

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const lang = cookieStore.get("lang")?.value || "mz";
  const sessionCookie = cookieStore.get("employer_session")?.value;

  let isLoggedIn = false;
  let logoUrl: string | null = null;

  if (sessionCookie) {
    const payload = await verifyJWT(sessionCookie);
    if (payload && payload.role === "employer") {
      isLoggedIn = true;
      try {
        const employer = await prisma.employer.findUnique({
          where: { id: payload.userId },
          select: { logoUrl: true },
        });
        if (employer) {
          logoUrl = employer.logoUrl;
        }
      } catch (error) {
        console.error("Layout failed to fetch employer session details:", error);
      }
    }
  }

  let categories: any[] = [];
  let districts: any[] = [];

  try {
    const [cats, dists] = await Promise.all([
      getCachedCategories(),
      getCachedDistricts(),
    ]);
    categories = cats;
    districts = dists;
  } catch (error) {
    console.error("Layout failed to fetch categories/districts from database. Using fallbacks.", error);
    categories = FALLBACK_CATEGORIES;
    districts = FALLBACK_DISTRICTS;
  }

  return (
    <html
      lang={lang === "mz" ? "lus" : "en"}
      className={`${plusJakarta.variable} ${inter.variable} h-full antialiased`}
    >
      {/*
        Resource hints — React 19 hoists these <link> tags to <head> automatically.
        • preload manifest.json: starts the fetch in parallel with HTML parse,
          removing it from the critical path chain (was 340 ms penalty).
        • preconnect R2 public host: establishes TCP+TLS early so employer
          logo images on job listing pages load faster.
      */}
      {r2PreconnectUrl && <link rel="preconnect" href={r2PreconnectUrl} />}
      <body className="min-h-full flex flex-col bg-background text-on-background">
        <NextTopLoader color="#1c7dfa" showSpinner={false} height={3} shadow="0 0 10px #1c7dfa,0 0 5px #1c7dfa" />
        <PWARegistration />
        <Ticker lang={lang} />
        <Header
          lang={lang}
          isLoggedIn={isLoggedIn}
          logoUrl={logoUrl}
          categories={categories}
          districts={districts}
        />
        <main className="flex-grow flex-col flex">
          {children}
        </main>
        <Footer lang={lang} />
      </body>
    </html>
  );
}
