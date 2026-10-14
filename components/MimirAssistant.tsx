"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  MIMIR_DISCLOSURE_EN,
  MIMIR_DISCLOSURE_FI,
  MIMIR_OPENING_EN,
  MIMIR_OPENING_FI,
} from "@/lib/mimir/prompt";

type Msg = { role: "user" | "assistant"; content: string };

type Props = {
  lang?: "en" | "fi";
  /** Optional Signature summary for grounded explanations */
  signatureContext?: string;
};

function newSessionId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `mimir-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function MimirAssistant({ lang = "en", signatureContext }: Props) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const listRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  const opening = lang === "fi" ? MIMIR_OPENING_FI : MIMIR_OPENING_EN;
  const disclosure = lang === "fi" ? MIMIR_DISCLOSURE_FI : MIMIR_DISCLOSURE_EN;

  useEffect(() => {
    setSessionId(newSessionId());
    setMessages([{ role: "assistant", content: opening }]);
  }, [opening]);

  useEffect(() => {
    if (!open) return;
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open, busy]);

  async function send() {
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    const nextHistory = [...messages, { role: "user" as const, content: text }];
    setMessages(nextHistory);
    setBusy(true);
    try {
      const res = await fetch("/api/mimir/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          sessionId,
          history: nextHistory.slice(-8),
          signatureContext,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Chat failed");
      if (typeof data.sessionId === "string") setSessionId(data.sessionId);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: String(data.reply ?? "") },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            lang === "fi"
              ? "Yhteys Mimiriin epäonnistui. Katso Methodology-sivu tai yritä uudelleen."
              : "Could not reach Mimir. See the Methodology page or try again.",
        },
      ]);
      console.error(err);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="gryps-no-print" style={{ position: "fixed", right: 20, bottom: 20, zIndex: 60 }}>
      {open && (
        <div
          role="dialog"
          aria-modal="false"
          aria-labelledby={titleId}
          style={{
            width: "min(380px, calc(100vw - 32px))",
            height: "min(520px, calc(100vh - 100px))",
            backgroundColor: "var(--surface)",
            border: "1px solid var(--border2)",
            borderRadius: 12,
            boxShadow: "0 12px 40px rgba(0,0,0,0.35)",
            display: "flex",
            flexDirection: "column",
            marginBottom: 12,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "12px 14px",
              borderBottom: "1px solid var(--border)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 8,
            }}
          >
            <div>
              <p
                id={titleId}
                style={{
                  fontFamily: "var(--font-ui)",
                  fontWeight: 700,
                  fontSize: 14,
                  color: "var(--text)",
                  margin: 0,
                }}
              >
                Ask Mimir
              </p>
              <p
                style={{
                  fontFamily: "var(--font-data)",
                  fontSize: 9,
                  color: "var(--text-dim)",
                  letterSpacing: "0.06em",
                  margin: "4px 0 0",
                }}
              >
                AI ASSISTANT · NOT THE SCORING MODEL
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={lang === "fi" ? "Sulje" : "Close"}
              style={{
                background: "none",
                border: "1px solid var(--border)",
                borderRadius: 6,
                color: "var(--text-muted)",
                cursor: "pointer",
                padding: "4px 8px",
                fontFamily: "var(--font-ui)",
                fontSize: 12,
              }}
            >
              ✕
            </button>
          </div>

          <p
            style={{
              fontFamily: "var(--font-ui)",
              fontSize: 11,
              color: "var(--text-dim)",
              lineHeight: 1.45,
              padding: "10px 14px",
              borderBottom: "1px solid var(--border)",
              margin: 0,
              backgroundColor: "var(--surface2)",
            }}
          >
            {disclosure}
          </p>

          <div
            ref={listRef}
            style={{
              flex: 1,
              overflowY: "auto",
              padding: 14,
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            {messages.map((m, i) => (
              <div
                key={`${m.role}-${i}`}
                style={{
                  alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                  maxWidth: "92%",
                  backgroundColor:
                    m.role === "user" ? "rgba(34,211,238,0.12)" : "var(--surface2)",
                  border: `1px solid ${m.role === "user" ? "rgba(34,211,238,0.35)" : "var(--border)"}`,
                  borderRadius: 10,
                  padding: "8px 12px",
                  fontFamily: "var(--font-ui)",
                  fontSize: 13,
                  color: "var(--text)",
                  lineHeight: 1.55,
                  whiteSpace: "pre-wrap",
                }}
              >
                {m.content}
              </div>
            ))}
            {busy && (
              <p
                style={{
                  fontFamily: "var(--font-data)",
                  fontSize: 10,
                  color: "var(--text-dim)",
                }}
              >
                {lang === "fi" ? "Mimir miettii…" : "Mimir is thinking…"}
              </p>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void send();
            }}
            style={{
              display: "flex",
              gap: 8,
              padding: 12,
              borderTop: "1px solid var(--border)",
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                lang === "fi" ? "Kysy pisteistä tai menetelmästä…" : "Ask about scores or methodology…"
              }
              disabled={busy}
              style={{
                flex: 1,
                backgroundColor: "var(--surface2)",
                border: "1px solid var(--border2)",
                borderRadius: 8,
                padding: "10px 12px",
                fontFamily: "var(--font-ui)",
                fontSize: 13,
                color: "var(--text)",
                outline: "none",
              }}
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              style={{
                backgroundColor: "var(--accent-cyan)",
                color: "#070B12",
                border: "none",
                borderRadius: 8,
                padding: "0 14px",
                fontFamily: "var(--font-ui)",
                fontWeight: 700,
                fontSize: 12,
                cursor: busy || !input.trim() ? "not-allowed" : "pointer",
                opacity: busy || !input.trim() ? 0.5 : 1,
              }}
            >
              {lang === "fi" ? "Lähetä" : "Send"}
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={titleId}
        style={{
          marginLeft: "auto",
          display: "flex",
          alignItems: "center",
          gap: 8,
          backgroundColor: "var(--surface)",
          border: "1px solid var(--accent-cyan)",
          color: "var(--accent-cyan)",
          borderRadius: 999,
          padding: "12px 18px",
          fontFamily: "var(--font-ui)",
          fontWeight: 700,
          fontSize: 13,
          cursor: "pointer",
          boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
        }}
      >
        Ask Mimir
      </button>
    </div>
  );
}
