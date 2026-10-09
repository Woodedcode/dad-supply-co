
import Stripe from "stripe";
import { timingSafeEqual } from "node:crypto";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const SHOP_ID = "29064058";

const ALLOWED_PRODUCTS = [
  "6ab5453141b86e214f0f51c2", // Dad Standard Tee
  "6ac16b360c4065ff510ba05d", // IM-PASTA Tee
];

function authorized(provided, expected) {
  if (!provided || !expected) return false;

  const a = Buffer.from(provided);
  const b = Buffer.from(expected);

  return (
    a.length === b.length &&
    timingSafeEqual(a, b)
  );
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  // Only you can access this endpoint.
  const token = req.headers["x-recovery-token"];

  if (!authorized(token, process.env.ORDER_RECOVERY_TOKEN)) {
    return res.status(401).json({
      error: "Unauthorized",
    });
  }

  try {
    const { sessionId } = req.body || {};

    if (
      typeof sessionId !== "string" ||
      !sessionId.startsWith("cs_live_")
    ) {
      return res.status(400).json({
        error: "Valid live Checkout Session ID required",
      });
    }

    // Verify the existing Stripe payment.
    const session =
      await stripe.checkout.sessions.retrieve(sessionId);

    if (
      !session.livemode ||
      session.status !== "complete" ||
      session.payment_status !== "paid"
    ) {
      return res.status(400).json({
        error: "Session is not a completed live payment",
      });
    }

    // Retrieve all purchased line items.
    const items = [];

    for await (const item of stripe.checkout.sessions.listLineItems(
      sessionId,
      { expand: ["data.price.product"], limit: 100 }
    )) {
      items.push(item);
    }

    if (!items.length) {
      throw new Error("No purchased items found");
    }

    const preparedItems = [];

    for (const item of items) {
      const metadata = item.price?.product?.metadata || {};

      const productId = metadata.printifyProductId;
      const variantId = Number(metadata.printifyVariantId);
      const quantity = Number(item.quantity);

      if (!ALLOWED_PRODUCTS.includes(productId)) {
        throw new Error(
          `Unrecognized Printify product: ${item.description}`
        );
      }

      if (
        !Number.isInteger(variantId) ||
        variantId <= 0 ||
        !Number.isInteger(quantity) ||
        quantity < 1
      ) {
        throw new Error("Invalid variant or quantity");
      }

      // Confirm the variant exists in Printify.
      const response = await fetch(
        `https://api.printify.com/v1/shops/${SHOP_ID}/products/${productId}.json`,
        {
          headers: {
            Authorization:
              `Bearer ${process.env.PRINTIFY_API_TOKEN}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Printify verification failed: HTTP ${response.status}`
        );
      }

      const product = await response.json();

      const variant = product.variants?.find(
        (v) => v.id === variantId
      );

      if (!variant || variant.is_enabled === false) {
        throw new Error(
          `Invalid Printify variant for ${item.description}`
        );
      }

      preparedItems.push({
        name: item.description,
        size: metadata.size,
        printifyProductId: productId,
        printifyVariantId: variantId,
        quantity,
      });
    }

    const shipping =
      session.collected_information?.shipping_details ||
      session.shipping_details;

    if (
      !shipping?.address?.line1 ||
      !shipping?.address?.city ||
      !shipping?.address?.postal_code ||
      !shipping?.address?.country
    ) {
      throw new Error("Shipping address is incomplete");
    }

    return res.status(200).json({
      success: true,
      mode: "PREVIEW_ONLY",
      sessionId: session.id,
      paymentStatus: session.payment_status,
      total: session.amount_total / 100,
      currency: session.currency,
      shippingAddressPresent: true,
      items: preparedItems,
      message:
        "Preview successful. No Printify order was created.",
    });
  } catch (error) {
    console.error("Recovery preview failed:", error.message);

    return res.status(500).json({
      error: "Recovery preview failed. Check Vercel logs.",
    });
  }
}
