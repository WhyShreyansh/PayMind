"use client";

import { useRef, useState } from "react";
import { Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChatMessageBubble, type DisplayMessage } from "./chat-message";
import { ExampleQuestions } from "./example-questions";
import { AssistantLoading } from "./assistant-loading";
import type { AssistantContext, ChatMessage, AssistantApiResponse, AssistantApiError } from "@/lib/ai/types";
import { EMPTY_CONTEXT } from "@/lib/ai/types";

export function AskPaymindChat() {
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [context, setContext] = useState<AssistantContext>(EMPTY_CONTEXT);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  async function send(question: string) {
    const trimmed = question.trim();
    if (!trimmed || loading) return;

    const userMessage: DisplayMessage = { role: "user", content: trimmed };
    const nextDisplay = [...messages, userMessage];
    setMessages(nextDisplay);
    setInput("");
    setLoading(true);

    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    });

    try {
      const history: ChatMessage[] = nextDisplay.map((m) => ({ role: m.role, content: m.content }));
      const res = await fetch("/api/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history, context }),
      });

      const data: AssistantApiResponse | AssistantApiError = await res.json();

      if (!res.ok || "error" in data) {
        const message =
          "error" in data
            ? data.error
            : "PayMind couldn't retrieve that information right now. Please try again.";
        setMessages((prev) => [...prev, { role: "assistant", content: message, isError: true }]);
        return;
      }

      setContext(data.context);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply, card: data.card },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "PayMind couldn't retrieve that information right now. Please try again.",
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
      });
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    send(input);
  }

  const isEmpty = messages.length === 0;

  return (
    <Card className="flex flex-col h-[calc(100vh-220px)] min-h-[420px]">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4">
        {isEmpty ? (
          <div className="h-full flex flex-col justify-center">
            <div className="text-center mb-6">
              <div className="h-10 w-10 rounded-full bg-brand text-white flex items-center justify-center mx-auto mb-3">
                <Sparkles className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <p className="text-sm text-ink-soft">
                Try asking one of these, or type your own question below.
              </p>
            </div>
            <ExampleQuestions onPick={send} />
          </div>
        ) : (
          <>
            {messages.map((m, i) => (
              <ChatMessageBubble key={i} message={m} />
            ))}
            {loading && <AssistantLoading />}
          </>
        )}
      </div>

      <form onSubmit={handleSubmit} className="border-t border-border p-3 flex items-center gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your customers, revenue, or retention..."
          aria-label="Ask PayMind"
          disabled={loading}
          className="flex-1 h-10 rounded-md border border-border bg-surface px-3.5 text-sm text-ink placeholder:text-ink-faint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        />
        <Button type="submit" size="md" disabled={loading || !input.trim()} aria-label="Send">
          <Send className="h-3.5 w-3.5" />
        </Button>
      </form>
    </Card>
  );
}
