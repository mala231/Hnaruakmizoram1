"use client";

interface TickerMarqueeProps {
  tickerText: string;
  label: string;
}

export default function TickerMarquee({ tickerText, label }: TickerMarqueeProps) {
  return (
    <div
      className="bg-gradient-to-r from-[#6faaf9] to-[#93c5fd] text-white py-2.5 overflow-hidden select-none fixed bottom-0 left-0 w-full z-50 shadow-[0_-4px_20px_rgba(79,142,247,0.12)]"
      style={{ contain: "layout style" }}
    >
      <div className="max-w-7xl mx-auto px-container-margin-mobile md:px-container-margin-desktop flex items-center gap-4">
        {/* Badge */}
        <span className="flex-shrink-0 bg-white/20 backdrop-blur-sm border border-white/30 text-white px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider shadow-sm">
          {label}
        </span>

        {/* Scrolling wrapper */}
        <div className="relative overflow-hidden w-full h-6 flex items-center">
          <div className="animate-marquee flex gap-0 text-sm font-semibold text-white/95 whitespace-nowrap">
            <span className="whitespace-nowrap">{tickerText}</span>
            <span className="whitespace-nowrap">{tickerText}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
