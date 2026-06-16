import mzTranslations from "../messages/mz.json";
import enTranslations from "../messages/en.json";

const translationsMap: Record<string, any> = {
  mz: mzTranslations,
  en: enTranslations,
};

/**
 * Accesses Mizo or English translations using dot-notation.
 * Respects the "lang" cookie on the client, or uses the passed "lang" parameter.
 */
export function t(key: string, lang?: string): string {
  let currentLang = lang;

  if (!currentLang) {
    if (typeof window !== "undefined") {
      const match = document.cookie.match(/lang=([^;]+)/);
      currentLang = match ? match[1] : "mz";
    } else {
      currentLang = "mz"; // Default server fallback if not explicitly passed
    }
  }

  if (!translationsMap[currentLang]) {
    currentLang = "mz";
  }

  const keys = key.split(".");
  let current: any = translationsMap[currentLang];

  for (const k of keys) {
    if (current && typeof current === "object" && k in current) {
      current = current[k];
    } else {
      // Fallback to Mizo translation if missing in target language
      if (currentLang !== "mz") {
        return t(key, "mz");
      }
      return key;
    }
  }

  return typeof current === "string" ? current : key;
}
