export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  const { productId } = req.query;

  if (!productId) {
    return res.status(400).json({
      error: "Missing Printify product ID",
    });
  }

  try {
    const response = await fetch(
      `https://api.printify.com/v1/shops/29064058/products/${productId}.json`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PRINTIFY_API_TOKEN}`,
          "User-Agent": "Dad Standard Co",
        },
      },
    );

    if (!response.ok) {
      return res.status(response.status).json({
        error: "Could not fetch Printify product",
      });
    }

    const product = await response.json();

    /*
      -------------------------
      LIVE SIZE PRICES
      -------------------------
    */

    const prices = {};

    const sizeOption = product.options?.find(
      (option) =>
        option.type === "size" ||
        option.name?.toLowerCase().includes("size"),
    );

    const sizeLookup = {};

    if (sizeOption) {
      sizeOption.values.forEach((value) => {
        sizeLookup[value.id] = value.title;
      });
    }

    product.variants
      ?.filter((variant) => variant.is_enabled !== false)
      .forEach((variant) => {
        const sizeId = variant.options?.find(
          (optionId) => sizeLookup[optionId],
        );

        const size = sizeLookup[sizeId];

        if (!size) {
          return;
        }

        const variantPrice = variant.price / 100;

        if (
          prices[size] === undefined ||
          variantPrice < prices[size]
        ) {
          prices[size] = variantPrice;
        }
      });

    /*
      -------------------------
      PRINTIFY MOCKUP IMAGES
      -------------------------
    */

    const images = product.images || [];

    const frontImage =
      images.find(
        (image) =>
          image.position === "front" &&
          image.is_default,
      )?.src ||
      images.find(
        (image) => image.position === "front",
      )?.src ||
      images.find(
        (image) => image.is_default,
      )?.src ||
      images[0]?.src ||
      null;

    const backImage =
      images.find(
        (image) =>
          image.position === "back" &&
          image.is_default,
      )?.src ||
      images.find(
        (image) => image.position === "back",
      )?.src ||
      null;

    const priceValues = Object.values(prices);

    return res.status(200).json({
      id: product.id,

      name: product.title,

      price:
        priceValues.length > 0
          ? Math.min(...priceValues)
          : null,

      prices,

      frontImage,

      backImage,

      images: images.map((image) => ({
        src: image.src,
        position: image.position,
        isDefault: image.is_default,
      })),
    });
  } catch (error) {
    console.error("Printify product error:", error);

    return res.status(500).json({
      error: "Could not connect to Printify",
    });
  }
}