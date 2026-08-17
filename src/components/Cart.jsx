

function Cart({cartItems}) {
    return (
        <section className="cart-preview">
            {cartItems.length === 0 && (
                <p className="cart-empty">Your cart is empty.</p>
            )}
            {cartItems.map((item, index) =>(
                <div className="cart-item" key={index}>
                    <img src={item.image}
                    alt={item.name} 
                    className="cart-item__image"
                    />

                    <div>
                        <p>{item.name}</p>
                        <p>{item.price}</p>
                    </div>
                </div>
            ))}
        </section>
    );
}

export default Cart;