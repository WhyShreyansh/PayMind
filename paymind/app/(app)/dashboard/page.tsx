import { getDashboardData } from "@/lib/dashboard/get-dashboard-data";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import { PurchaseJourney } from "@/components/dashboard/purchase-journey";
import { RevenueBreakdown } from "@/components/dashboard/revenue-breakdown";
import { LifecycleChart } from "@/components/dashboard/lifecycle-chart";
import { AiInsights } from "@/components/dashboard/ai-insights";
import { SecondPurchaseOpportunity } from "@/components/dashboard/second-purchase-opportunity";
import { AtRiskCustomers } from "@/components/dashboard/at-risk-customers";
import { TopCustomers } from "@/components/dashboard/top-customers";
import { AskPaymind } from "@/components/dashboard/ask-paymind";
import { RecommendedActions } from "@/components/dashboard/recommended-actions";

// Always compute fresh from the database — this is a live operational
// dashboard, not a static page.
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const data = await getDashboardData();
  const atRiskSegment = data.lifecycle.find((s) => s.segment === "AT_RISK");

  return (
    <div>
      <DashboardHeader />

      <KpiCards metrics={data.metrics} />

      <div className="grid lg:grid-cols-2 gap-4 mb-4">
        <PurchaseJourney metrics={data.metrics} />
        <RevenueBreakdown metrics={data.metrics} />
      </div>

      <div className="mb-4">
        <LifecycleChart lifecycle={data.lifecycle} />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-4">
        <AiInsights insights={data.insights} />
        <SecondPurchaseOpportunity
          candidates={data.secondPurchaseCandidates}
          topAffinity={data.topAffinity}
        />
        <AtRiskCustomers
          customers={data.atRiskCustomers}
          totalAtRisk={atRiskSegment?.count ?? 0}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-4">
        <div className="lg:col-span-2">
          <TopCustomers customers={data.topCustomers} />
        </div>
        <AskPaymind />
      </div>

      <div className="mt-4">
        <RecommendedActions recommendations={data.topRecommendations} />
      </div>
    </div>
  );
}
