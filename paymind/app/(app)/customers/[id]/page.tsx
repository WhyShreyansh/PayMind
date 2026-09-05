import { notFound } from "next/navigation";
import { getCustomerDetail } from "@/lib/customers";
import { CustomerProfileHeader } from "@/components/customers/customer-profile-header";
import { CustomerKpiCards } from "@/components/customers/customer-kpi-cards";
import { CustomerBehavior } from "@/components/customers/customer-behavior";
import { PurchaseTimeline } from "@/components/customers/purchase-timeline";
import { ProductHistory } from "@/components/customers/product-history";
import { CustomerMemory } from "@/components/customers/customer-memory";
import { CustomerOpportunity } from "@/components/customers/customer-opportunity";
import { CustomerActions } from "@/components/customers/customer-actions";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CustomerDetailPage({ params }: PageProps) {
  const { id } = await params;
  const detail = await getCustomerDetail(id);

  if (!detail) {
    notFound();
  }

  return (
    <div>
      <CustomerProfileHeader customer={detail.summary} />
      <CustomerKpiCards customer={detail.summary} />

      <div className="mb-4">
        <CustomerActions customer={detail.summary} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mb-4">
        <CustomerBehavior customer={detail.summary} />
        <CustomerOpportunity opportunity={detail.opportunity} />
      </div>

      <div className="mb-4">
        <CustomerMemory memory={detail.memory} />
      </div>

      <div id="purchase-journey" className="mb-4 scroll-mt-4">
        <PurchaseTimeline orders={detail.purchaseHistory} />
      </div>

      <ProductHistory products={detail.productHistory} />
    </div>
  );
}
