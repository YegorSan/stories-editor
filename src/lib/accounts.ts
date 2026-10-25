"use client";

import { useEffect } from "react";

const ACCOUNT_KEY = "kadr.ig-accounts";
const ACTIVE_KEY = "kadr.ig-active";

/**
 * Tokens used to live in localStorage. Wipe them on boot so a leftover
 * Graph key cannot sit in the browser after the UI no longer asks for one.
 */
export function wipeLocalIgSecrets(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ACCOUNT_KEY);
  window.localStorage.removeItem(ACTIVE_KEY);
}

export function WipeLocalIgSecrets() {
  useEffect(() => {
    wipeLocalIgSecrets();
  }, []);
  return null;
}
