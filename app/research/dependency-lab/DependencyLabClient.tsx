"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { DependencyResearchLabView } from "@/components/DependencyResearchLabView";
import { isEvidencePackId, type LabScenarioId } from "@/lib/research/evidence-packs";
import { isFixtureId } from "@/lib/research/dependency-fixtures";

function parseLabId(raw: string | null): LabScenarioId | undefined {
  if (!raw) return undefined;
  if (isEvidencePackId(raw) || isFixtureId(raw)) return raw;
  return undefined;
}

function Inner() {
  const params = useSearchParams();
  const fromWorkflow = params.get("from") === "workflow";
  const lab = parseLabId(params.get("lab"));
  const context =
    fromWorkflow || params.get("lat") || params.get("label")
      ? {
          fromWorkflow,
          label: params.get("label") ?? undefined,
          lat: params.get("lat") ?? undefined,
          lng: params.get("lng") ?? undefined,
          sector: params.get("sector") ?? undefined,
          providers: params.get("providers") ?? undefined,
        }
      : undefined;

  return <DependencyResearchLabView initialScenarioId={lab} workflowContext={context} />;
}

export function DependencyLabClient() {
  return (
    <Suspense fallback={<div style={{ minHeight: "40vh", background: "var(--bg)" }} />}>
      <Inner />
    </Suspense>
  );
}
