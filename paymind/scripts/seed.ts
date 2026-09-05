/**
 * PayMind seed script — generates realistic demo data for the
 * fictional GlowSkin D2C skincare brand.
 *
 * Usage:
 *   DATABASE_URL=postgres://... npx tsx scripts/seed.ts
 *   npx tsx scripts/seed.ts --reset     # wipes existing rows first
 *
 * Design goals (not pure randomness):
 *  - Purchase-count distribution is shaped, not uniform, so the
 *    lifecycle segments (NEW / SECOND_PURCHASE / REPEAT / LOYAL /
 *    AT_RISK / CHURNED) all end up meaningfully populated.
 *  - Product sequencing follows an affinity chain (e.g. Face Wash →
 *    Serum → Moisturizer) so the cross-sell recommendation demo
 *    ("Face Wash buyers who never bought Serum") has real signal.
 *  - A slice of repeat customers get an artificially stretched gap
 *    since their last order, so AT_RISK / CHURNED customers exist
 *    in the dataset by construction, not by chance.
 */

import { Pool } from "pg";
import { faker } from "@faker-js/faker";
import "dotenv/config";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("Missing DATABASE_URL environment variable.");
  process.exit(1);
}

const RESET = process.argv.includes("--reset");

const pool = new Pool({ connectionString: DATABASE_URL });

const TOTAL_CUSTOMERS = 2000;
const NOW = new Date();

// ---------------------------------------------------------------------
// 1. Product catalog (15 products, GlowSkin brand)
// ---------------------------------------------------------------------
type SeedProduct = {
  name: string;
  category: string;
  price: number;
};

const PRODUCTS: SeedProduct[] = [
  { name: "Face Wash", category: "Cleanser", price: 499 },
  { name: "Foaming Cleanser", category: "Cleanser", price: 449 },
  { name: "Cleansing Oil", category: "Cleanser", price: 599 },
  { name: "Hydrating Toner", category: "Toner", price: 399 },
  { name: "Serum", category: "Serum", price: 999 },
  { name: "Vitamin C Serum", category: "Serum", price: 999 },
  { name: "Niacinamide Serum", category: "Serum", price: 899 },
  { name: "Moisturizer", category: "Moisturizer", price: 799 },
  { name: "Night Repair Cream", category: "Moisturizer", price: 899 },
  { name: "Sunscreen", category: "Sun Care", price: 699 },
  { name: "Under Eye Cream", category: "Eye Care", price: 649 },
  { name: "Lip Balm", category: "Lip Care", price: 199 },
  { name: "Clay Face Mask", category: "Mask", price: 549 },
  { name: "Body Lotion", category: "Body Care", price: 449 },
  { name: "Premium Skincare Kit", category: "Kit", price: 2499 },
];

// Which products a customer is likely to buy FIRST.
const ENTRY_WEIGHTS: Record<string, number> = {
  "Face Wash": 30,
  Sunscreen: 18,
  Serum: 12,
  "Vitamin C Serum": 8,
  "Lip Balm": 8,
  Moisturizer: 8,
  "Hydrating Toner": 6,
  "Premium Skincare Kit": 5,
  "Foaming Cleanser": 4,
  "Cleansing Oil": 4,
};

// Affinity chain: given the last product bought, what's likely next.
// Falls back to POPULARITY_WEIGHTS if a product has no explicit entry.
const NEXT_PRODUCT: Record<string, Record<string, number>> = {
  "Face Wash": { Serum: 30, "Vitamin C Serum": 15, Moisturizer: 20, Sunscreen: 15, "Hydrating Toner": 12, "Cleansing Oil": 8 },
  "Foaming Cleanser": { Serum: 25, Moisturizer: 20, Sunscreen: 20, "Hydrating Toner": 15, "Niacinamide Serum": 10, "Cleansing Oil": 10 },
  "Cleansing Oil": { Serum: 25, Moisturizer: 20, "Hydrating Toner": 20, Sunscreen: 15, "Clay Face Mask": 20 },
  Serum: { Moisturizer: 30, "Night Repair Cream": 20, "Under Eye Cream": 15, Sunscreen: 15, "Clay Face Mask": 20 },
  "Vitamin C Serum": { Moisturizer: 25, Sunscreen: 30, "Under Eye Cream": 20, "Night Repair Cream": 15, "Face Wash": 10 },
  "Niacinamide Serum": { Moisturizer: 25, "Clay Face Mask": 25, Sunscreen: 20, "Under Eye Cream": 15, "Face Wash": 15 },
  Moisturizer: { Sunscreen: 30, "Night Repair Cream": 20, "Clay Face Mask": 20, "Premium Skincare Kit": 15, "Body Lotion": 15 },
  "Night Repair Cream": { "Under Eye Cream": 30, "Clay Face Mask": 20, Moisturizer: 20, Serum: 15, "Body Lotion": 15 },
  Sunscreen: { Serum: 25, "Face Wash": 20, Moisturizer: 20, "Vitamin C Serum": 20, "Lip Balm": 15 },
  "Under Eye Cream": { Moisturizer: 25, "Night Repair Cream": 25, Serum: 20, "Clay Face Mask": 15, "Face Wash": 15 },
  "Lip Balm": { "Face Wash": 25, Sunscreen: 20, "Body Lotion": 20, Moisturizer: 20, Serum: 15 },
  "Clay Face Mask": { Moisturizer: 25, Serum: 20, "Under Eye Cream": 20, "Face Wash": 20, Sunscreen: 15 },
  "Body Lotion": { Sunscreen: 25, "Face Wash": 20, Moisturizer: 20, "Lip Balm": 20, Serum: 15 },
  "Hydrating Toner": { Serum: 30, Moisturizer: 25, "Vitamin C Serum": 20, Sunscreen: 15, "Cleansing Oil": 10 },
  "Premium Skincare Kit": { Serum: 20, Moisturizer: 20, Sunscreen: 20, "Under Eye Cream": 20, "Clay Face Mask": 20 },
};

const POPULARITY_WEIGHTS: Record<string, number> = Object.fromEntries(
  PRODUCTS.map((p) => [p.name, p.name === "Premium Skincare Kit" ? 5 : 10])
);

function weightedPick(weights: Record<string, number>): string {
  const entries = Object.entries(weights);
  const total = entries.reduce((s, [, w]) => s + w, 0);
  let roll = Math.random() * total;
  for (const [key, w] of entries) {
    roll -= w;
    if (roll <= 0) return key;
  }
  return entries[entries.length - 1][0];
}

// ---------------------------------------------------------------------
// 2. Purchase-count distribution (shapes the lifecycle segments)
// ---------------------------------------------------------------------
// index = purchase count - 1 (i.e. bucket 0 => 1 purchase)
const PURCHASE_COUNT_BUCKETS: { count: number; weight: number }[] = [
  { count: 1, weight: 18 },
  { count: 2, weight: 19 },
  { count: 3, weight: 17 },
  { count: 4, weight: 15 },
  { count: 5, weight: 12 },
  { count: 6, weight: 9 },
  { count: 7, weight: 6 },
  { count: 8, weight: 4 },
];

function samplePurchaseCount(): number {
  const total = PURCHASE_COUNT_BUCKETS.reduce((s, b) => s + b.weight, 0);
  let roll = Math.random() * total;
  for (const b of PURCHASE_COUNT_BUCKETS) {
    roll -= b.weight;
    if (roll <= 0) return b.count;
  }
  return 1;
}

// Random gaussian-ish helper via Box-Muller
function randNormal(mean: number, stdDev: number): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  return mean + z * stdDev;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function daysAgo(days: number): Date {
  const d = new Date(NOW);
  d.setDate(d.getDate() - Math.round(days));
  return d;
}

// ---------------------------------------------------------------------
// 3. Generate one customer's full purchase journey
// ---------------------------------------------------------------------
interface PlannedOrder {
  createdAt: Date;
  items: { productName: string; quantity: number }[];
}

function buildJourney(purchaseCount: number): PlannedOrder[] {
  // Each customer has their own "repeat speed" (avg days between orders)
  const repeatSpeed = clamp(randNormal(45, 18), 18, 110);

  // First purchase: spread across the last ~14 months, skewed toward
  // more history for customers who will end up with many purchases
  // (they need enough runway to fit purchaseCount orders in).
  const maxHistory = 430;
  const minHistoryNeeded = repeatSpeed * (purchaseCount - 1) + 10;
  const historyFloor = Math.min(maxHistory, minHistoryNeeded + 20);
  const firstPurchaseDaysAgo = historyFloor + Math.random() * (maxHistory - historyFloor + 1);

  const orders: PlannedOrder[] = [];
  let cursor = daysAgo(firstPurchaseDaysAgo);
  let lastProduct = weightedPick(ENTRY_WEIGHTS);

  for (let i = 0; i < purchaseCount; i++) {
    if (i > 0) {
      const gap = clamp(randNormal(repeatSpeed, repeatSpeed * 0.4), 10, 200);
      cursor = new Date(cursor);
      cursor.setDate(cursor.getDate() + gap);
      if (cursor > NOW) cursor = NOW;
      lastProduct = weightedPick(NEXT_PRODUCT[lastProduct] ?? POPULARITY_WEIGHTS);
    }

    const items: { productName: string; quantity: number }[] = [
      { productName: lastProduct, quantity: 1 },
    ];
    // ~20% of orders are small bundles (2 items)
    if (Math.random() < 0.2) {
      const bundleProduct = weightedPick(NEXT_PRODUCT[lastProduct] ?? POPULARITY_WEIGHTS);
      if (bundleProduct !== lastProduct) {
        items.push({ productName: bundleProduct, quantity: 1 });
      }
    }

    orders.push({ createdAt: new Date(cursor), items });
  }

  // Deliberately stretch the gap since the LAST order for a slice of
  // repeat customers, so AT_RISK / CHURNED segments are well populated.
  if (purchaseCount >= 2 && Math.random() < 0.35) {
    const stretch = 60 + Math.random() * 220; // 60–280 extra days idle
    const last = orders[orders.length - 1];
    const stretched = new Date(last.createdAt);
    stretched.setDate(stretched.getDate() - stretch); // push it further into the past
    if (stretched > daysAgo(maxHistory)) {
      last.createdAt = stretched;
    }
  }

  orders.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  return orders;
}

// ---------------------------------------------------------------------
// 4. Main seed routine
// ---------------------------------------------------------------------
function randomRazorpayId(prefix: string): string {
  return `${prefix}_test_${faker.string.alphanumeric(14)}`;
}

async function main() {
  console.log(`Connecting to database...`);
  const client = await pool.connect();

  try {
    if (RESET) {
      console.log("Resetting existing data...");
      await client.query(
        "TRUNCATE customer_events, payments, order_items, orders, products, customers RESTART IDENTITY CASCADE"
      );
    }

    console.log("Inserting products...");
    const productIdByName = new Map<string, string>();
    for (const p of PRODUCTS) {
      const res = await client.query(
        `insert into products (name, category, price) values ($1, $2, $3)
         on conflict do nothing returning id`,
        [p.name, p.category, p.price]
      );
      let id = res.rows[0]?.id;
      if (!id) {
        const existing = await client.query(
          `select id from products where name = $1`,
          [p.name]
        );
        id = existing.rows[0].id;
      }
      productIdByName.set(p.name, id);
    }

    console.log(`Generating ${TOTAL_CUSTOMERS} customers...`);
    const usedEmails = new Set<string>();

    // Batch buffers
    type Row = unknown[];
    const customerRows: Row[] = [];
    const orderRows: Row[] = [];
    const orderItemRows: Row[] = [];
    const paymentRows: Row[] = [];
    const eventRows: Row[] = [];

    let totalOrders = 0;
    let totalItems = 0;

    for (let i = 0; i < TOTAL_CUSTOMERS; i++) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const name = `${firstName} ${lastName}`;
      let email = faker.internet
        .email({ firstName, lastName, provider: "example.com" })
        .toLowerCase();
      while (usedEmails.has(email)) {
        email = `${firstName}.${lastName}.${faker.string.alphanumeric(4)}@example.com`.toLowerCase();
      }
      usedEmails.add(email);
      const phone = `+91${faker.string.numeric(10)}`;

      const purchaseCount = samplePurchaseCount();
      const journey = buildJourney(purchaseCount);
      const customerCreatedAt = daysAgo(
        // customer signed up on (or just before) their first order
        Math.max(0, (NOW.getTime() - journey[0].createdAt.getTime()) / 86400000) + Math.random() * 5
      );

      const customerId = faker.string.uuid();
      customerRows.push([customerId, name, email, phone, customerCreatedAt]);

      for (const order of journey) {
        // ~4% of orders fail at checkout (not counted as a purchase)
        const failed = Math.random() < 0.04;
        const orderId = faker.string.uuid();
        let orderTotal = 0;

        const itemsForOrder = order.items.map((it) => {
          const product = PRODUCTS.find((p) => p.name === it.productName)!;
          orderTotal += product.price * it.quantity;
          return { productId: productIdByName.get(it.productName)!, ...it, price: product.price };
        });

        const status = failed ? "failed" : "paid";
        orderRows.push([
          orderId,
          customerId,
          orderTotal,
          status,
          order.createdAt,
          randomRazorpayId("order"),
        ]);
        totalOrders++;

        for (const item of itemsForOrder) {
          orderItemRows.push([
            faker.string.uuid(),
            orderId,
            item.productId,
            item.quantity,
            item.price,
          ]);
          totalItems++;
        }

        if (!failed) {
          const method = weightedPick({ upi: 55, card: 30, netbanking: 10, wallet: 5 });
          paymentRows.push([
            faker.string.uuid(),
            orderId,
            customerId,
            orderTotal,
            "captured",
            method,
            randomRazorpayId("pay"),
            order.createdAt,
          ]);
          eventRows.push([
            faker.string.uuid(),
            customerId,
            "order_placed",
            JSON.stringify({ order_id: orderId, amount: orderTotal }),
            order.createdAt,
          ]);
        } else {
          eventRows.push([
            faker.string.uuid(),
            customerId,
            "payment_failed",
            JSON.stringify({ order_id: orderId, amount: orderTotal }),
            order.createdAt,
          ]);
        }
      }

      if ((i + 1) % 250 === 0) {
        console.log(`  ...${i + 1}/${TOTAL_CUSTOMERS} customers planned`);
      }
    }

    console.log(
      `Planned ${customerRows.length} customers, ${totalOrders} orders, ${totalItems} order items.`
    );

    await bulkInsert(
      client,
      "customers",
      ["id", "name", "email", "phone", "created_at"],
      customerRows
    );
    console.log("Inserted customers.");

    await bulkInsert(
      client,
      "orders",
      ["id", "customer_id", "total_amount", "status", "created_at", "razorpay_order_id"],
      orderRows
    );
    console.log("Inserted orders.");

    await bulkInsert(
      client,
      "order_items",
      ["id", "order_id", "product_id", "quantity", "price"],
      orderItemRows
    );
    console.log("Inserted order items.");

    await bulkInsert(
      client,
      "payments",
      [
        "id",
        "order_id",
        "customer_id",
        "amount",
        "status",
        "payment_method",
        "razorpay_payment_id",
        "created_at",
      ],
      paymentRows
    );
    console.log("Inserted payments.");

    await bulkInsert(
      client,
      "customer_events",
      ["id", "customer_id", "event_type", "metadata", "created_at"],
      eventRows
    );
    console.log("Inserted customer events.");

    console.log("Seed complete.");
  } finally {
    client.release();
    await pool.end();
  }
}

async function bulkInsert(
  client: import("pg").PoolClient,
  table: string,
  columns: string[],
  rows: unknown[][],
  chunkSize = 500
) {
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    const values: unknown[] = [];
    const placeholders = chunk
      .map((row, rowIdx) => {
        const base = rowIdx * columns.length;
        const ph = columns.map((_, colIdx) => `$${base + colIdx + 1}`).join(", ");
        values.push(...row);
        return `(${ph})`;
      })
      .join(", ");
    const sql = `insert into ${table} (${columns.join(", ")}) values ${placeholders}`;
    await client.query(sql, values);
  }
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
