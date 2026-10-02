import {
  PRINTIFY_PRODUCT_ID,
  PRINTIFY_VARIANTS,
} from "./printify-config.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    const response = await fetch(
      "https://api.printify.com/v1/shops/29064058/products.json",
      {
        headers: {
          Authorization: `Bearer ${process.env.PRINTIFY_API_TOKEN}`,
          "User-Agent": "Dad Standard Co",
        },
      },
    );

    if (!response.ok) {
      return res.status(response.status).json({
        error: "Could not fetch Printify products",
      });
    }

    const data = await response.json();

    const product = data.data?.find(
      (item) => item.id === PRINTIFY_PRODUCT_ID,
    );

    if (!product) {
      return res.status(404).json({
        error: "Dad Standard Tee not found",
      });
    }

    const prices = {};

    for (const [size, variantId] of Object.entries(
      PRINTIFY_VARIANTS,
    )) {
      const variant = product.variants?.find(
        (item) => item.id === variantId,
      );

      if (variant) {
        prices[size] = variant.price / 100;
      }
    }

    const priceValues = Object.values(prices);

    return res.status(200).json({
      id: product.id,
      name: "Dad Standard Tee",
      price:
        priceValues.length > 0
          ? Math.min(...priceValues)
          : null,
      prices,
    });
  } catch (error) {
    console.error("Printify products error:", error);

    return res.status(500).json({
      error: "Could not connect to Printify",
    });
  }
}