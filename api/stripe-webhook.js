import Stripe from "stripe";
import getRawBody from "raw-body";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const SHOP_ID = "29064058";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  const signature = req.headers["stripe-signature"];

  let event;

  /*
    VERIFY STRIPE WEBHOOK
  */
  try {
    const rawBody = await getRawBody(req);

    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error(
      "Webhook signature verification failed:",
      error.message
    );

    return res.status(400).json({
      error: "Webhook signature verification failed",
    });
  }

  /*
    WE FULFILL:
    - normal completed payments
    - delayed payments once they actually succeed
  */
  const fulfillmentEvents = [
    "checkout.session.completed",
    "checkout.session.async_payment_succeeded",
  ];

  if (!fulfillmentEvents.includes(event.type)) {
    return res.status(200).json({
      received: true,
    });
  }

  try {
    const session = event.data.object;

    console.log("Stripe checkout received:", {
      sessionId: session.id,
      eventType: event.type,
      paymentStatus: session.payment_status,
    });

    /*
      DON'T FULFILL UNTIL STRIPE SAYS PAID
    */
    if (session.payment_status !== "paid") {
      console.log(
        "Payment is not paid yet — skipping Printify fulfillment"
      );

      return res.status(200).json({
        received: true,
        fulfillment: "waiting_for_payment",
      });
    }

    /*
      GET PURCHASED ITEMS FROM STRIPE
    */
    const lineItems =
      await stripe.checkout.sessions.listLineItems(
        session.id,
        {
          limit: 100,
          expand: ["data.price.product"],
        }
      );

    if (!lineItems.data.length) {
      throw new Error(
        "Stripe checkout contains no line items"
      );
    }

    console.log(
      "Purchased items:",
      lineItems.data.map((item) => ({
        name: item.description,
        quantity: item.quantity,
        metadata:
          item.price?.product?.metadata || {},
      }))
    );

    /*
      CONVERT STRIPE ITEMS INTO PRINTIFY ITEMS
    */
    const printifyItems = lineItems.data.map(
      (item) => {
        const metadata =
          item.price?.product?.metadata || {};

        const printifyProductId =
          metadata.printifyProductId;

        const printifyVariantId = Number(
          metadata.printifyVariantId
        );

        const quantity = Number(item.quantity);

        if (!printifyProductId) {
          throw new Error(
            `Missing Printify product ID for ${item.description}`
          );
        }

        if (
          !Number.isInteger(printifyVariantId) ||
          printifyVariantId <= 0
        ) {
          throw new Error(
            `Invalid Printify variant ID for ${item.description}`
          );
        }

        if (
          !Number.isInteger(quantity) ||
          quantity < 1
        ) {
          throw new Error(
            `Invalid quantity for ${item.description}`
          );
        }

        return {
          product_id: printifyProductId,
          variant_id: printifyVariantId,
          quantity,
        };
      }
    );

    /*
      GET CUSTOMER + SHIPPING INFO
    */
    const shipping =
      session.collected_information
        ?.shipping_details ||
      session.shipping_details ||
      null;

    const customer =
      session.customer_details || {};

    const shippingAddress =
      shipping?.address ||
      customer?.address ||
      {};

    const fullName =
      shipping?.name ||
      customer?.name ||
      "Customer";

    const nameParts = fullName
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    const firstName =
      nameParts[0] || "Customer";

    const lastName =
      nameParts.slice(1).join(" ") || "";

    /*
      BUILD PRINTIFY ORDER
    */
    const printifyOrder = {
      external_id: session.id,

      label: `Dad Standard - ${session.id}`,

      line_items: printifyItems,

      shipping_method: 1,

      send_shipping_notification: false,

      address_to: {
        first_name: firstName,
        last_name: lastName,

        email:
          customer.email ||
          session.customer_email ||
          "",

        phone:
          customer.phone || "",

        country:
          shippingAddress.country || "US",

        region:
          shippingAddress.state || "",

        address1:
          shippingAddress.line1 || "",

        address2:
          shippingAddress.line2 || "",

        city:
          shippingAddress.city || "",

        zip:
          shippingAddress.postal_code || "",
      },
    };

    console.log(
      "Printify order prepared:",
      printifyOrder
    );

    /*
      DO NOT FULFILL STRIPE TEST MODE PAYMENTS
    */
    if (!event.livemode) {
      console.log(
        "Stripe test payment — Printify order not created"
      );

      return res.status(200).json({
        received: true,
        fulfillment: "skipped_test_mode",
      });
    }

    /*
      SAFETY SWITCH

      Vercel must have:

      PRINTIFY_FULFILLMENT_ENABLED=true
    */
    if (
      process.env.PRINTIFY_FULFILLMENT_ENABLED !==
      "true"
    ) {
      console.log(
        "Printify fulfillment is disabled"
      );

      return res.status(200).json({
        received: true,
        fulfillment: "disabled",
      });
    }

    /*
      CHECK PRINTIFY FOR AN EXISTING ORDER

      This prevents Stripe from accidentally
      creating the same Printify order twice.
    */
    const existingOrdersResponse = await fetch(
      `https://api.printify.com/v1/shops/${SHOP_ID}/orders.json?limit=100`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PRINTIFY_API_TOKEN}`,
          "User-Agent": "Dad Standard Co",
        },
      }
    );

    if (!existingOrdersResponse.ok) {
      const errorText =
        await existingOrdersResponse.text();

      throw new Error(
        `Could not check Printify orders: ${errorText}`
      );
    }

    const existingOrders =
      await existingOrdersResponse.json();

    const duplicateOrder =
      existingOrders.data?.find(
        (order) =>
          order.external_id === session.id
      );

    if (duplicateOrder) {
      console.log(
        "Printify order already exists — skipping duplicate"
      );

      return res.status(200).json({
        received: true,
        fulfillment: "duplicate_skipped",
      });
    }

    /*
      CREATE PRINTIFY ORDER
    */
    const printifyResponse = await fetch(
      `https://api.printify.com/v1/shops/${SHOP_ID}/orders.json`,
      {
        method: "POST",

        headers: {
          Authorization: `Bearer ${process.env.PRINTIFY_API_TOKEN}`,
          "Content-Type": "application/json",
          "User-Agent": "Dad Standard Co",
        },

        body: JSON.stringify(printifyOrder),
      }
    );

    const printifyResult =
      await printifyResponse.json();

    if (!printifyResponse.ok) {
      console.error(
        "Printify order creation failed:",
        printifyResult
      );

      return res.status(500).json({
        error: "Printify order creation failed",
        details: printifyResult,
      });
    }

    console.log(
      "PRINTIFY ORDER CREATED:",
      printifyResult
    );

    return res.status(200).json({
      received: true,
      fulfillment: "created",
      printifyOrderId:
        printifyResult.id || null,
    });
  } catch (error) {
    console.error(
      "Printify fulfillment failed:",
      error
    );

    return res.status(500).json({
      error:
        error.message ||
        "Printify fulfillment failed",
    });
  }
}