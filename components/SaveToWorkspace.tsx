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
    noteTeaser: "Local teaser only — email if you want the full report. Not a customer account.",
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
  /** When true, omit the local-storage note (parent toolbar shows one shared note). */
  hideNote = false,
}: {
  inputs: AssessmentInputs;
  result?: AdvisoryResult | null;
  abbreviated?: AbbreviatedAssessment | null;
  lang?: Lang;
  scenarioSlug?: string;
  scenarioLabel?: string;
  hideNote?: boolean;
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
    <div className="gryps-no-print" style={{ display: "contents" }}>
      <button
        type="button"
        onClick={handleSave}
        disabled={!!savedId || (!result && !abbreviated)}
        className="gryps-result-tool-btn"
        style={{
          backgroundColor: savedId ? "rgba(46,212,122,0.12)" : undefined,
          borderColor: savedId ? "rgba(46,212,122,0.35)" : undefined,
          cursor: savedId ? "default" : "pointer",
          color: savedId ? "var(--accent-green)" : undefined,
        }}
      >
        {savedId ? <Check size={13} /> : <BookmarkPlus size={13} />}
        {savedId ? t.saved : t.save}
      </button>
      {savedId && (
        <Link href={`/workspace?id=${savedId}`} className="gryps-result-tool-link">
          {t.open}
        </Link>
      )}
      {!hideNote && (
        <p className="gryps-result-tool-note gryps-result-tool-note--solo">
          {isTeaser ? t.noteTeaser : t.note}
        </p>
      )}
    </div>
  );
}

export function workspaceSaveNote(lang: Lang, isTeaser: boolean) {
  const t = COPY[lang];
  return isTeaser ? t.noteTeaser : t.note;
}
