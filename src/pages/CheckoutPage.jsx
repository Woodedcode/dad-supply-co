import {useState} from 'react';
import {Link} from "react-router-dom";


function CheckoutPage({cartItems, clearCart}) {
    const [orderPlaced, setOrderPlaced] = useState(false)

    const subtotal = cartItems.reduce((total, item) => {
        return total + parseFloat(item.price.replace("$","")) * item.quantity;
    }, 0)

    const handleSubmit = (event) => {
        event.preventDefault();

        clearCart();
        setOrderPlaced(true)
    };

    if (orderPlaced) {
            return (
                <section className="checkout-page">
                    <div className="checkout-confirmation">
                        <p className="order-confirmation__eyebrow">
                            ORDER CONFIRMED
                        </p>

                        <h1>Dad Duty Complete</h1>

                        <p className="order-confirmation__message">
                            Your order have been placed successfully.
                        </p>

                        <p className="order-confirmation__subtext">
                            Your dad gear secured. Mission accomplished.
                        </p>

                        <Link to="/" className="order-confirmation__link">
                            Continue Shopping
                        </Link>
                    </div>
                </section>
            );
        }
  return (
    <section className="checkout-page">
      <div className="checkout-page__header">
        <p>ALMOST THERE</p>
        <h1>Checkout</h1>
      </div>
      <div className="checkout-layout">
        <form id="checkout-form" onSubmit={handleSubmit} className="checkout-form">
          <h2>Contact Information</h2>

          <label>
            Email
            <input type="email" placeholder="Dad@email.com" required/>
          </label>

          <label>
            Full Name
            <input type="text" placeholder="John Dad" required />
          </label>

          <label>
            Address
            <input type="text" placeholder="123 Dad Street" required />
          </label>

          <label>
            City
            <input type="text" placeholder="State" required />
          </label>

          <label>
            Zip Code
            <input type="text" placeholder="75000" required />
          </label>
          <button type="submit" className="checkout-summary__button">
            Place Order
          </button>
        </form>

        <aside className="checkout-summary">
          <h2>Order Summary</h2>
          {cartItems.map((item,index) =>(
            <div className="checkout-summary__item" key={index}>
                <p>{item.name}</p>
                <p>Qty: {item.quantity}</p>
                <p>{item.price}</p>
            </div>
          ))}
          <div className="checkout-summary__total">
            <p>Subtotal</p>
            <p>${subtotal.toFixed(2)}</p>
          </div>
        </aside>
      </div>
    </section>
  );
}

export default CheckoutPage;
