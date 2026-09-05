import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PayMind — Customer Intelligence for D2C",
  description:
    "AI-powered customer intelligence for Indian D2C brands using Razorpay.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
