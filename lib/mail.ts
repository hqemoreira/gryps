import { Resend } from "resend";
import { createHash, randomBytes } from "crypto";

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function newOpaqueToken(): string {
  return randomBytes(32).toString("hex");
}

export function appBaseUrl(reqUrl?: string): string {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL.replace(/\/$/, "")}`;
  }
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  if (reqUrl) {
    try {
      const u = new URL(reqUrl);
      return `${u.protocol}//${u.host}`;
    } catch {
      /* fall through */
    }
  }
  return "http://localhost:3000";
}

/** Resend is production-ready only when FROM is on a verified custom domain. */
export function resendDeliveryMode(): "unconfigured" | "test_fallback" | "production" {
  if (!process.env.RESEND_API_KEY) return "unconfigured";
  const from = (process.env.RESEND_FROM ?? "").toLowerCase();
  if (!from || from.includes("resend.dev") || from.includes("onboarding@")) {
    return "test_fallback";
  }
  return "production";
}

export async function sendUnlockEmail(opts: {
  to: string;
  verifyUrl: string;
  locale?: "en" | "fi";
}): Promise<{ ok: true; deliveryMode: "test_fallback" | "production" } | { ok: false; error: string; deliveryMode: ReturnType<typeof resendDeliveryMode> }> {
  const deliveryMode = resendDeliveryMode();
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { ok: false, error: "Email sending is not configured (RESEND_API_KEY).", deliveryMode };
  }

  const from = process.env.RESEND_FROM ?? "GRYPS <onboarding@resend.dev>";
  const fi = opts.locale === "fi";
  const subject = fi
    ? "Vahvista sähköposti — avaa täysi GRYPS-arvio"
    : "Confirm your email — open the full GRYPS assessment";
  const text = fi
    ? [
        "Hei,",
        "",
        "Pyysit täyttä GRYPS Advisor -arviota. Vahvista sähköpostiosoitteesi avataksesi yksityiskohtaisen analyysin:",
        opts.verifyUrl,
        "",
        "Linkki vanhenee 24 tunnissa. Jos et pyytänyt tätä, voit ohittaa viestin.",
        "",
        "— GRYPS",
      ].join("\n")
    : [
        "Hi,",
        "",
        "You asked for the full GRYPS Advisor assessment. Confirm your email to open the detailed analysis:",
        opts.verifyUrl,
        "",
        "This link expires in 24 hours. If you did not request this, you can ignore the message.",
        "",
        "— GRYPS",
      ].join("\n");

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to: opts.to,
      subject,
      text,
    });
    if (error) {
      return {
        ok: false,
        error:
          deliveryMode === "test_fallback"
            ? `${error.message} (RESEND_FROM still on resend.dev — verify a domain and set RESEND_FROM)`
            : error.message,
        deliveryMode,
      };
    }
    return { ok: true, deliveryMode: deliveryMode === "production" ? "production" : "test_fallback" };
  } catch (err) {
    console.error("Resend send failed:", err);
    return { ok: false, error: "Failed to send verification email.", deliveryMode };
  }
}
