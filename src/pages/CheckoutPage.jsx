import {useState} from 'react';


function CheckoutPage({cartItems}) {
    const [orderPlaced, setOrderPlaced] = useState(false)

    const subtotal = cartItems.reduce((total, item) => {
        return total + parseFloat(item.price.replace("$","")) * item.quantity;
    }, 0)

    const handleSubmit = (event) => {
        event.preventDefault();
        setOrderPlaced(true)
    };

    if (orderPlaced) {
            return (
                <section className="checkout-page">
                    <div className="checkout-page__header">
                        <p>ORDER CONFIRMED</p>
                        <h1>Dad Duty Complete.</h1>
                    </div>
                    <p>Your order has been placed successfully.</p>
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
        <form action="" id="checkout-form" onSubmit={handleSubmit} className="checkout-form">
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
            <input type="text" placeholder="Dallas" required />
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
