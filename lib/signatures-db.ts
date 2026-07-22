import { neon } from "@neondatabase/serverless"
import type { AdvisoryResult } from "@/components/ResilienceOutput"

export type SignatureSiteRow = {
  id: number
  slug: string
  name: string
  lat: number
  lng: number
  sector: string
  autonomy_level: string
  operation_criticality: string
  current_setup: string | null
  output: AdvisoryResult
  last_scored_at: string
}

export async function getAllSites(): Promise<SignatureSiteRow[]> {
  const sql = neon(process.env.NEON_DATABASE_URL!)
  const rows = await sql`SELECT * FROM signature_sites ORDER BY id ASC`
  return rows as SignatureSiteRow[]
}

export async function getSiteBySlug(slug: string): Promise<SignatureSiteRow | null> {
  const sql = neon(process.env.NEON_DATABASE_URL!)
  const rows = await sql`SELECT * FROM signature_sites WHERE slug = ${slug} LIMIT 1`
  return (rows[0] as SignatureSiteRow) ?? null
}
