/** Non-identifying Advisor funnel events for Vercel Analytics. Never pass email or PII. */

import { track } from "@vercel/analytics"

export type FunnelEvent =
  | "advise_run"
  | "unlock_request"
  | "unlock_verify"
  | "use_case_pick"
  | "save_local"

export function trackFunnelEvent(
  name: FunnelEvent,
  props?: Record<string, string | number | boolean | null | undefined>,
): void {
  try {
    const clean: Record<string, string | number | boolean> = {}
    if (props) {
      for (const [k, v] of Object.entries(props)) {
        if (v === undefined || v === null) continue
        // Guard against accidental PII keys
        if (/email|token|name|phone/i.test(k)) continue
        clean[k] = v
      }
    }
    track(name, clean)
  } catch {
    /* analytics must never break the product */
  }
}
