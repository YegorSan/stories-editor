import { createPublicKey, createVerify } from "node:crypto";
import {
  PRO_LABELS,
  PRO_PRICES_UAH,
  uahToKop,
  type ProPlan,
} from "@/lib/commerce";

const DEFAULT_BASE = "https://api.monobank.ua";

export type MonoInvoiceStatus =
  | "created"
  | "processing"
  | "hold"
  | "success"
  | "failure"
  | "reversed"
  | "expired";

export type MonoInvoicePayload = {
  invoiceId: string;
  status: MonoInvoiceStatus;
  amount?: number;
  ccy?: number;
  createdDate?: string;
  modifiedDate?: string;
  failureReason?: string;
  reference?: string;
  pageUrl?: string;
};

function apiBase(): string {
  return (process.env.MONO_API_BASE || DEFAULT_BASE).replace(/\/$/, "");
}

function token(): string {
  const value = process.env.MONO_TOKEN;
  if (!value) {
    throw new Error("MONO_TOKEN is not configured");
  }
  return value;
}

async function monoFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${apiBase()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "X-Token": token(),
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  const text = await res.text();
  let body: unknown = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = { raw: text };
  }

  if (!res.ok) {
    const errMsg =
      typeof body === "object" && body && "errText" in body
        ? String((body as { errText: string }).errText)
        : text || res.statusText;
    throw new Error(`Monobank ${path} failed (${res.status}): ${errMsg}`);
  }

  return body as T;
}

export async function createMonoInvoice(input: {
  plan: ProPlan;
  reference: string;
  redirectUrl: string;
  webHookUrl: string;
  customerEmail: string;
}): Promise<{ invoiceId: string; pageUrl: string }> {
  const amount = uahToKop(PRO_PRICES_UAH[input.plan]);
  const data = await monoFetch<{ invoiceId: string; pageUrl: string }>(
    "/api/merchant/invoice/create",
    {
      method: "POST",
      body: JSON.stringify({
        amount,
        ccy: 980,
        redirectUrl: input.redirectUrl,
        webHookUrl: input.webHookUrl,
        validity: 3600 * 24,
        merchantPaymInfo: {
          reference: input.reference,
          destination: `Kadr Pro — ${PRO_LABELS[input.plan]}`,
          comment: `Kadr Pro (${input.plan}) для ${input.customerEmail}`,
          basketOrder: [
            {
              name: `Kadr Pro — ${PRO_LABELS[input.plan]}`,
              qty: 1,
              sum: amount,
              unit: "шт.",
              code: `kadr-pro-${input.plan.toLowerCase()}`,
            },
          ],
        },
      }),
    },
  );

  if (!data.invoiceId || !data.pageUrl) {
    throw new Error("Monobank did not return invoiceId/pageUrl");
  }
  return data;
}

export async function getMonoInvoiceStatus(invoiceId: string): Promise<MonoInvoicePayload> {
  return monoFetch<MonoInvoicePayload>(
    `/api/merchant/invoice/status?invoiceId=${encodeURIComponent(invoiceId)}`,
  );
}

let cachedPubKey: { pem: string; fetchedAt: number } | null = null;

export async function getMonoPubkeyPem(): Promise<string> {
  const now = Date.now();
  if (cachedPubKey && now - cachedPubKey.fetchedAt < 60 * 60 * 1000) {
    return cachedPubKey.pem;
  }
  const res = await fetch(`${apiBase()}/api/merchant/pubkey`, {
    headers: { "X-Token": token() },
    cache: "no-store",
  });
  const pem = await res.text();
  if (!res.ok || !pem.includes("BEGIN PUBLIC KEY")) {
    throw new Error("Failed to load Monobank public key");
  }
  cachedPubKey = { pem, fetchedAt: now };
  return pem;
}

/** Verify webhook body signature (ECDSA + SHA256, X-Sign is base64). */
export async function verifyMonoWebhookSign(
  rawBody: string,
  xSignBase64: string | null,
): Promise<boolean> {
  if (!xSignBase64) return false;
  try {
    const pem = await getMonoPubkeyPem();
    const key = createPublicKey(pem);
    const verifier = createVerify("SHA256");
    verifier.update(rawBody);
    verifier.end();
    return verifier.verify(key, Buffer.from(xSignBase64, "base64"));
  } catch {
    return false;
  }
}

export function mapMonoStatusToPayment(
  status: MonoInvoiceStatus,
): "CREATED" | "PROCESSING" | "SUCCESS" | "FAILURE" | "EXPIRED" {
  switch (status) {
    case "success":
      return "SUCCESS";
    case "failure":
    case "reversed":
      return "FAILURE";
    case "expired":
      return "EXPIRED";
    case "processing":
    case "hold":
      return "PROCESSING";
    case "created":
    default:
      return "CREATED";
  }
}
