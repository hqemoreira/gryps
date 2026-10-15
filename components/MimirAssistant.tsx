"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  MIMIR_CHROME,
  MIMIR_DISCLOSURE_EN,
  MIMIR_DISCLOSURE_FI,
  MIMIR_OPENING_DOCS_EN,
  MIMIR_OPENING_DOCS_FI,
  MIMIR_OPENING_EN,
  MIMIR_OPENING_FI,
} from "@/lib/mimir/prompt";
import { type MimirChip } from "@/lib/mimir/signature-context";
import { MimirMark } from "@/components/MimirMark";

type Msg = { role: "user" | "assistant"; content: string };

type Props = {
  lang?: "en" | "fi";
  /** Optional Signature summary for grounded explanations */
  signatureContext?: string;
  /** Proactive chips when a Signature is in context */
  chips?: MimirChip[];
  /** Docs pages: methodology / data sources / library Q&A framing */
  variant?: "default" | "docs";
};

function newSessionId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `mimir-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function MimirAssistant({
  lang = "en",
  signatureContext,
  chips = [],
  variant = "default",
}: Props) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const listRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  const chrome = MIMIR_CHROME[lang];
  const opening =
    variant === "docs"
      ? lang === "fi"
        ? MIMIR_OPENING_DOCS_FI
        : MIMIR_OPENING_DOCS_EN
      : lang === "fi"
        ? MIMIR_OPENING_FI
        : MIMIR_OPENING_EN;
  const disclosure = lang === "fi" ? MIMIR_DISCLOSURE_FI : MIMIR_DISCLOSURE_EN;
  const showChips = Boolean(signatureContext) && chips.length > 0;
  const onlyOpening = messages.length === 1 && messages[0]?.role === "assistant";

  useEffect(() => {
    setSessionId(newSessionId());
    setMessages([{ role: "assistant", content: opening }]);
  }, [opening]);

  useEffect(() => {
    if (!open) return;
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open, busy]);

  async function sendText(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    setInput("");
    const nextHistory = [...messages, { role: "user" as const, content: trimmed }];
    setMessages(nextHistory);
    setBusy(true);
    try {
      const res = await fetch("/api/mimir/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
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
      setMessages((prev) => [...prev, { role: "assistant", content: chrome.error }]);
      console.error(err);
    } finally {
      setBusy(false);
    }
  }

  async function send() {
    await sendText(input);
  }

  return (
    <div className="gryps-mimir-dock gryps-no-print">
      {open && (
        <div
          role="dialog"
          aria-modal="false"
          aria-labelledby={titleId}
          className="gryps-mimir-dialog"
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
            <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
              <span style={{ color: "var(--accent-cyan)", display: "flex", flexShrink: 0 }}>
                <MimirMark size={28} title="Mimir" />
              </span>
              <div style={{ minWidth: 0 }}>
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
                  {chrome.title}
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
                  {chrome.subtitle}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={chrome.close}
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
            {onlyOpening && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                  padding: "12px 8px 4px",
                  color: "var(--accent-cyan)",
                }}
              >
                <MimirMark size={40} />
                {showChips && (
                  <p
                    style={{
                      fontFamily: "var(--font-ui)",
                      fontSize: 11,
                      color: "var(--text-dim)",
                      margin: 0,
                      textAlign: "center",
                    }}
                  >
                    {chrome.emptyHint}
                  </p>
                )}
              </div>
            )}

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

            {showChips && onlyOpening && !busy && (
              <div className="gryps-mimir-chips">
                {chips.map((chip) => (
                  <button
                    key={chip.id}
                    type="button"
                    className="gryps-mimir-chip"
                    onClick={() => void sendText(lang === "fi" ? chip.fi : chip.en)}
                  >
                    {lang === "fi" ? chip.fi : chip.en}
                  </button>
                ))}
              </div>
            )}

            {busy && (
              <p
                style={{
                  fontFamily: "var(--font-data)",
                  fontSize: 10,
                  color: "var(--text-dim)",
                }}
              >
                {chrome.thinking}
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
              placeholder={chrome.placeholder}
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
              {chrome.send}
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        className="gryps-mimir-fab"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={titleId}
        aria-label={chrome.title}
      >
        <MimirMark size={18} />
        <span className="gryps-mimir-fab-label">{chrome.title}</span>
      </button>
    </div>
  );
}
