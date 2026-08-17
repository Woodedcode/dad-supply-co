import { Link } from "react-router-dom";

function Cart({ cartItems, removeFromCart, increaseQuantity }) {
  const subtotal = cartItems.reduce((total, item) => {
    return total + parseFloat(item.price.replace("$", "")) * item.quantity;
  }, 0);

  return (
    <section className="cart-preview">
      {cartItems.length === 0 && (
        <>
          <p className="cart-empty">Your cart is empty.</p>
          <Link to="/" className="cart-empty__link">
            Continue Shopping
          </Link>
        </>
      )}
      {cartItems.map((item, index) => (
        <div className="cart-item" key={index}>
          <img src={item.image} alt={item.name} className="cart-item__image" />

          <div>
            <p className="cart-item__para-name">{item.name}</p>
            <p className="cart-price">{item.price}</p>
            <div className="cart-item__controls">
                <button
              className="cart-item__quantity"
              onClick={() => removeFromCart(index)}
            >
              -
            </button>
            <p className="cart-quantity">{item.quantity}</p>
            <button
              className="cart-item__quantity"
              onClick={() => increaseQuantity(index)}
            >
              +
            </button>
            </div>
          </div>
        </div>
      ))}
      {cartItems.length > 0 && (
        <div className="cart-summary">
          <div className="cart-summary__total">
            <p>Subtotal</p>
            <p>${subtotal.toFixed(2)}</p>
          </div>
          <button className="cart-summary__checkout">Checkout</button>
        </div>
      )}
    </section>
  );
}

export default Cart;
