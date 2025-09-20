import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST() {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    console.warn("Missing STRIPE_SECRET_KEY. Returning mocked checkout URL.");
    return NextResponse.json({ url: "https://dashboard.stripe.com/test/payments" });
  }

  try {
    const stripe = new Stripe(secretKey, { apiVersion: "2024-04-10" });

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        process.env.STRIPE_PRICE_ID
          ? {
              price: process.env.STRIPE_PRICE_ID,
              quantity: 1,
            }
          : {
              quantity: 1,
              price_data: {
                currency: "usd",
                recurring: { interval: "month" },
                unit_amount: 500,
                product_data: {
                  name: "Grounded Living Premium Membership",
                },
              },
            },
      ],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/premium?status=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/premium?status=cancelled`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error", error);
    return NextResponse.json({ error: "Unable to start checkout" }, { status: 500 });
  }
}
