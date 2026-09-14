export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { ensureAdvisorSchema, ensureNotifySchema, getSql } from "@/lib/db-schema";
import { appBaseUrl, hashToken } from "@/lib/mail";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token")?.trim() ?? "";
  if (!token || token.length < 16) {
    return NextResponse.redirect(new URL("/?unlock=invalid#advisor", appBaseUrl(req.url)));
  }

  const tokenHash = hashToken(token);
  const sql = getSql();

  try {
    await ensureAdvisorSchema(sql);
    await ensureNotifySchema(sql);
  } catch (err) {
    console.error("Schema setup failed:", err);
    return NextResponse.redirect(new URL("/?unlock=error#advisor", appBaseUrl(req.url)));
  }

  try {
    const rows = await sql`
      SELECT id, submission_id, verified_at, created_at
      FROM notify_requests
      WHERE token_hash = ${tokenHash}
      LIMIT 1
    `;
    const row = rows[0];
    if (!row) {
      return NextResponse.redirect(new URL("/?unlock=invalid#advisor", appBaseUrl(req.url)));
    }

    const created = row.created_at ? new Date(row.created_at as string) : null;
    if (created && Date.now() - created.getTime() > 24 * 60 * 60 * 1000 && !row.verified_at) {
      return NextResponse.redirect(new URL("/?unlock=expired#advisor", appBaseUrl(req.url)));
    }

    if (!row.verified_at) {
      await sql`
        UPDATE notify_requests SET verified_at = NOW() WHERE id = ${row.id as number}
      `;
    }

    const submissionId = row.submission_id as number | null;
    if (submissionId) {
      await sql`
        UPDATE advisor_submissions
        SET unlocked_at = COALESCE(unlocked_at, NOW())
        WHERE id = ${submissionId}
      `;
      const dest = new URL(`/?sid=${submissionId}&unlocked=1#advisor`, appBaseUrl(req.url));
      return NextResponse.redirect(dest);
    }

    return NextResponse.redirect(new URL("/?unlock=ok#advisor", appBaseUrl(req.url)));
  } catch (err) {
    console.error("Verify failed:", err);
    return NextResponse.redirect(new URL("/?unlock=error#advisor", appBaseUrl(req.url)));
  }
}
