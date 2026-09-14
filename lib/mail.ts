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

export async function sendUnlockEmail(opts: {
  to: string;
  verifyUrl: string;
  locale?: "en" | "fi";
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { ok: false, error: "Email sending is not configured (RESEND_API_KEY)." };
  }

  const from = process.env.RESEND_FROM ?? "GRYPS <onboarding@resend.dev>";
  const fi = opts.locale === "fi";
  const subject = fi
    ? "Vahvista sähköposti — avaa täysi GRYPS-arvio"
    : "Confirm your email — unlock full GRYPS assessment";
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
        "You asked for the full GRYPS Advisor assessment. Confirm your email to unlock the detailed analysis:",
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
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (err) {
    console.error("Resend send failed:", err);
    return { ok: false, error: "Failed to send verification email." };
  }
}
