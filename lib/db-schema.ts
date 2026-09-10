import { neon, type NeonQueryFunction } from "@neondatabase/serverless"

type Sql = NeonQueryFunction<false, false>

export async function ensureAdvisorSchema(sql: Sql): Promise<void> {
  await sql`
    CREATE TABLE IF NOT EXISTS advisor_submissions (
      id                  SERIAL PRIMARY KEY,
      created_at          TIMESTAMPTZ DEFAULT NOW(),
      input               JSONB NOT NULL,
      output              JSONB NOT NULL,
      email               TEXT,
      autonomy_level      TEXT,
      criticality         TEXT,
      lat                 DOUBLE PRECISION,
      lng                 DOUBLE PRECISION
    )
  `
  await sql`ALTER TABLE advisor_submissions ADD COLUMN IF NOT EXISTS ip TEXT`
  await sql`ALTER TABLE advisor_submissions ADD COLUMN IF NOT EXISTS use_case TEXT`
  await sql`ALTER TABLE advisor_submissions ADD COLUMN IF NOT EXISTS unlocked_at TIMESTAMPTZ`
}

export async function ensureNotifySchema(sql: Sql): Promise<void> {
  await sql`
    CREATE TABLE IF NOT EXISTS notify_requests (
      id              SERIAL PRIMARY KEY,
      created_at      TIMESTAMPTZ DEFAULT NOW(),
      email           TEXT NOT NULL,
      topics          TEXT[],
      submission_id   INTEGER,
      token_hash      TEXT NOT NULL,
      verified_at     TIMESTAMPTZ,
      locale          TEXT,
      intent          TEXT DEFAULT 'unlock'
    )
  `
}

export function getSql() {
  return neon(process.env.NEON_DATABASE_URL!)
}
