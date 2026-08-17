import Cart from "../components/Cart"

function CartPage({cartItems,removeFromCart}) {
    return (
        <section className="cart-page">
            <div className="cart-page__header">
                <p>YOUR GEAR</p>
                <h1>Your Cart</h1>
            </div>
            <Cart cartItems={cartItems} removeFromCart={removeFromCart}/>
        </section>
    );
}

export default CartPage