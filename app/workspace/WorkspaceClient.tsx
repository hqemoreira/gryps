"use client";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ResearchWorkspaceView } from "@/components/ResearchWorkspaceView";

function WorkspaceInner() {
  const params = useSearchParams();
  const id = params.get("id");
  return <ResearchWorkspaceView initialId={id} />;
}

export function WorkspaceClient() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", backgroundColor: "var(--bg)" }} />}>
      <WorkspaceInner />
    </Suspense>
  );
}
