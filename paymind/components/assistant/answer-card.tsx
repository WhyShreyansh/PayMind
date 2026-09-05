import { Card, CardContent } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { CustomerStatusBadge } from "@/components/customers/customer-status-badge";
import { formatCurrency, formatNumber } from "@/lib/utils";
import type { AnswerCard as AnswerCardType } from "@/lib/ai/types";
import type { ExtendedLifecycleSegment } from "@/lib/intelligence";
import { ArrowRight, Users } from "lucide-react";

export function AnswerCard({ card }: { card: AnswerCardType }) {
  if (card.type === "metric") {
    return (
      <Card className="mt-2">
        <CardContent className="py-4">
          <div className="text-xs text-ink-soft">{card.label}</div>
          <div className="font-serif-display text-2xl text-ink mt-1">{card.value}</div>
          {card.sub && <div className="text-xs text-ink-faint mt-1">{card.sub}</div>}
        </CardContent>
      </Card>
    );
  }

  if (card.type === "audience") {
    return (
      <Card className="mt-2">
        <CardContent className="py-4">
          <div className="flex items-center gap-1.5 text-xs text-ink-soft">
            <Users className="h-3.5 w-3.5" />
            {card.label}
          </div>
          <div className="font-serif-display text-2xl text-ink mt-1">
            {formatNumber(card.count)} customers
          </div>
          <LinkButton href={card.exploreHref} size="sm" className="mt-3">
            Explore Customers
          </LinkButton>
        </CardContent>
      </Card>
    );
  }

  if (card.type === "customerList") {
    return (
      <Card className="mt-2">
        <CardContent className="py-4">
          <div className="flex items-center gap-1.5 text-xs text-ink-soft">
            <Users className="h-3.5 w-3.5" />
            {card.label}
          </div>
          <div className="font-serif-display text-2xl text-ink mt-1">
            {formatNumber(card.total)} customers
          </div>
          {card.sample.length > 0 && (
            <ul className="mt-3 space-y-1">
              {card.sample.map((c) => (
                <li key={c.id}>
                  <a
                    href={`/customers/${c.id}`}
                    className="text-xs text-ink-soft hover:text-brand hover:underline underline-offset-2"
                  >
                    {c.name} · {formatCurrency(c.totalSpent)} · {c.purchaseCount} purchases
                  </a>
                </li>
              ))}
            </ul>
          )}
          {card.total > card.sample.length && (
            <div className="text-xs text-ink-faint mt-2">
              +{formatNumber(card.total - card.sample.length)} more
            </div>
          )}
          <LinkButton href="/customers" size="sm" className="mt-3">
            Open Customer Explorer
          </LinkButton>
        </CardContent>
      </Card>
    );
  }

  if (card.type === "customer") {
    return (
      <Card className="mt-2">
        <CardContent className="py-4">
          <div className="flex items-center gap-2">
            <span className="text-ink font-medium">{card.name}</span>
            <CustomerStatusBadge status={card.lifecycle as ExtendedLifecycleSegment} />
          </div>
          <div className="flex items-center gap-4 mt-1.5 text-sm text-ink-soft">
            <span>{formatCurrency(card.totalSpent)} spent</span>
            <span>{card.purchaseCount} purchases</span>
          </div>
          <LinkButton href={card.href} size="sm" className="mt-3">
            View Customer
          </LinkButton>
        </CardContent>
      </Card>
    );
  }

  if (card.type === "productAffinity") {
    return (
      <Card className="mt-2">
        <CardContent className="py-4">
          <div className="flex items-center gap-2 text-ink font-medium">
            {card.fromProduct}
            <ArrowRight className="h-3.5 w-3.5 text-ink-faint" />
            {card.toProduct}
          </div>
          <div className="text-sm text-ink-soft mt-1.5">
            {card.conversionRatePct}% of {card.fromProduct} buyers went on to buy{" "}
            {card.toProduct} ({formatNumber(card.coBuyers)} customers)
          </div>
        </CardContent>
      </Card>
    );
  }

  if (card.type === "recommendation") {
    const priorityTone = card.priority === "HIGH" ? "brand" : card.priority === "MEDIUM" ? "amber" : "neutral";
    return (
      <Card className="mt-2">
        <CardContent className="py-4">
          <div className="flex items-center justify-between gap-2">
            <span className="text-ink font-medium">{card.title}</span>
            <span
              className={`text-xs font-medium rounded-full px-2 py-0.5 ${
                priorityTone === "brand"
                  ? "bg-brand-soft text-brand-strong"
                  : priorityTone === "amber"
                  ? "bg-amber-soft text-amber"
                  : "bg-border-soft text-ink-soft"
              }`}
            >
              {card.priority}
            </span>
          </div>
          <div className="font-serif-display text-xl text-ink mt-1.5">
            {formatNumber(card.audienceSize)} customers
          </div>
          <p className="text-sm text-ink-soft mt-1.5 leading-relaxed">{card.reason}</p>
          <div className="flex items-center gap-4 mt-3 text-xs text-ink-faint">
            {card.recommendedProduct && <span>Product: {card.recommendedProduct}</span>}
            <span>Offer: {card.suggestedOffer}</span>
          </div>
          <div className="flex gap-2 mt-3">
            <LinkButton href={card.exploreHref} variant="secondary" size="sm">
              View Customers
            </LinkButton>
            <LinkButton href={card.detailHref} size="sm">
              View Recommendation
            </LinkButton>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}
