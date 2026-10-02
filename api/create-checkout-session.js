import Stripe from "stripe";
import {
  PRINTIFY_PRODUCT_ID,
  PRINTIFY_VARIANTS,
} from "./printify-config.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const SHOP_ID = "29064058";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    const { cartItems } = req.body;

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({
        error: "Cart is empty",
      });
    }

    // Get the current product information directly from Printify
    const printifyResponse = await fetch(
      `https://api.printify.com/v1/shops/${SHOP_ID}/products/${PRINTIFY_PRODUCT_ID}.json`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PRINTIFY_API_TOKEN}`,
          "User-Agent": "Dad Standard Co",
        },
      },
    );

    if (!printifyResponse.ok) {
      return res.status(500).json({
        error: "Could not get current Printify pricing",
      });
    }

    const printifyProduct = await printifyResponse.json();

    const lineItems = cartItems.map((item) => {
      const variantId = PRINTIFY_VARIANTS[item.size];

      if (!variantId) {
        throw new Error(`Invalid shirt size: ${item.size}`);
      }

      const variant = printifyProduct.variants?.find(
        (printifyVariant) => printifyVariant.id === variantId,
      );

      if (!variant) {
        throw new Error(
          `Printify variant not found for size ${item.size}`,
        );
      }

      const quantity = Number(item.quantity);

      if (!Number.isInteger(quantity) || quantity < 1) {
        throw new Error("Invalid quantity");
      }

      return {
        price_data: {
          currency: "usd",

          product_data: {
            name: "Dad Standard Tee",
            description: `Size: ${item.size}`,

            metadata: {
              productKey: "dad-standard-tee",
              size: item.size,
            },
          },

          // Printify already gives us the price in cents
          unit_amount: variant.price,
        },

        quantity,
      };
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",

      line_items: lineItems,

      shipping_address_collection: {
        allowed_countries: ["US"],
      },

      success_url:
        "https://www.dadstandardco.com/order-confirmation",

      cancel_url:
        "https://www.dadstandardco.com/cart",
    });

    return res.status(200).json({
      url: session.url,
    });
  } catch (error) {
    console.error("Checkout creation failed:", error);

    return res.status(500).json({
      error: "Could not create checkout session",
    });
  }
}