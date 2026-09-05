import { NextResponse } from "next/server";
import { runAssistantTurn, MissingApiKeyError, AssistantTimeoutError, EMPTY_CONTEXT } from "@/lib/ai";
import type { ChatMessage, AssistantContext } from "@/lib/ai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_MESSAGE_LENGTH = 2000;
const MAX_HISTORY = 20;

function isValidMessage(m: unknown): m is ChatMessage {
  if (!m || typeof m !== "object") return false;
  const msg = m as Record<string, unknown>;
  return (
    (msg.role === "user" || msg.role === "assistant") &&
    typeof msg.content === "string" &&
    msg.content.length > 0 &&
    msg.content.length <= MAX_MESSAGE_LENGTH
  );
}

function isValidContext(c: unknown): c is AssistantContext {
  return typeof c === "object" && c !== null;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { messages, context } = (body ?? {}) as {
    messages?: unknown;
    context?: unknown;
  };

  if (!Array.isArray(messages) || messages.length === 0 || !messages.every(isValidMessage)) {
    return NextResponse.json(
      { error: "Provide a non-empty list of valid chat messages." },
      { status: 400 }
    );
  }

  const trimmedHistory = (messages as ChatMessage[]).slice(-MAX_HISTORY);
  const safeContext: AssistantContext = isValidContext(context)
    ? { ...EMPTY_CONTEXT, ...context }
    : EMPTY_CONTEXT;

  try {
    const result = await runAssistantTurn(trimmedHistory, safeContext);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof MissingApiKeyError) {
      return NextResponse.json(
        {
          error:
            "Ask PayMind isn't configured yet — an OpenAI API key needs to be added to the server environment.",
        },
        { status: 503 }
      );
    }
    if (err instanceof AssistantTimeoutError) {
      return NextResponse.json(
        { error: "PayMind took too long to respond. Please try again." },
        { status: 504 }
      );
    }
    // Never leak raw error details (could contain request internals) to the client.
    console.error("Ask PayMind assistant error:", err);
    return NextResponse.json(
      { error: "PayMind couldn't retrieve that information right now. Please try again." },
      { status: 500 }
    );
  }
}
