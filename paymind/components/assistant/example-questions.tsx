const EXAMPLES = [
  "Who should I target for a second purchase?",
  "Who are my best customers?",
  "Who is at risk?",
  "How much revenue comes from returning customers?",
  "Which customers bought Face Wash but never Serum?",
  "What should I sell my loyal customers next?",
];

export function ExampleQuestions({ onPick }: { onPick: (q: string) => void }) {
  return (
    <div className="grid sm:grid-cols-2 gap-2">
      {EXAMPLES.map((q) => (
        <button
          key={q}
          onClick={() => onPick(q)}
          className="text-left text-sm text-ink-soft border border-border rounded-md px-3.5 py-2.5 hover:border-brand hover:text-ink hover:bg-brand-soft/40 transition-colors"
        >
          {q}
        </button>
      ))}
    </div>
  );
}
