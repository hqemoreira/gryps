"use client";
import { useState } from "react";

const COPY = {
  en: {
    heading: "Contact",
    namePlaceholder: "Your name (optional)",
    emailPlaceholder: "your@email.com",
    messagePlaceholder: "Your message…",
    send: "Send message",
    sending: "Sending…",
    success: "Message sent — thank you.",
    error: "Failed to send. Please try again.",
  },
  fi: {
    heading: "Ota yhteyttä",
    namePlaceholder: "Nimesi (valinnainen)",
    emailPlaceholder: "sähköposti@esimerkki.fi",
    messagePlaceholder: "Viestisi…",
    send: "Lähetä viesti",
    sending: "Lähetetään…",
    success: "Viesti lähetetty — kiitos.",
    error: "Lähetys epäonnistui. Yritä uudelleen.",
  },
};

export function ContactForm({ lang = "en" }: { lang?: "en" | "fi" }) {
  const t = COPY[lang];
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !message) return;
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name || undefined, email, message }),
      });
      if (!res.ok) throw new Error();
      setStatus("sent");
      setName("");
      setEmail("");
      setMessage("");
    } catch {
      setStatus("error");
    }
  }

  const inputStyle: React.CSSProperties = {
    backgroundColor: "var(--surface2)",
    border: "1px solid var(--border2)",
    borderRadius: 6,
    padding: "10px 14px",
    fontFamily: "var(--font-data)",
    fontSize: 12,
    color: "var(--text)",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  };

  if (status === "sent") {
    return (
      <div
        style={{
          backgroundColor: "rgba(46,212,122,0.08)",
          border: "1px solid rgba(46,212,122,0.25)",
          borderRadius: 8,
          padding: "16px 20px",
        }}
      >
        <p style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--accent-green)" }}>
          {t.success}
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 16 }}
    >
      <p
        style={{
          fontFamily: "var(--font-data)",
          fontSize: 10,
          color: "var(--text-dim)",
          letterSpacing: "0.1em",
        }}
      >
        {t.heading.toUpperCase()}
      </p>
      <input
        type="text"
        placeholder={t.namePlaceholder}
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={inputStyle}
      />
      <input
        type="email"
        placeholder={t.emailPlaceholder}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        style={inputStyle}
      />
      <textarea
        placeholder={t.messagePlaceholder}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        required
        rows={4}
        style={{ ...inputStyle, resize: "vertical", minHeight: 80 }}
      />
      {status === "error" && (
        <p style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--accent-red)" }}>
          {t.error}
        </p>
      )}
      <button
        type="submit"
        disabled={status === "sending"}
        style={{
          backgroundColor: status === "sending" ? "var(--surface2)" : "#4FA8FF",
          color: status === "sending" ? "var(--text-muted)" : "#070B12",
          border: "none",
          borderRadius: 6,
          padding: "10px 20px",
          fontFamily: "var(--font-ui)",
          fontWeight: 700,
          fontSize: 12,
          cursor: status === "sending" ? "wait" : "pointer",
          alignSelf: "flex-start",
        }}
      >
        {status === "sending" ? t.sending : t.send}
      </button>
    </form>
  );
}
