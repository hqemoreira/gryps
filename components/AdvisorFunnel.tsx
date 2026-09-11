"use client"
import { useState } from "react"
import type { AbbreviatedAssessment } from "@/lib/abbreviate-result"
import { gradeColor, gradeTextColor } from "@/lib/resilience-colors"

type Lang = "en" | "fi"

const COPY = {
  en: {
    title: "GRYPS Advisor — Initial Assessment",
    recommended: "Recommended",
    resilience: "Resilience",
    coverage: "Assessment confidence",
    orbital: "Orbital type",
    latency: "Typical orbital-class latency (reference)",
    why: "Model commentary",
    teaser: "This is an abbreviated preview. Unlock the detailed assessment for the evidence chain, provider comparison, risk factors, and methodology behind this Signature.",
    model: "Research prototype · Non-commercial · Model-based analysis",
    confidenceNote: "Confidence reflects confidence in the assessment/data basis, not guaranteed service availability.",
    evidence: "Evidence",
  },
  fi: {
    title: "GRYPS Advisor — Alustava arvio",
    recommended: "Suositus",
    resilience: "Resilienssi",
    coverage: "Arviointiluottamus",
    orbital: "Rataluokka",
    latency: "Tyypillinen rataluokan latenssi (viite)",
    why: "Mallikommentti",
    teaser: "Tämä on lyhennetty esikatselu. Avaa yksityiskohtainen arvio saadaksesi näyttöketjun, toimittajavertailun, riskitekijät ja menetelmän tämän Signaturen taustalla.",
    model: "Tutkimusprototyyppi · Ei-kaupallinen · Mallipohjainen analyysi",
    confidenceNote: "Luottamus kuvaa arvioinnin/dataperustan varmuutta, ei palvelun saatavuustakuuta.",
    evidence: "Näyttö",
  },
} as const

const BAND_FI: Record<string, string> = {
  High: "Korkea",
  Medium: "Keskitaso",
  Low: "Matala",
}

export function InitialAssessment({
  result,
  lang = "en",
}: {
  result: AbbreviatedAssessment
  lang?: Lang
}) {
  const t = COPY[lang]
  const sig = result.resilience_signature
  const rec = result.recommended
  const gc = gradeColor(sig.grade)
  const gtc = gradeTextColor(sig.grade)
  const band = lang === "fi" ? (BAND_FI[rec.confidenceBand] ?? rec.confidenceBand) : rec.confidenceBand

  const rows: { label: string; value: string; emphasize?: boolean }[] = [
    { label: `🥇 ${t.recommended}`, value: rec.provider, emphasize: true },
    { label: t.resilience, value: `${sig.score}/100 · ${sig.grade}` },
    { label: t.coverage, value: `${band} (${rec.confidence}%)` },
    { label: t.orbital, value: rec.orbitalType },
    { label: t.latency, value: rec.latencyEstimate ?? "—" },
  ]

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{
        backgroundColor: "var(--surface)",
        border: `1px solid ${gc}44`,
        borderRadius: 12,
        padding: "24px 28px",
      }}>
        <p style={{
          fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-dim)",
          letterSpacing: "0.1em", marginBottom: 16,
        }}>
          {t.title}
        </p>

        <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 20, flexWrap: "wrap" }}>
          <div style={{ textAlign: "center", flexShrink: 0 }}>
            <div style={{
              fontFamily: "var(--font-data)", fontSize: 56, fontWeight: 900,
              color: gtc, lineHeight: 1, letterSpacing: "-0.04em",
            }}>
              {sig.score}
            </div>
            <div style={{
              fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-dim)",
              letterSpacing: "0.1em", marginTop: 4,
            }}>
              {t.resilience.toUpperCase()}
            </div>
          </div>
          <div style={{ width: 1, height: 48, backgroundColor: "var(--border)", flexShrink: 0 }} className="gryps-signature-divider" />
          <div style={{ flex: 1, minWidth: 160 }}>
            <span style={{
              fontFamily: "var(--font-data)", fontSize: 16, fontWeight: 900, color: gtc,
              border: `1px solid ${gc}55`, borderRadius: 6, padding: "2px 10px",
            }}>
              {sig.grade}
            </span>
            <p style={{
              fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--text-muted)",
              lineHeight: 1.55, marginTop: 10,
            }}>
              {sig.summary}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, borderTop: "1px solid var(--border)", paddingTop: 16 }}>
          {rows.map(row => (
            <div key={row.label} style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "baseline" }}>
              <span style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.06em" }}>
                {row.label}
              </span>
              <span style={{
                fontFamily: "var(--font-ui)", fontSize: 13, fontWeight: row.emphasize ? 700 : 500,
                color: row.emphasize ? "var(--accent-blue)" : "var(--text)", textAlign: "right",
              }}>
                {row.value}
              </span>
            </div>
          ))}
        </div>

        <div style={{
          marginTop: 16, padding: "12px 14px",
          backgroundColor: "rgba(79,168,255,0.06)", border: "1px solid rgba(79,168,255,0.18)",
          borderRadius: 8,
        }}>
          <p style={{
            fontFamily: "var(--font-data)", fontSize: 9, color: "var(--accent-blue)",
            letterSpacing: "0.1em", marginBottom: 6,
          }}>
            {t.why}
          </p>
          <p style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--text)", lineHeight: 1.6 }}>
            {rec.why}
          </p>
        </div>

        {rec.best_if?.[0] && (
          <div style={{
            marginTop: 12, padding: "10px 12px",
            backgroundColor: "var(--surface2)", border: "1px solid var(--border)",
            borderRadius: 8,
          }}>
            <p style={{ fontFamily: "var(--font-data)", fontSize: 9, color: "var(--text-dim)", letterSpacing: "0.08em", marginBottom: 4 }}>
              {lang === "fi" ? "Paras jos…" : "Best if…"}
            </p>
            <p style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--text-muted)", lineHeight: 1.55 }}>
              <span style={{ fontWeight: 700, color: "var(--accent-blue)" }}>{rec.best_if[0].provider}</span>
              {" — "}
              {rec.best_if[0].condition}
            </p>
          </div>
        )}

        {(result.evidence_theme || result.methodology_blurb) && (
          <div style={{
            marginTop: 12, padding: "10px 12px",
            backgroundColor: "rgba(34,211,238,0.06)", border: "1px solid rgba(34,211,238,0.2)",
            borderRadius: 8,
          }}>
            <p style={{ fontFamily: "var(--font-data)", fontSize: 9, color: "var(--accent-cyan)", letterSpacing: "0.08em", marginBottom: 4 }}>
              {t.evidence}
            </p>
            {result.evidence_theme && (
              <p style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--text)", marginBottom: 4 }}>
                {result.evidence_theme}
                {result.evidence_confidence
                  ? ` · ${result.evidence_confidence.band} (${result.evidence_confidence.score}%)`
                  : ""}
              </p>
            )}
            {result.methodology_blurb && (
              <p style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--text-muted)", lineHeight: 1.55 }}>
                {result.methodology_blurb}
              </p>
            )}
          </div>
        )}
      </div>

      <p style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--text-muted)", lineHeight: 1.55 }}>
        {t.teaser}
      </p>
      <p style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--text-dim)", lineHeight: 1.5, textAlign: "center" }}>
        {t.confidenceNote}
      </p>
      <p style={{ fontFamily: "var(--font-data)", fontSize: 9, color: "var(--text-dim)", letterSpacing: "0.06em", textAlign: "center" }}>
        {t.model}
      </p>
    </div>
  )
}

export function UnlockFullAssessment({
  submissionId,
  lang = "en",
}: {
  submissionId: number | null
  lang?: Lang
}) {
  const [email, setEmail] = useState("")
  const [topics, setTopics] = useState<string[]>(["full_assessment"])
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle")
  const [error, setError] = useState("")
  const [verifyUrl, setVerifyUrl] = useState<string | null>(null)
  const [emailSent, setEmailSent] = useState(true)

  const t = lang === "fi" ? {
    headline: "Haluatko yksityiskohtaisen arvion?",
    body: "Avaa yksityiskohtainen GRYPS-analyysi: toimittajavertailu, riskitekijät, redundanssivaihtoehdot ja Signaturen tausta.",
    placeholder: "sähköposti@esimerkki.fi",
    submit: "Avaa yksityiskohtainen arvio",
    sending: "Lähetetään…",
    success: "Tarkista sähköpostisi — vahvistuslinkki avaa yksityiskohtaisen arvion.",
    successManual: "Sähköpostia ei voitu lähettää (Resend-rajoitus). Avaa vahvistuslinkki alla:",
    openLink: "Avaa yksityiskohtainen arvio",
    footnote: "Ei tiliä tarvita. Lähetämme vain vahvistuslinkin.",
    topicFull: "Yksityiskohtainen arvio tälle kohteelle",
    topicReports: "Ilmoitus, kun täydet raportit julkaistaan",
    topicMonitor: "Päivitykset / seuranta myöhemmin",
    needId: "Arviota ei voitu tallentaa — yritä luoda Signature uudelleen.",
    needEmail: "Sähköposti vaaditaan yksityiskohtaisen arvion avaamiseen.",
  } : {
    headline: "Unlock the detailed assessment",
    body: "Get the full provider comparison, risk factors, redundancy options, and evidence behind this Signature.",
    placeholder: "your@email.com",
    submit: "Unlock detailed assessment",
    sending: "Sending…",
    success: "Check your email — the confirmation link unlocks the detailed assessment.",
    successManual: "Email could not be sent (Resend domain/test limit). Open the confirmation link below:",
    openLink: "Open detailed assessment",
    footnote: "No account required. We only send a confirmation link.",
    topicFull: "Detailed assessment for this site",
    topicReports: "Notify when full reports launch",
    topicMonitor: "Updates / monitoring later",
    needId: "Assessment was not saved — try generating a Signature again.",
    needEmail: "Email is required to unlock the detailed assessment.",
  }

  const topicOptions = [
    { id: "full_assessment", label: t.topicFull },
    { id: "reports_launch", label: t.topicReports },
    { id: "monitoring", label: t.topicMonitor },
  ]

  function toggleTopic(id: string) {
    setTopics(prev => {
      if (prev.includes(id)) {
        const next = prev.filter(x => x !== id)
        return next.length ? next : ["full_assessment"]
      }
      return [...prev, id]
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) {
      setError(t.needEmail)
      return
    }
    if (!submissionId) {
      setError(t.needId)
      setStatus("error")
      return
    }
    setStatus("sending")
    setError("")
    setVerifyUrl(null)
    setEmailSent(true)
    try {
      const res = await fetch("/api/advise/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId,
          email: email.trim(),
          locale: lang,
          topics,
          intent: "unlock",
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Request failed")
      if (data.alreadyUnlocked) {
        window.location.href = `/?sid=${submissionId}&unlocked=1#advisor`
        return
      }
      const link = (data.verifyUrl ?? data.devVerifyUrl) as string | undefined
      if (link) setVerifyUrl(link)
      setEmailSent(data.emailSent !== false || !link)
      setStatus("sent")
    } catch (err) {
      setStatus("error")
      setError(err instanceof Error ? err.message : "Request failed")
    }
  }

  if (status === "sent") {
    return (
      <div style={{
        backgroundColor: "rgba(46,212,122,0.06)", border: "1px solid rgba(46,212,122,0.2)",
        borderRadius: 8, padding: "18px 20px",
      }}>
        <p style={{ fontFamily: "var(--font-ui)", fontSize: 14, color: "var(--accent-green)", lineHeight: 1.55 }}>
          {emailSent && !verifyUrl ? t.success : t.successManual}
        </p>
        {verifyUrl && (
          <a
            href={verifyUrl}
            style={{
              display: "inline-flex", marginTop: 14, padding: "10px 16px", minHeight: 44,
              alignItems: "center", borderRadius: 6, textDecoration: "none",
              background: "var(--cta-gradient)", color: "#070B12",
              fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 13,
            }}
          >
            {t.openLink}
          </a>
        )}
      </div>
    )
  }

  return (
    <div className="gryps-no-print" style={{
      backgroundColor: "rgba(79,168,255,0.04)", border: "1px solid rgba(79,168,255,0.2)",
      borderRadius: 10, padding: "20px 22px",
    }}>
      <p style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 16, color: "var(--text)", marginBottom: 8 }}>
        {t.headline}
      </p>
      <p style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--text-muted)", lineHeight: 1.55, marginBottom: 14 }}>
        {t.body}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
        {topicOptions.map(opt => {
          const on = topics.includes(opt.id)
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => toggleTopic(opt.id)}
              style={{
                textAlign: "left",
                fontFamily: "var(--font-ui)", fontSize: 12,
                padding: "10px 12px", minHeight: 44, borderRadius: 6, cursor: "pointer",
                border: on ? "1px solid var(--accent-blue)" : "1px solid var(--border2)",
                backgroundColor: on ? "rgba(79,168,255,0.12)" : "var(--surface2)",
                color: on ? "var(--accent-blue)" : "var(--text-muted)",
              }}
            >
              {opt.label}
            </button>
          )
        })}
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <input
          type="email"
          required
          autoComplete="email"
          placeholder={t.placeholder}
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={{
            backgroundColor: "var(--surface2)", border: "1px solid var(--border2)",
            borderRadius: 6, padding: "12px 14px", minHeight: 48,
            fontFamily: "var(--font-data)", fontSize: 15, color: "var(--text)", outline: "none",
          }}
        />
        <button
          type="submit"
          disabled={status === "sending" || !submissionId}
          className="gryps-cta-btn"
          style={{
            width: "100%",
            opacity: !submissionId ? 0.5 : 1,
            background: status === "sending" ? "var(--surface2)" : "var(--cta-gradient)",
            color: status === "sending" ? "var(--text-muted)" : "#070B12",
          }}
        >
          {status === "sending" ? t.sending : t.submit}
        </button>
      </form>
      {(status === "error" || error) && (
        <p style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--accent-red)", marginTop: 8 }}>{error}</p>
      )}
      <p style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--text-dim)", marginTop: 10 }}>
        {t.footnote}
      </p>
    </div>
  )
}

export function HelpImproveGryps({
  submissionId,
  lang = "en",
  initialUseCase,
}: {
  submissionId: number | null
  lang?: Lang
  initialUseCase?: string | null
}) {
  const [selected, setSelected] = useState<string | null>(initialUseCase ?? null)
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle")

  const t = lang === "fi" ? {
    title: "Auta parantamaan GRYPS:iä",
    sub: "Valitse käyttötapaus — ei henkilötietoja, ei sähköpostia.",
    saved: "Kiitos — tallennettu.",
  } : {
    title: "Help improve GRYPS",
    sub: "Pick a use case — no personal data, no email.",
    saved: "Thanks — saved.",
  }

  const chips = [
    { id: "forestry", label: lang === "fi" ? "Metsätalous" : "Forestry" },
    { id: "mining", label: lang === "fi" ? "Kaivostoiminta" : "Mining" },
    { id: "maritime", label: lang === "fi" ? "Meriliikenne" : "Maritime" },
    { id: "arctic", label: lang === "fi" ? "Arktinen" : "Arctic" },
    { id: "energy", label: lang === "fi" ? "Energia" : "Energy" },
    { id: "other", label: lang === "fi" ? "Muu" : "Other" },
  ]

  async function pick(id: string) {
    if (!submissionId || status === "saving") return
    setSelected(id)
    setStatus("saving")
    try {
      const res = await fetch("/api/advise/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId, useCase: id }),
      })
      if (!res.ok) throw new Error()
      setStatus("saved")
    } catch {
      setStatus("error")
    }
  }

  return (
    <div className="gryps-no-print" style={{
      border: "1px solid var(--border)", borderRadius: 8, padding: "16px 18px",
      backgroundColor: "var(--surface)",
    }}>
      <p style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 13, color: "var(--text)", marginBottom: 4 }}>
        {t.title}
      </p>
      <p style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--text-muted)", marginBottom: 12, lineHeight: 1.5 }}>
        {t.sub}
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {chips.map(c => {
          const on = selected === c.id
          return (
            <button
              key={c.id}
              type="button"
              disabled={!submissionId || status === "saving"}
              onClick={() => pick(c.id)}
              style={{
                fontFamily: "var(--font-data)", fontSize: 11, letterSpacing: "0.04em",
                padding: "10px 14px", minHeight: 44, borderRadius: "var(--radius)",
                cursor: submissionId ? "pointer" : "not-allowed",
                border: on ? "1px solid var(--accent-cyan)" : "1px solid var(--border2)",
                backgroundColor: on ? "rgba(110,231,249,0.12)" : "var(--surface2)",
                color: on ? "var(--accent-cyan)" : "var(--text-muted)",
              }}
            >
              {c.label}
            </button>
          )
        })}
      </div>
      {status === "saved" && (
        <p style={{ fontFamily: "var(--font-data)", fontSize: 10, color: "var(--accent-green)", marginTop: 10 }}>{t.saved}</p>
      )}
    </div>
  )
}
