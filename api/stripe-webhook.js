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

    if (session.payment_status !== "paid") {
  console.log("Payment not completed — skipping fulfillment");

  return res.status(200).json({
    received: true,
    fulfillment: "payment_not_completed",
  });
}

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

    const shipping = session.collected_information?.shipping_details;
    const customer = session.customer_details;

    const nameParts = (shipping?.name || customer?.name || "")
      .trim()
      .split(" ");

    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    const printifyOrder = {
      external_id: session.id,
      label: `Dad Standard - ${session.id}`,
      line_items: printifyItems,
      shipping_method: 1,
      send_shipping_notification: false,
      address_to: {
        first_name: firstName,
        last_name: lastName,
        email: customer?.email || "",
        phone: customer?.phone || "",
        country: shipping?.address?.country || "",
        region: shipping?.address?.state || "",
        address1: shipping?.address?.line1 || "",
        address2: shipping?.address?.line2 || "",
        city: shipping?.address?.city || "",
        zip: shipping?.address?.postal_code || "",
      },
    };

    console.log("Printify order prepared:", printifyOrder);

    // Never create Printify orders from Stripe sandbox payments.
    if (!event.livemode) {
      console.log("Sandbox payment — skipping Printify fulfillment");

      return res.status(200).json({
        received: true,
        fulfillment: "skipped_sandbox",
      });
    }

    // Second safety lock. Must explicitly be enabled in Vercel.
    if (process.env.PRINTIFY_FULFILLMENT_ENABLED !== "true") {
      console.log("Printify fulfillment disabled");

      return res.status(200).json({
        received: true,
        fulfillment: "disabled",
      });
    }

    const printifyResponse = await fetch(
      "https://api.printify.com/v1/shops/29064058/orders.json",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PRINTIFY_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(printifyOrder),
      },
    );

    const printifyResult = await printifyResponse.json();

if (!printifyResponse.ok) {
  console.error("Printify order creation failed:", printifyResult);

  return res.status(500).json({
    error: "Printify order creation failed",
  });
}

console.log("Printify order created:", printifyResult);

  return res.status(200).json({
    received: true,
  });
}