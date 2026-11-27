"use client";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ResearchWorkspaceView } from "@/components/ResearchWorkspaceView";

function WorkspaceInner() {
  const params = useSearchParams();
  const id = params.get("id");
  const modeParam = params.get("mode");
  const fromWorkflow = params.get("from") === "workflow";
  const initialMode =
    modeParam === "compare" ||
    modeParam === "export" ||
    modeParam === "list" ||
    modeParam === "detail"
      ? modeParam
      : undefined;
  return (
    <ResearchWorkspaceView initialId={id} initialMode={initialMode} fromWorkflow={fromWorkflow} />
  );
}

export function WorkspaceClient() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", backgroundColor: "var(--bg)" }} />}>
      <WorkspaceInner />
    </Suspense>
  );
}
