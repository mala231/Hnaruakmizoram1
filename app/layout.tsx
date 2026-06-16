import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";
import Ticker from "@/components/Ticker";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PWARegistration from "@/components/PWARegistration";
import { cookies } from "next/headers";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: "Mizoram Job Board",
  description: "The most affordable and easiest way to search and post jobs in Mizoram.",
  manifest: "/manifest.json",
  openGraph: {
    title: "Mizoram Job Board",
    description: "The most affordable and easiest way to search and post jobs in Mizoram.",
    url: "/",
    siteName: "Mizoram Job Board",
    images: [
      {
        url: "/icon-512.png",
        width: 512,
        height: 512,
        alt: "Mizoram Job Board Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Mizoram Job Board",
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

  return (
    <html
      lang={lang}
      className={`${plusJakarta.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-on-background">
        <PWARegistration />
        <Ticker lang={lang} />
        <Header lang={lang} />
        <main className="flex-grow flex-col flex">
          {children}
        </main>
        <Footer lang={lang} />
      </body>
    </html>
  );
}
