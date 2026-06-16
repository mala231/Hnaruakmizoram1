"use client";

import { useEffect } from "react";

/**
 * Client component to register the PWA service worker.
 */
export default function PWARegistration() {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      process.env.NODE_ENV === "production" // standard practice to only run SW in production to avoid hot-reload interference
    ) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log(
              "[PWA] Service Worker registered with scope:",
              registration.scope
            );
          })
          .catch((error) => {
            console.error("[PWA] Service Worker registration failed:", error);
          });
      });
    }
  }, []);

  return null;
}
