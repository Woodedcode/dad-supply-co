
import Stripe from "stripe";
import getRawBody from "raw-body";
import { supabase } from "./supabase.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const SHOP_ID = "29064058";
const PRINTIFY_API = `https://api.printify.com/v1/shops/${SHOP_ID}`;

const ALLOWED_PRODUCT_IDS = new Set([
  "6ab5453141b86e214f0f51c2", // Dad Standard Tee
  "6ac16b360c4065ff510ba05d", // IM-PASTA Tee
]);

export const config = {
  api: {
    bodyParser: false,
  },
};

// PRINTIFY API HEADERS
function printifyHeaders() {
  return {
    Authorization: `Bearer ${process.env.PRINTIFY_API_TOKEN}`,
    "User-Agent": "Dad Standard Co",
  };
}

// VERIFY PRINTIFY PRODUCT AND SIZE
async function verifyPrintifyVariant(
  productId,
  variantId,
  requestedSize
) {
  const response = await fetch(
    `${PRINTIFY_API}/products/${productId}.json`,
    {
      headers: printifyHeaders(),
      signal: AbortSignal.timeout(10000),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Printify product lookup failed (${response.status})`
    );
  }

  const product = await response.json();

  const variant = product.variants?.find(
    (item) =>
      item.id === variantId &&
      item.is_enabled === true &&
      item.is_available === true
  );

  if (!variant) {
    throw new Error(
      `Printify variant ${variantId} is invalid or unavailable`
    );
  }

  // Supports titles such as "Black / L" or "L / Natural"
  if (requestedSize) {
    const sizesAndColors = String(variant.title)
      .split("/")
      .map((part) => part.trim().toUpperCase());

    if (
      !sizesAndColors.includes(
        String(requestedSize).trim().toUpperCase()
      )
    ) {
      throw new Error(
        `Printify size does not match variant ${variantId}`
      );
    }
  }

  return variant;
}

// FLAG AN ORDER FOR MANUAL REVIEW
async function flagForReview(sessionId) {
  const { error } = await supabase
    .from("orders")
    .update({
      status: "needs_review",
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_session_id", sessionId)
    .eq("status", "processing");

  if (error) {
    console.error(
      "Could not flag order for manual review:",
      {
        sessionId,
        error: error.message,
      }
    );
  }
}

// RECORD SUCCESSFUL PRINTIFY ORDER
async function recordPrintifyOrder(
  sessionId,
  printifyOrderId
) {
  const { data, error } = await supabase
    .from("orders")
    .update({
      status: "submitted",
      printify_order_id: String(printifyOrderId),
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_session_id", sessionId)
    .eq("status", "processing")
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(
      "Printify order exists, but database tracking failed"
    );
  }
}

// MAIN STRIPE WEBHOOK
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  let event;

  // VERIFY STRIPE SIGNATURE
  try {
    const rawBody = await getRawBody(req);

    event = stripe.webhooks.constructEvent(
      rawBody,
      req.headers["stripe-signature"],
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error(
      "Invalid Stripe webhook signature:",
      error.message
    );

    return res.status(400).json({
      error: "Invalid webhook signature",
    });
  }

  // ONLY PROCESS PAYMENT EVENTS
  if (
    event.type !== "checkout.session.completed" &&
    event.type !== "checkout.session.async_payment_succeeded"
  ) {
    return res.status(200).json({
      received: true,
    });
  }

  const session = event.data.object;

  let claimedSessionId = null;

  try {
    // CHECK PAYMENT STATUS
    if (session.payment_status !== "paid") {
      return res.status(200).json({
        received: true,
        fulfillment: "awaiting_payment",
      });
    }

    if (!session.payment_intent) {
      throw new Error(
        "Stripe Payment Intent is missing"
      );
    }

    const paymentIntentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent.id;

    // VERIFY PAYMENT DIRECTLY WITH STRIPE
    const paymentIntent =
      await stripe.paymentIntents.retrieve(
        paymentIntentId,
        {
          expand: ["latest_charge"],
        }
      );

    if (paymentIntent.status !== "succeeded") {
      throw new Error(
        "Stripe payment has not succeeded"
      );
    }

    const charge = paymentIntent.latest_charge;

    if (!charge || typeof charge === "string") {
      throw new Error(
        "Unable to verify Stripe charge"
      );
    }

    // NEVER FULFILL REFUNDED PAYMENTS
    if (
      charge.refunded ||
      charge.amount_refunded > 0
    ) {
      console.log(
        "Refunded Stripe session skipped:",
        session.id
      );

      return res.status(200).json({
        received: true,
        fulfillment: "refunded_skipped",
      });
    }

    // NEVER FULFILL TEST PAYMENTS
    if (!event.livemode) {
      return res.status(200).json({
        received: true,
        fulfillment: "test_mode_skipped",
      });
    }

    // PRINTIFY SAFETY SWITCH
    // KEEP DISABLED UNTIL TESTING IS COMPLETE
    if (
      process.env.PRINTIFY_FULFILLMENT_ENABLED !==
      "true"
    ) {
      console.warn(
        "Printify fulfillment disabled for session:",
        session.id
      );

      return res.status(200).json({
        received: true,
        fulfillment: "disabled",
      });
    }

    // GET STRIPE PURCHASED ITEMS
    const lineItems =
      await stripe.checkout.sessions.listLineItems(
        session.id,
        {
          limit: 100,
          expand: ["data.price.product"],
        }
      );

    if (
      !lineItems.data.length ||
      lineItems.has_more
    ) {
      throw new Error(
        "Stripe line items are missing or incomplete"
      );
    }

    const printifyItems = [];

    // CONVERT STRIPE ITEMS TO PRINTIFY ITEMS
    for (const item of lineItems.data) {
      const metadata =
        item.price?.product?.metadata || {};

      const productId =
        metadata.printifyProductId;

      const variantId = Number(
        metadata.printifyVariantId
      );

      const quantity = Number(
        item.quantity
      );

      // VALIDATE PRODUCT
      if (!ALLOWED_PRODUCT_IDS.has(productId)) {
        throw new Error(
          "Checkout contains an unapproved Printify product"
        );
      }

      // VALIDATE VARIANT
      if (
        !Number.isInteger(variantId) ||
        variantId <= 0
      ) {
        throw new Error(
          "Checkout contains an invalid Printify variant"
        );
      }

      // VALIDATE QUANTITY
      if (
        !Number.isInteger(quantity) ||
        quantity < 1
      ) {
        throw new Error(
          "Checkout contains an invalid quantity"
        );
      }

      // VERIFY PRODUCT AND SIZE WITH PRINTIFY
      await verifyPrintifyVariant(
        productId,
        variantId,
        metadata.size
      );

      printifyItems.push({
        product_id: productId,
        variant_id: variantId,
        quantity,
      });
    }

    // GET CUSTOMER SHIPPING INFORMATION
    const shipping =
      session.collected_information
        ?.shipping_details ||
      session.shipping_details ||
      null;

    const customer =
      session.customer_details || {};

    const address =
      shipping?.address ||
      customer.address ||
      {};

    const name = String(
      shipping?.name ||
      customer.name ||
      ""
    ).trim();

    const [firstName, ...lastNameParts] =
      name.split(/\s+/);

    const addressTo = {
      first_name: firstName || "",
      last_name: lastNameParts.join(" "),

      email:
        customer.email ||
        session.customer_email ||
        "",

      phone: customer.phone || "",

      country: address.country || "",
      region: address.state || "",

      address1: address.line1 || "",
      address2: address.line2 || "",

      city: address.city || "",
      zip: address.postal_code || "",
    };

    // VERIFY SHIPPING INFORMATION
    const requiredFields = [
      "first_name",
      "last_name",
      "email",
      "country",
      "address1",
      "city",
      "zip",
    ];

    if (
      requiredFields.some(
        (field) => !addressTo[field]
      ) ||
      (
        ["US", "CA"].includes(addressTo.country) &&
        !addressTo.region
      )
    ) {
      throw new Error(
        "Shipping information is incomplete"
      );
    }

    // BUILD PRINTIFY ORDER
    const printifyOrder = {
      external_id: session.id,

      label: `Dad Standard - ${session.id}`,

      line_items: printifyItems,

      shipping_method: 1,

      send_shipping_notification: false,

      address_to: addressTo,
    };

    // CLAIM ORDER IN SUPABASE
    // PREVENT DUPLICATE ORDERS
    const {
      data: claimRows,
      error: claimError,
    } = await supabase.rpc(
      "claim_order",
      {
        p_stripe_session_id: session.id,
      }
    );

    if (claimError) {
      throw new Error(
        `Supabase claim failed: ${claimError.message}`
      );
    }

    const claim = claimRows?.[0];

    if (!claim) {
      throw new Error(
        "Supabase did not return an order claim"
      );
    }

    // IF ALREADY CLAIMED, DO NOT CREATE AGAIN
    if (!claim.claimed) {
      return res.status(200).json({
        received: true,
        fulfillment: "already_claimed",
        status: claim.current_status,
      });
    }

    claimedSessionId = session.id;

    // CHECK RECENT PRINTIFY ORDERS
    const existingResponse = await fetch(
      `${PRINTIFY_API}/orders.json?limit=10`,
      {
        headers: printifyHeaders(),
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!existingResponse.ok) {
      throw new Error(
        `Printify order lookup failed (${existingResponse.status})`
      );
    }

    const existingOrders =
      await existingResponse.json();

    const duplicate = existingOrders.data?.find(
      (order) =>
        order.external_id === session.id ||
        String(
          order.metadata?.shop_order_id || ""
        ) === session.id ||
        order.metadata?.shop_order_label ===
          printifyOrder.label
    );

    // IF PRINTIFY ORDER ALREADY EXISTS
    if (duplicate) {
      await recordPrintifyOrder(
        session.id,
        duplicate.id
      );

      claimedSessionId = null;

      return res.status(200).json({
        received: true,
        fulfillment: "already_in_printify",
      });
    }

    // CREATE PRINTIFY ORDER
    // DO NOT AUTO-RETRY UNCERTAIN SUBMISSIONS
    const response = await fetch(
      `${PRINTIFY_API}/orders.json`,
      {
        method: "POST",

        headers: {
          ...printifyHeaders(),
          "Content-Type": "application/json",
        },

        body: JSON.stringify(printifyOrder),

        signal: AbortSignal.timeout(15000),
      }
    );

    let result;

    try {
      result = await response.json();
    } catch {
      throw new Error(
        "Printify returned an unreadable response; review order manually"
      );
    }

    if (!response.ok || !result?.id) {
      throw new Error(
        `Printify order result needs manual review (HTTP ${response.status})`
      );
    }

    // SAVE PRINTIFY ORDER ID IN SUPABASE
    await recordPrintifyOrder(
      session.id,
      result.id
    );

    claimedSessionId = null;

    console.log(
      "Printify order created:",
      {
        sessionId: session.id,
        printifyOrderId: result.id,
      }
    );

    // SUCCESS
    return res.status(200).json({
      received: true,
      fulfillment: "created",
      printifyOrderId: result.id,
    });

  } catch (error) {
    console.error(
      "Order fulfillment failed:",
      {
        sessionId: session.id,
        message: error.message,
      }
    );

    // MARK UNCERTAIN ORDERS FOR MANUAL REVIEW
    if (claimedSessionId) {
      try {
        await flagForReview(
          claimedSessionId
        );
      } catch (reviewError) {
        console.error(
          "Could not update order review status:",
          reviewError.message
        );
      }
    }

    return res.status(500).json({
      error: "Order needs manual review",
    });
  }
}
