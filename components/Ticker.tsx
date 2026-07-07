import { prisma } from "@/lib/prisma";
import { t } from "@/lib/i18n";
import TickerMarquee from "@/components/TickerMarquee";

interface TickerProps {
  lang: string;
}

const FALLBACK_ITEMS = [
  "New job vacancy available in Aizawl, apply now!",
  "Urgent requirement: Driver and Sales Assistant.",
  "Office Assistant position open.",
  "Computer Operator needed immediately.",
  "Teacher job vacancy announced.",
];

export default async function Ticker({ lang }: TickerProps) {
  let items: string[] = [];

  try {
    const rows = await prisma.tickerItem.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      select: { text: true },
    });
    items = rows.map((r) => r.text);
  } catch {
    // Silently fall back to static items on DB error
  }

  const displayItems = items.length > 0 ? items : FALLBACK_ITEMS;
  const tickerText = displayItems.join("        ✦        ") + "        ✦        ";
  const label = t("home.latest_ticker", lang);

  return <TickerMarquee tickerText={tickerText} label={label} />;
}
