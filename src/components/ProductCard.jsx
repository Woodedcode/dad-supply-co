import { Link } from "react-router-dom";

function ProductCard({ name, price, image, id }) {
  return (
    <Link to={`/products/${id}`} className="product-card-link">
      <article className="product-card">
        <figure className="product-card__image">
          <img src={image} alt={name} />
        </figure>

        <div className="product-card__info">
          <h3>{name}</h3>
          <p>{price}</p>
        </div>
      </article>
    </Link>
  );
}

export default ProductCard;