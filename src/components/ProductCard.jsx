

function ProductCard({name, price, image, addToCart}) {
 
    return (
    <>
      <article className="product-card">
        <figure className="product-card__image">
          <img src={image} alt={name} />
        </figure>

        <div className="product-card__info">
          <h3>{name}</h3>
          <p>{price}</p>
          <button onClick={addToCart}>Add to Cart</button>
        </div>
      </article>
    </>
  );
}

export default ProductCard;
