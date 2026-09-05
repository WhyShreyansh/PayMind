import { AskPaymindChat } from "@/components/assistant/ask-paymind-chat";

export default function AssistantPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif-display text-[26px] text-ink">Ask PayMind</h1>
        <p className="text-ink-soft text-sm mt-1">
          Ask questions about your customers, revenue and retention.
        </p>
      </div>
      <AskPaymindChat />
    </div>
  );
}
