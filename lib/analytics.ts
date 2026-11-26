import posthog from "posthog-js";

/**
 * Captures an analytics event only when PostHog is configured with both env
 * vars; otherwise a silent no-op. Use this instead of calling posthog
 * directly so the config check lives in one place.
 */
export function captureEvent(
  event: string,
  properties?: Record<string, unknown>,
) {
  if (
    process.env.NEXT_PUBLIC_POSTHOG_KEY &&
    process.env.NEXT_PUBLIC_POSTHOG_HOST
  ) {
    posthog.capture(event, properties);
  }
}
