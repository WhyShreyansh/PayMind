import { MessageCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";

const EXAMPLE_QUESTIONS = [
  "How many customers bought twice?",
  "Who are my best customers?",
  "Who should I target next?",
];

export function AskPaymind() {
  return (
    <Card className="bg-brand text-white border-brand-strong">
      <CardContent className="py-6">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4" strokeWidth={1.75} />
          <span className="text-[15px] font-medium">Ask PayMind</span>
        </div>
        <p className="text-sm text-white/80 mt-2 max-w-md">
          Ask questions about your customers, revenue, and repeat purchases in
          plain language.
        </p>
        <ul className="mt-4 space-y-1.5">
          {EXAMPLE_QUESTIONS.map((q) => (
            <li key={q} className="text-sm text-white/70">
              &ldquo;{q}&rdquo;
            </li>
          ))}
        </ul>
        <LinkButton
          href="/assistant"
          size="sm"
          className="mt-5 bg-white text-brand-strong hover:bg-white/90"
        >
          Ask PayMind
        </LinkButton>
      </CardContent>
    </Card>
  );
}
