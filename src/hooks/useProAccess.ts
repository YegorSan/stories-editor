"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { identifyUser } from "@/lib/analytics";

type MeResponse = {
  user: { id: string; email: string; role: string } | null;
  pro: boolean;
  expiresAt: string | null;
  plan: string | null;
};

export function useProAccess() {
  const { data: session, status } = useSession();
  const [pro, setPro] = useState(false);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/me", { cache: "no-store" });
      const data = (await res.json()) as MeResponse;
      setPro(Boolean(data.pro));
      setExpiresAt(data.expiresAt);
      if (data.user?.id) {
        identifyUser(data.user.id, { email: data.user.email, role: data.user.role });
      }
    } catch {
      setPro(false);
      setExpiresAt(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "loading") return;
    void refresh();
  }, [status, session?.user?.id, refresh]);

  return {
    authenticated: status === "authenticated",
    authLoading: status === "loading",
    pro,
    expiresAt,
    loading: status === "loading" || loading,
    refresh,
  };
}
