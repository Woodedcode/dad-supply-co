import Stripe from "stripe";
import getRawBody from "raw-body";
import { PRINTIFY_PRODUCT_ID, PRINTIFY_VARIANTS } from "./printify-config.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const signature = req.headers["stripe-signature"];

  let event;

  try {
    const rawBody = await getRawBody(req);

    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (error) {
    console.error("Webhook signature verification failed:", error.message);

    return res.status(400).json({
      error: "Webhook signature verification failed",
    });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    console.log("Stripe checkout completed:", session.id);

    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
      expand: ["data.price.product"],
    });

    console.log(
      "Purchased item metadata:",
      lineItems.data.map((item) => ({
        name: item.description,
        quantity: item.quantity,
        metadata: item.price?.product?.metadata,
      })),
    );

    const printifyItems = lineItems.data.map((item) => {
      const metadata = item.price?.product?.metadata;
      const variantId = PRINTIFY_VARIANTS[metadata?.size];

      return {
        product_id: PRINTIFY_PRODUCT_ID,
        variant_id: variantId,
        quantity: item.quantity,
      };
    });

    console.log("Printify items prepared:", printifyItems);

    if (!event.livemode) {
      console.log("Sandbox payment — skipping Printify fulfillment");

      return res.status(200).json({
        received: true,
        fulfillment: "skipped_sandbox",
      });
    }

    if (process.env.PRINTIFY_FULFILLMENT_ENABLED !== "true") {
      console.log("Printify fulfillment disabled");

      return res.status(200).json({
        received: true,
        fulfillment: "disabled",
      });
    }
  }

  return res.status(200).json({
    received: true,
  });
}
