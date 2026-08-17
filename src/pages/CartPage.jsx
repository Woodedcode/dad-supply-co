import Cart from "../components/Cart"

function CartPage({cartItems,removeFromCart,increaseQuantity, removeItem}) {
    return (
        <section className="cart-page">
            <div className="cart-page__header">
                <p>YOUR GEAR</p>
                <h1>Your Cart</h1>
            </div>
            <Cart cartItems={cartItems} removeFromCart={removeFromCart} increaseQuantity={increaseQuantity} removeItem={removeItem}/>
        </section>
    );
}

export default CartPage