/**
 * Mimir conversation logging — console + optional Neon table when available.
 * Weekly human review of first-month logs is an operational process, not UI.
 */

import { getSql } from "@/lib/db-schema";

export type MimirLogEntry = {
  sessionId: string;
  role: "user" | "assistant" | "system";
  content: string;
  retrievalConfidence?: string;
  createdAt?: string;
};

export async function ensureMimirLogSchema(): Promise<void> {
  if (!process.env.NEON_DATABASE_URL) return;
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS mimir_chat_logs (
      id BIGSERIAL PRIMARY KEY,
      session_id TEXT NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      retrieval_confidence TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}

export async function logMimirMessage(entry: MimirLogEntry): Promise<void> {
  const stamp = entry.createdAt ?? new Date().toISOString();
  console.info(
    "[mimir]",
    stamp,
    entry.sessionId.slice(0, 8),
    entry.role,
    entry.retrievalConfidence ?? "-",
    entry.content.slice(0, 160)
  );

  if (!process.env.NEON_DATABASE_URL) return;

  try {
    await ensureMimirLogSchema();
    const sql = getSql();
    await sql`
      INSERT INTO mimir_chat_logs (session_id, role, content, retrieval_confidence)
      VALUES (
        ${entry.sessionId},
        ${entry.role},
        ${entry.content},
        ${entry.retrievalConfidence ?? null}
      )
    `;
  } catch (err) {
    console.error("[mimir] log persist failed:", err);
  }
}
