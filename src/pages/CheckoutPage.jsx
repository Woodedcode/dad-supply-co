import { Link } from "react-router-dom";

function CheckoutPage({ cartItems }) {
  const getNumericPrice = (price) => {
    if (typeof price === "number") {
      return price;
    }

    return parseFloat(String(price).replace("$", "")) || 0;
  };

  const formatPrice = (price) => {
    return `$${getNumericPrice(price).toFixed(2)}`;
  };

  const subtotal = cartItems.reduce((total, item) => {
    return total + getNumericPrice(item.price) * item.quantity;
  }, 0);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cartItems }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Checkout error:", error);
    }
  };

  return (
    <section className="checkout-page">
      <div className="checkout-page__header">
        <p>ALMOST THERE</p>
        <h1>Checkout</h1>
      </div>

      <div className="checkout-layout">
        <form
          id="checkout-form"
          onSubmit={handleSubmit}
          className="checkout-form"
        >
          <h2>Contact Information</h2>

          <label>
            Email
            <input
              type="email"
              placeholder="Dad@email.com"
              required
            />
          </label>

          <label>
            Full Name
            <input
              type="text"
              placeholder="John Dad"
              required
            />
          </label>

          <label>
            Address
            <input
              type="text"
              placeholder="123 Dad Street"
              required
            />
          </label>

          <label>
            City
            <input
              type="text"
              placeholder="City"
              required
            />
          </label>

          <label>
            State
            <input
              type="text"
              placeholder="State"
              required
            />
          </label>

          <label>
            Zip Code
            <input
              type="text"
              placeholder="75000"
              required
            />
          </label>

          <button
            type="submit"
            className="checkout-summary__button"
          >
            Place Order
          </button>
        </form>

        <aside className="checkout-summary">
          <h2>Order Summary</h2>

          {cartItems.map((item, index) => (
            <div
              className="checkout-summary__item"
              key={index}
            >
              <p>{item.name}</p>

              {item.size && (
                <p>Size: {item.size}</p>
              )}

              {item.dadSize && (
                <p>Dad Size: {item.dadSize}</p>
              )}

              {item.kidSize && (
                <p>Baby Size: {item.kidSize}</p>
              )}

              <p>Qty: {item.quantity}</p>

              <p>{formatPrice(item.price)}</p>
            </div>
          ))}

          <div className="checkout-summary__total">
            <p>Subtotal</p>
            <p>${subtotal.toFixed(2)}</p>
          </div>

          <Link to="/cart">
            Back to Cart
          </Link>
        </aside>
      </div>
    </section>
  );
}

export default CheckoutPage;