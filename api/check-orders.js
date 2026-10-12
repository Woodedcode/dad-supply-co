
import Stripe from "stripe";
import { supabase } from "./supabase.js";
import { sendOrderAlert } from "../lib/send-order-alert.js";

const LOOKBACK_HOURS = 72;
const GRACE_MINUTES = 30;

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  // Only allow authorized scheduled checks.
  if (
    !process.env.CRON_SECRET ||
    req.headers.authorization !==
      `Bearer ${process.env.CRON_SECRET}`
  ) {
    return res.status(401).json({
      error: "Unauthorized",
    });
  }

  try {
    const now = Date.now();
    const cutoff = Math.floor(
      (now - LOOKBACK_HOURS * 3600000) / 1000
    );

    const graceDate = new Date(
      now - GRACE_MINUTES * 60000
    ).toISOString();

    const stripe = new Stripe(
      process.env.STRIPE_SECRET_KEY
    );

    const paidSessions = [];

    // Find paid Stripe checkouts from the last 72 hours.
    for await (const session of stripe.checkout.sessions.list({
      limit: 100,
      created: { gte: cutoff },
    })) {
      if (
        session.mode !== "payment" ||
        session.payment_status !== "paid"
      ) {
        continue;
      }

      // Allow time for normal webhook processing.
      if (
        session.created * 1000 >
        now - GRACE_MINUTES * 60000
      ) {
        continue;
      }

      // Skip fully refunded Stripe payments
const paymentIntentId =
  typeof session.payment_intent === "string"
    ? session.payment_intent
    : session.payment_intent?.id;

if (!paymentIntentId) {
  throw new Error(
    `Missing PaymentIntent for ${session.id}`
  );
}

const paymentIntent = await stripe.paymentIntents.retrieve(
  paymentIntentId,
  { expand: ["latest_charge"] }
);

const charge = paymentIntent.latest_charge;

if (!charge || typeof charge === "string") {
  throw new Error(
    `Cannot verify refund status for ${session.id}`
  );
}

if (
  charge.refunded ||
  charge.amount_refunded >= charge.amount
) {
  continue;
}

      paidSessions.push(session);

      if (paidSessions.length > 1000) {
        throw new Error(
          "Too many Stripe sessions to check safely"
        );
      }
    }

    const problems = [];

    // Compare Stripe payments against Supabase.
    for (let i = 0; i < paidSessions.length; i += 50) {
      const batch = paidSessions.slice(i, i + 50);
      const ids = batch.map((session) => session.id);

      const { data, error } = await supabase
        .from("orders")
        .select(
          "stripe_session_id,status,printify_order_id"
        )
        .in("stripe_session_id", ids);

      if (error) throw error;

      const ordersById = new Map(
        (data || []).map((order) => [
          order.stripe_session_id,
          order,
        ])
      );

      for (const session of batch) {
        const order = ordersById.get(session.id);

        if (!order) {
          problems.push(
            `${session.id}: Paid in Stripe but missing in Supabase`
          );
        } else if (
          !["submitted", "fulfilled"].includes(
            order.status
          ) ||
          !order.printify_order_id
        ) {
          problems.push(
            `${session.id}: Status ${order.status}; no confirmed Printify submission`
          );
        }
      }
    }

    // Find unresolved Supabase orders, including older ones.
    const { data: stuckOrders, error: stuckError } =
      await supabase
        .from("orders")
        .select("stripe_session_id,status,created_at")
        .in("status", [
          "pending",
          "processing",
          "failed",
          "needs_review",
        ])
        .lt("created_at", graceDate)
        .limit(1000);

    if (stuckError) throw stuckError;

    if ((stuckOrders || []).length === 1000) {
      throw new Error(
        "Too many unresolved orders to check safely"
      );
    }

    for (const order of stuckOrders || []) {
      const prefix = `${order.stripe_session_id}:`;

      if (
        !problems.some((problem) =>
          problem.startsWith(prefix)
        )
      ) {
        problems.push(
          `${prefix} Database status ${order.status}`
        );
      }
    }

    // Send an email if anything needs attention.
    if (problems.length > 0) {
      await sendOrderAlert(
        `URGENT: ${problems.length} Dad Standard Co. order issue(s)`,
        `These orders need manual review.

Do not retry fulfillment without checking Printify first.

${problems.join("\n")}`
      );
    }

    console.log("Daily order check completed:", {
      paidSessions: paidSessions.length,
      issues: problems.length,
    });

    return res.status(200).json({
      checked: paidSessions.length,
      issues: problems.length,
    });
  } catch (error) {
    console.error(
      "Daily order check failed:",
      error.message
    );

    try {
      await sendOrderAlert(
        "URGENT: Dad Standard Co. monitoring failed",
        `The daily order check could not complete.

Error: ${error.message}`
      );
    } catch (emailError) {
      console.error(
        "Monitoring alert failed:",
        emailError.message
      );
    }

    return res.status(500).json({
      error: "Order check failed",
    });
  }
}
