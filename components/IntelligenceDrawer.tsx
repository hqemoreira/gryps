"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

export function IntelligenceDrawer({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <button
        type="button"
        className="gryps-drawer-backdrop"
        aria-label="Close"
        onClick={onClose}
      />
      <aside className="gryps-drawer" role="dialog" aria-modal="true" aria-label={title}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 12,
            marginBottom: 16,
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-ui)",
              fontSize: 16,
              fontWeight: 700,
              color: "var(--text)",
              margin: 0,
              lineHeight: 1.35,
            }}
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close drawer"
            style={{
              background: "transparent",
              border: "1px solid var(--border)",
              borderRadius: 6,
              padding: 6,
              cursor: "pointer",
              color: "var(--text-muted)",
              display: "inline-flex",
              flexShrink: 0,
            }}
          >
            <X size={16} />
          </button>
        </div>
        {children}
      </aside>
    </>
  );
}
