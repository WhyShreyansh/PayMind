# PayMind

> AI-powered customer intelligence and retention platform for Razorpay merchants.

## 💡 What is PayMind?

PayMind helps D2C merchants turn Razorpay transaction data into actionable customer insights.

Instead of only showing merchants what happened, PayMind helps them understand:

- Who are my best customers?
- Who is likely to purchase again?
- Who is at risk of churning?
- Which customers should I target?
- What product should I recommend next?
- What action should I take?

### Core Flow

Razorpay Data → Customer Memory → Intelligence → AI Insights → Recommendations → Action

---

## 🚀 Key Features

### Customer Intelligence
Understand every customer's:
- Purchase history
- Lifetime value
- Purchase frequency
- Average order value
- Favorite products
- Customer lifecycle

### Customer Lifecycle
Automatically identify:

`New → Second Purchase → Repeat → Loyal → At Risk → Churned`

### Product Affinity
Find purchase patterns such as:

`Face Wash → Serum`

and identify customers who are ready for cross-selling.

### AI Assistant
Ask questions in natural language:

> "Who should I target for a second purchase?"

> "Who are my best customers?"

> "Which customers bought Face Wash but never bought Serum?"

### Recommendations
PayMind automatically identifies opportunities such as:

- Reactivate lapsed customers
- Win back at-risk customers
- Drive second purchases
- Cross-sell products
- Reward loyal customers

Each recommendation provides an audience, reason, product and suggested offer.

---

## 🧠 AI Approach

PayMind separates **data calculation from AI reasoning**.

Customer metrics and segments are calculated from transaction data.

Gemini is used to understand merchant questions, call controlled intelligence tools and explain the results.

This helps keep AI answers grounded in actual customer data.

---

## 🛠️ Tech Stack

- **Next.js**
- **TypeScript**
- **Tailwind CSS**
- **Supabase PostgreSQL**
- **Recharts**
- **Google Gemini**
- **Razorpay Test Mode**

---

## 💳 Razorpay

PayMind is designed to work on top of Razorpay payment data.

The planned action flow is:

`Recommendation → Razorpay Payment Link → Payment → Webhook → PayMind`

The hackathon version uses Razorpay Test Mode.

---

## 🧠 Future: Supermemory

The current MVP creates structured customer memory from transaction data.

Supermemory can extend this into **long-term contextual customer memory**.

Instead of only remembering:

> "Customer bought Face Wash 3 times."

PayMind could remember:

> "Customer prefers fragrance-free products and previously showed interest in lightweight skincare."

This would allow PayMind AI to provide more personalized recommendations using both **transaction history and customer context**.

### Future Architecture

`Razorpay + Supermemory → Customer Memory → PayMind AI → Personalized Action`

---

## 📊 Demo Dataset

PayMind currently includes a realistic D2C skincare dataset, **GlowSkin**, with approximately:

- 2,000 customers
- 7,000+ orders
- 8,000+ order items
- 15 products

This dataset is used to demonstrate customer intelligence and retention opportunities.

---

## 🎯 Vision

PayMind is not just another analytics dashboard.

**Razorpay tells merchants what happened.  
PayMind tells them who matters, why they matter, and what to do next.**