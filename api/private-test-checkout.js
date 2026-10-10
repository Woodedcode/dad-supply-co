
import Stripe from "stripe";
import { timingSafeEqual } from "node:crypto";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const expected = process.env.CHECKOUT_TEST_TOKEN || "";
  const supplied = req.headers["x-checkout-test-token"] || "";

  const validToken =
    typeof supplied === "string" &&
    expected.length > 0 &&
    Buffer.byteLength(expected) === Buffer.byteLength(supplied) &&
    timingSafeEqual(Buffer.from(expected), Buffer.from(supplied));

  if (!validToken) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (
    process.env.CHECKOUT_ENABLED === "true" ||
    process.env.PRINTIFY_FULFILLMENT_ENABLED !== "true"
  ) {
    return res.status(409).json({
      error: "Test safety settings are not configured",
    });
  }

  try {
    if (!process.env.STRIPE_SECRET_KEY?.startsWith("sk_live_")) {
      throw new Error("Live Stripe key not configured");
    }

    const productId = "6ac16b360c4065ff510ba05d";

    const response = await fetch(
      `https://api.printify.com/v1/shops/29064058/products/${productId}.json`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PRINTIFY_API_TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Printify product verification failed");
    }

    const product = await response.json();

    const variant = product.variants?.find(
      (v) =>
        v.id === 38192 &&
        v.is_enabled === true &&
        v.is_available === true
    );

    if (!variant || variant.price !== 3500) {
      throw new Error("IM-PASTA variant or price has changed");
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const session = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        payment_method_types: ["card"],

        line_items: [
          {
            price_data: {
              currency: "usd",
              unit_amount: 3500,
              product_data: {
                name: "IM-PASTA Tee",
                description: "Black / Large",
                metadata: {
                  printifyProductId: productId,
                  printifyVariantId: "38192",
                  size: "L",
                },
              },
            },
            quantity: 1,
          },
        ],

        shipping_address_collection: {
          allowed_countries: ["US"],
        },

        phone_number_collection: {
          enabled: true,
        },

        success_url:
          "https://www.dadstandardco.com/order-confirmation",

        cancel_url: "https://www.dadstandardco.com/cart",
      },
      {
        idempotencyKey: "dad-standard-private-live-test-v1-20261009",
      }
    );

    return res.status(200).json({
      checkoutUrl: session.url,
      sessionId: session.id,
      amount: "$35.00",
    });
  } catch (error) {
    console.error("Private checkout test failed:", error.message);

    return res.status(500).json({
      error: "Could not create private test checkout",
    });
  }
}
