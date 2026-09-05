"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { PurchaseHistoryEntry } from "@/lib/customers";

function OrderRow({ order }: { order: PurchaseHistoryEntry }) {
  const [open, setOpen] = useState(false);
  const productLabel = order.items.map((i) => i.productName).join(", ");

  return (
    <li className="relative pl-6">
      <span className="absolute left-0 top-1.5 h-2 w-2 rounded-full bg-brand" />
      <span className="absolute left-[3px] top-4 bottom-0 w-px bg-border" aria-hidden />

      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full text-left flex items-start justify-between gap-3 py-2 group"
        aria-expanded={open}
      >
        <div>
          <div className="text-xs text-ink-faint">{formatDate(order.createdAt)}</div>
          <div className="text-sm text-ink mt-0.5">{productLabel}</div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-sm text-ink font-medium">{formatCurrency(order.totalAmount)}</span>
          <ChevronDown
            className={`h-3.5 w-3.5 text-ink-faint transition-transform ${open ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {open && (
        <div className="mb-3 mt-1 rounded-md border border-border-soft bg-paper p-3 text-xs space-y-1.5">
          <div className="flex justify-between">
            <span className="text-ink-faint">Order ID</span>
            <span className="text-ink font-mono">{order.orderId}</span>
          </div>
          {order.items.map((item, i) => (
            <div key={i} className="flex justify-between">
              <span className="text-ink-faint">
                {item.productName} × {item.quantity}
              </span>
              <span className="text-ink">{formatCurrency(item.price * item.quantity)}</span>
            </div>
          ))}
          <div className="flex justify-between pt-1.5 border-t border-border-soft font-medium">
            <span className="text-ink-soft">Total</span>
            <span className="text-ink">{formatCurrency(order.totalAmount)}</span>
          </div>
          <div className="flex justify-between pt-1.5">
            <span className="text-ink-faint">Payment status</span>
            <Badge tone={order.paymentStatus === "captured" ? "brand" : "neutral"}>
              {order.paymentStatus ?? "unknown"}
            </Badge>
          </div>
          {order.paymentMethod && (
            <div className="flex justify-between">
              <span className="text-ink-faint">Payment method</span>
              <span className="text-ink capitalize">{order.paymentMethod}</span>
            </div>
          )}
          {order.razorpayOrderId && (
            <div className="flex justify-between">
              <span className="text-ink-faint">Razorpay order ID</span>
              <span className="text-ink font-mono">{order.razorpayOrderId}</span>
            </div>
          )}
          {order.razorpayPaymentId && (
            <div className="flex justify-between">
              <span className="text-ink-faint">Razorpay payment ID</span>
              <span className="text-ink font-mono">{order.razorpayPaymentId}</span>
            </div>
          )}
        </div>
      )}
    </li>
  );
}

export function PurchaseTimeline({ orders }: { orders: PurchaseHistoryEntry[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Purchase Journey</CardTitle>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <p className="text-sm text-ink-soft">No purchase history available for this customer.</p>
        ) : (
          <ul className="space-y-0">
            {orders.map((order) => (
              <OrderRow key={order.orderId} order={order} />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
