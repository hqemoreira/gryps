import { NextResponse } from "next/server"
import { resendDeliveryMode } from "@/lib/mail"

export const runtime = "nodejs"

/**
 * Public readiness probe — no secrets.
 * Use after setting RESEND_FROM on a verified domain.
 */
export async function GET() {
  const deliveryMode = resendDeliveryMode()
  return NextResponse.json(
    {
      deliveryMode,
      productionReady: deliveryMode === "production",
      hint:
        deliveryMode === "production"
          ? "RESEND_FROM looks like a custom domain — unlock emails should deliver to arbitrary recipients once DNS is verified."
          : deliveryMode === "test_fallback"
            ? "RESEND_API_KEY is set but RESEND_FROM is missing or still on resend.dev. Run: vercel env add RESEND_FROM production"
            : "RESEND_API_KEY is not configured.",
      docs: "https://resend.com/domains",
      ranAt: new Date().toISOString(),
    },
    { headers: { "Cache-Control": "no-store" } },
  )
}
