"use client";

import { useEffect } from "react";

export function SWRegistration() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((registration) => {
        if (registration.installing) {
          registration.installing.addEventListener("statechange", (event) => {
            if ((event.target as ServiceWorker).state === "activated") {
              navigator.serviceWorker.controller?.postMessage({ type: "SKIP_WAITING" });
            }
          });
        }
      })
      .catch(() => {
        // SW registration failed silently
      });
  }, []);

  return null;
}
