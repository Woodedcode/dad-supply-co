import { useEffect } from "react";
import { Link } from "react-router-dom";

function OrderConfirmationPage({ clearCart }) {
  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <section className="checkout-page">
      <div className="checkout-confirmation">
        <p className="order-confirmation__eyebrow">ORDER CONFIRMED</p>

        <h1>Dad Duty Complete</h1>

        <p className="order-confirmation__message">
          Your order has been placed successfully.
        </p>

        <p className="order-confirmation__subtext">
          Your dad gear is secured. Mission accomplished.
        </p>

        <Link to="/" className="order-confirmation__link">
          Continue Shopping
        </Link>
      </div>
    </section>
  );
}

export default OrderConfirmationPage;