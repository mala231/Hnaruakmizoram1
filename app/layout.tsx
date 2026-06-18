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
      const employer = await prisma.employer.findUnique({
        where: { id: payload.userId },
        select: { logoUrl: true },
      });
      if (employer) {
        logoUrl = employer.logoUrl;
      }
    }
  }

  return (
    <html
      lang={lang}
      className={`${plusJakarta.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-on-background">
        <NextTopLoader color="#1c7dfa" showSpinner={false} height={3} shadow="0 0 10px #1c7dfa,0 0 5px #1c7dfa" />
        <PWARegistration />
        <Ticker lang={lang} />
        <Header lang={lang} isLoggedIn={isLoggedIn} logoUrl={logoUrl} />
        <main className="flex-grow flex-col flex">
          {children}
        </main>
        <Footer lang={lang} />
      </body>
    </html>
  );
}
