import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  const { cartItems } = req.body;
  const lineItems = cartItems.map((item) => ({
    price_data: {
      currency: "usd",
      product_data: {
        name: item.name,
        description: `Size: ${item.size}`,
      },
      unit_amount: Math.round(parseFloat(item.price.replace("$", "")) * 100),
    },
    quantity: item.quantity,
  }));
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: lineItems,
    success_url: "https://www.dadstandardco.com/order-confirmation",
    cancel_url: "https://www.dadstandardco.com/cart",
  });

  res.status(200).json({ url: session.url });
}
