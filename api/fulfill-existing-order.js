import Stripe from "stripe";
import { PRINTIFY_PRODUCT_ID, PRINTIFY_VARIANTS } from "./printify-config.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  const { sessionId } = req.body;

  if (!sessionId) {
    return res.status(400).json({
      error: "Missing Stripe Checkout Session ID",
    });
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (session.payment_status !== "paid") {
    return res.status(400).json({
      error: "Stripe Checkout Session is not paid",
    });
  }

  const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
    expand: ["data.price.product"],
  });

  const allowedSizes = ["S", "M", "L", "XL", "2XL"];

  const printifyItems = lineItems.data.map((item) => {
    const metadata = item.price?.product?.metadata;
    const variantId = PRINTIFY_VARIANTS[metadata?.size];
    const quantity = Number(item.quantity);

    if (
      metadata?.productKey !== "dad-standard-tee" ||
      !allowedSizes.includes(metadata?.size) ||
      !variantId ||
      !Number.isInteger(quantity) ||
      quantity < 1
    ) {
      throw new Error(
        "Invalid product, size, or quantity for Printify fulfillment",
      );
    }

    return {
      product_id: PRINTIFY_PRODUCT_ID,
      variant_id: variantId,
      quantity,
    };
  });

  const shipping = session.collected_information?.shipping_details;
  const customer = session.customer_details;

  const nameParts = (shipping?.name || customer?.name || "").trim().split(" ");

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

  const existingOrdersResponse = await fetch(
  "https://api.printify.com/v1/shops/29064058/orders.json?limit=100",
  {
    headers: {
      Authorization: `Bearer ${process.env.PRINTIFY_API_TOKEN}`,
    },
  },
);

const existingOrders = await existingOrdersResponse.json();

const duplicateOrder = existingOrders.data?.find(
  (order) => order.external_id === session.id,
);

if (duplicateOrder) {
  return res.status(200).json({
    success: true,
    fulfillment: "duplicate_skipped",
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

return res.status(200).json({
  success: true,
  fulfillment: "created",
  orderId: printifyResult.id,
});
}
