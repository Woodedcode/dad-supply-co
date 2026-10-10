import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const SHOP_ID = "29064058";

export default async function handler(req, res) {

  // Temporarily pause checkout during fulfillment testing
  if (process.env.CHECKOUT_ENABLED !== "true") {
    return res.status(503).json({
      error: "Checkout is temporarily unavailable. Please check back soon.",
    });
  }

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

    const productCache = new Map();
    const lineItems = [];

    for (const item of cartItems) {
      const printifyProductId = item.printifyProductId;

      if (!printifyProductId) {
        throw new Error(
          `Missing Printify product ID for ${item.name}`,
        );
      }

      let printifyProduct =
        productCache.get(printifyProductId);

      if (!printifyProduct) {
        const printifyResponse = await fetch(
          `https://api.printify.com/v1/shops/${SHOP_ID}/products/${printifyProductId}.json`,
          {
            headers: {
              Authorization: `Bearer ${process.env.PRINTIFY_API_TOKEN}`,
              "User-Agent": "Dad Standard Co",
            },
          },
        );

        if (!printifyResponse.ok) {
          throw new Error(
            `Could not load Printify product: ${item.name}`,
          );
        }

        printifyProduct =
          await printifyResponse.json();

        productCache.set(
          printifyProductId,
          printifyProduct,
        );
      }

      /*
        FIND SIZE OPTION
      */

      const sizeOption =
        printifyProduct.options?.find((option) =>
          option.name?.toLowerCase().includes("size"),
        );

      let variant;

      /*
        REGULAR SIZED PRODUCTS
      */

      if (sizeOption && item.size) {
        const selectedSizeValue =
          sizeOption.values?.find(
            (value) =>
              value.title?.toLowerCase() ===
              item.size.toLowerCase(),
          );

        if (!selectedSizeValue) {
          throw new Error(
            `Size ${item.size} was not found for ${item.name}`,
          );
        }

        variant =
          printifyProduct.variants?.find(
            (printifyVariant) =>
              printifyVariant.options?.includes(
                selectedSizeValue.id,
              ) &&
              printifyVariant.is_enabled !== false &&
              printifyVariant.is_available !== false,
          );
      }

      /*
        ONE SIZE PRODUCTS
      */

      if (!variant && item.size === "One Size") {
        variant =
          printifyProduct.variants?.find(
            (printifyVariant) =>
              printifyVariant.is_enabled !== false &&
              printifyVariant.is_available !== false,
          );
      }

      if (!variant) {
        throw new Error(
          `Could not find a valid Printify variant for ${item.name}, size ${item.size}`,
        );
      }

      /*
        VERIFY QUANTITY
      */

      const quantity = Number(item.quantity);

      if (
        !Number.isInteger(quantity) ||
        quantity < 1
      ) {
        throw new Error(
          `Invalid quantity for ${item.name}`,
        );
      }

      /*
        BUILD STRIPE ITEM
      */

      lineItems.push({
        price_data: {
          currency: "usd",

          product_data: {
            name:
              item.name ||
              printifyProduct.title ||
              "Dad Standard Co. Product",

            description: item.size
              ? `Size: ${item.size}`
              : undefined,

            metadata: {
              printifyProductId,
              printifyVariantId: String(
                variant.id,
              ),
              size: item.size || "",
            },
          },

          // Printify returns price in cents
          unit_amount: variant.price,
        },

        quantity,
      });
    }

    /*
      CREATE STRIPE CHECKOUT SESSION
    */

    const session =
      await stripe.checkout.sessions.create({
        mode: "payment",

        line_items: lineItems,

        shipping_address_collection: {
          allowed_countries: ["US"],
        },

        phone_number_collection: {
          enabled: true,
        },

        success_url:
          "https://www.dadstandardco.com/order-confirmation",

        cancel_url:
          "https://www.dadstandardco.com/cart",
      });

    /*
      SEND STRIPE CHECKOUT URL BACK TO SITE
    */

    return res.status(200).json({
      url: session.url,
    });
  } catch (error) {
    console.error(
      "Checkout creation failed:",
      error,
    );

    return res.status(500).json({
      error:
        error.message ||
        "Could not create checkout session",
    });
  }
}