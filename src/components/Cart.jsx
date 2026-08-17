

function Cart({cartItems}) {
    return (
        <section className="cart-preview">
            <h2>Your Cart</h2>

            {cartItems.map((item, index) =>(
                <div key={index}>
                    <p>{item.name}</p>
                    <p>{item.price}</p>
                </div>
            ))}
        </section>
    );
}

export default Cart;