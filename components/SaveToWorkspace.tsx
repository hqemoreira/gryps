"use client";
import { useState } from "react";
import Link from "next/link";
import { BookmarkPlus, Check } from "lucide-react";
import type { AbbreviatedAssessment } from "@/lib/abbreviate-result";
import type { AdvisoryResult, AssessmentInputs } from "@/lib/resilience-colors";
import { saveResearchAssessment } from "@/lib/research-workspace";

type Lang = "en" | "fi";

const COPY = {
  en: {
    save: "Save to Assessments",
    saved: "Saved",
    open: "Open Assessments →",
    note: "Stored locally in this browser — research modelling, not a customer account.",
    noteTeaser: "Local teaser only — unlock by email for the full report. Not a customer account.",
  },
  fi: {
    save: "Tallenna Arvioihin",
    saved: "Tallennettu",
    open: "Avaa Arviot →",
    note: "Tallennetaan paikallisesti tähän selaimeen — tutkimusmallinnusta, ei asiakastiliä.",
    noteTeaser: "Paikallinen esikatselu — avaa täysi arvio sähköpostilla. Ei asiakastiliä.",
  },
} as const;

export function SaveToWorkspace({
  inputs,
  result,
  abbreviated,
  lang = "en",
  scenarioSlug,
  scenarioLabel,
}: {
  inputs: AssessmentInputs;
  result?: AdvisoryResult | null;
  abbreviated?: AbbreviatedAssessment | null;
  lang?: Lang;
  scenarioSlug?: string;
  scenarioLabel?: string;
}) {
  const t = COPY[lang];
  const [savedId, setSavedId] = useState<string | null>(null);
  const isTeaser = !result && !!abbreviated;

  function handleSave() {
    if (!result && !abbreviated) return;
    const entry = saveResearchAssessment({
      inputs,
      result: result ?? undefined,
      abbreviated: abbreviated ?? undefined,
      scenarioSlug,
      scenarioLabel,
      lang,
    });
    setSavedId(entry.id);
    void import("@/lib/funnel-analytics").then(({ trackFunnelEvent }) => {
      trackFunnelEvent("save_local", { depth: result ? "full" : "abbreviated" });
    });
  }

  return (
    <div
      className="gryps-no-print"
      style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}
    >
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "flex-end" }}>
        <button
          type="button"
          onClick={handleSave}
          disabled={!!savedId || (!result && !abbreviated)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            backgroundColor: savedId ? "rgba(46,212,122,0.12)" : "var(--surface2)",
            border: `1px solid ${savedId ? "rgba(46,212,122,0.35)" : "var(--border2)"}`,
            borderRadius: 6,
            padding: "8px 14px",
            cursor: savedId ? "default" : "pointer",
            fontFamily: "var(--font-ui)",
            fontWeight: 700,
            fontSize: 12,
            color: savedId ? "var(--accent-green)" : "var(--text-muted)",
          }}
        >
          {savedId ? <Check size={13} /> : <BookmarkPlus size={13} />}
          {savedId ? t.saved : t.save}
        </button>
        {savedId && (
          <Link
            href={`/workspace?id=${savedId}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              fontFamily: "var(--font-ui)",
              fontSize: 12,
              fontWeight: 600,
              color: "var(--accent-blue)",
              textDecoration: "none",
              padding: "8px 4px",
            }}
          >
            {t.open}
          </Link>
        )}
      </div>
      <p
        style={{
          fontFamily: "var(--font-ui)",
          fontSize: 10,
          color: "var(--text-dim)",
          textAlign: "right",
          maxWidth: 320,
          lineHeight: 1.4,
        }}
      >
        {isTeaser ? t.noteTeaser : t.note}
      </p>
    </div>
  );
}
