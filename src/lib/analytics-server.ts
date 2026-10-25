import { PostHog } from "posthog-node";

let client: PostHog | null = null;

function getClient(): PostHog | null {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return null;
  if (!client) {
    client = new PostHog(key, {
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://eu.i.posthog.com",
      flushAt: 1,
      flushInterval: 0,
    });
  }
  return client;
}

export async function captureServerEvent(input: {
  distinctId: string;
  event: string;
  properties?: Record<string, unknown>;
}) {
  const ph = getClient();
  if (!ph) return;
  ph.capture({
    distinctId: input.distinctId,
    event: input.event,
    properties: input.properties,
  });
  await ph.flush();
}
