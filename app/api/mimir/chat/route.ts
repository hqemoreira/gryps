import { NextRequest, NextResponse } from "next/server";
import { Mistral } from "@mistralai/mistralai";
import { MIMIR_SYSTEM_PROMPT } from "@/lib/mimir/prompt";
import { formatRetrievalContext, retrieveChunks } from "@/lib/mimir/retrieve";
import { logMimirMessage } from "@/lib/mimir/log";

type ChatMessage = { role: "user" | "assistant"; content: string };

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(req: NextRequest) {
  let body: {
    message?: string;
    sessionId?: string;
    history?: ChatMessage[];
    signatureContext?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const message = (body.message ?? "").trim();
  if (!message || message.length > 2000) {
    return NextResponse.json({ error: "Message required (max 2000 chars)" }, { status: 400 });
  }

  const sessionId =
    typeof body.sessionId === "string" && body.sessionId.length > 0
      ? body.sessionId.slice(0, 64)
      : `anon-${getClientIp(req)}-${Date.now()}`;

  const history = Array.isArray(body.history)
    ? body.history
        .filter(
          (m): m is ChatMessage =>
            !!m &&
            (m.role === "user" || m.role === "assistant") &&
            typeof m.content === "string" &&
            m.content.length < 4000
        )
        .slice(-8)
    : [];

  const signatureContext =
    typeof body.signatureContext === "string" ? body.signatureContext.slice(0, 1500) : "";

  const { chunks, confidence } = retrieveChunks(message);
  const retrievalBlock = formatRetrievalContext(chunks, confidence);

  await logMimirMessage({
    sessionId,
    role: "user",
    content: message,
    retrievalConfidence: confidence,
  });

  const refusal =
    "That's not in my materials — see the Methodology page or contact the GRYPS team.";

  // Deterministic refusal path when retrieval is weak and no API key
  if (confidence === "low" && !process.env.MISTRAL_API_KEY) {
    await logMimirMessage({
      sessionId,
      role: "assistant",
      content: refusal,
      retrievalConfidence: confidence,
    });
    return NextResponse.json({
      reply: refusal,
      sessionId,
      retrievalConfidence: confidence,
      sources: chunks.map((c) => ({ title: c.title, source: c.source })),
    });
  }

  let reply = refusal;

  if (process.env.MISTRAL_API_KEY) {
    try {
      const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });
      const userPayload = [
        retrievalBlock,
        signatureContext ? `\nCURRENT SIGNATURE CONTEXT:\n${signatureContext}` : "",
        `\nUSER QUESTION:\n${message}`,
      ]
        .filter(Boolean)
        .join("\n");

      const response = await client.chat.complete({
        model: "mistral-small-latest",
        messages: [
          { role: "system", content: MIMIR_SYSTEM_PROMPT },
          ...history.map((m) => ({ role: m.role, content: m.content })),
          { role: "user", content: userPayload },
        ],
        temperature: 0.2,
      });
      const text = response.choices?.[0]?.message?.content;
      if (typeof text === "string" && text.trim().length > 0) {
        reply = text.trim();
      } else if (confidence === "low") {
        reply = refusal;
      }
    } catch (err) {
      console.error("[mimir] chat failed:", err);
      reply =
        confidence === "low"
          ? refusal
          : "I could not reach the assistant service just now. Try again, or see the Methodology page.";
    }
  } else if (confidence !== "low" && chunks[0]) {
    // Offline fallback: return the strongest retrieved chunk paraphrased briefly
    reply = `${chunks[0].text} (From ${chunks[0].source}.) Ask another question if you need a different topic.`;
  }

  await logMimirMessage({
    sessionId,
    role: "assistant",
    content: reply,
    retrievalConfidence: confidence,
  });

  return NextResponse.json({
    reply,
    sessionId,
    retrievalConfidence: confidence,
    sources: chunks.map((c) => ({ title: c.title, source: c.source })),
  });
}
