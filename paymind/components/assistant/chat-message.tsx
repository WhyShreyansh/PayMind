import { Sparkles, User } from "lucide-react";
import { AnswerCard } from "./answer-card";
import type { AnswerCard as AnswerCardType } from "@/lib/ai/types";

export interface DisplayMessage {
  role: "user" | "assistant";
  content: string;
  card?: AnswerCardType | null;
  isError?: boolean;
}

export function ChatMessageBubble({ message }: { message: DisplayMessage }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="h-7 w-7 rounded-full bg-brand text-white flex items-center justify-center shrink-0 mt-0.5">
          <Sparkles className="h-3.5 w-3.5" strokeWidth={1.75} />
        </div>
      )}
      <div className={`max-w-[85%] sm:max-w-[70%] ${isUser ? "order-1" : ""}`}>
        <div
          className={
            isUser
              ? "bg-brand text-white rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm"
              : message.isError
              ? "bg-red-soft text-red rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm"
              : "bg-surface border border-border rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm text-ink"
          }
        >
          {message.content}
        </div>
        {message.card && <AnswerCard card={message.card} />}
      </div>
      {isUser && (
        <div className="h-7 w-7 rounded-full bg-border-soft text-ink-soft flex items-center justify-center shrink-0 mt-0.5">
          <User className="h-3.5 w-3.5" strokeWidth={1.75} />
        </div>
      )}
    </div>
  );
}
