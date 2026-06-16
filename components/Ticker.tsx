"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { t } from "@/lib/i18n";

interface TickerProps {
  lang: string;
}

export default function Ticker({ lang }: TickerProps) {
  const pathname = usePathname();
  const [items, setItems] = useState<string[]>([]);

  useEffect(() => {
    const fetchTickers = async () => {
      try {
        const res = await fetch("/api/tickers");
        const data = await res.json();
        if (data.success && data.data.length > 0) {
          setItems(data.data.map((item: any) => item.text));
        }
      } catch (err) {
        console.error("Failed to load live tickers", err);
      }
    };
    fetchTickers();
  }, []);

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const mockTickerItems = [
    "New job vacancy available in Aizawl, apply now!",
    "Urgent requirement: Driver and Sales Assistant.",
    "Office Assistant position open.",
    "Computer Operator needed immediately.",
    "Teacher job vacancy announced.",
  ];

  const displayItems = items.length > 0 ? items : mockTickerItems;
  const tickerText = displayItems.join("   ✦   ");

  return (
    <div className="bg-gradient-to-r from-[#6faaf9] to-[#93c5fd] text-white py-2.5 overflow-hidden select-none fixed bottom-0 left-0 w-full z-50 shadow-[0_-4px_20px_rgba(79,142,247,0.12)]">
      <div className="max-w-7xl mx-auto px-container-margin-mobile md:px-container-margin-desktop flex items-center gap-4">
        {/* Badge */}
        <span className="flex-shrink-0 bg-white/20 backdrop-blur-sm border border-white/30 text-white px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider shadow-sm">
          {t("home.latest_ticker", lang)}
        </span>

        {/* Scrolling wrapper */}
        <div className="relative overflow-hidden w-full h-6 flex items-center">
          <div className="animate-marquee flex gap-16 text-sm font-semibold text-white/95 whitespace-nowrap">
            <span className="whitespace-nowrap">{tickerText}</span>
            <span className="whitespace-nowrap">{tickerText}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
