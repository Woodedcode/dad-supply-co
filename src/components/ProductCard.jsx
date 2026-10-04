import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function ProductCard({ name, image, id, printifyProductId }) {
  const [price, setPrice] = useState(null);

  useEffect(() => {
    async function getPrintifyPrice() {
      if (!printifyProductId) {
        console.error(`No Printify product ID found for ${name}`);
        return;
      }

      try {
        const response = await fetch(
          `/api/printify-products?productId=${printifyProductId}`,
        );

        if (!response.ok) {
          throw new Error("Could not load Printify pricing");
        }

        const data = await response.json();

        setPrice(data.price);
      } catch (error) {
        console.error("Price fetch failed:", error);
      }
    }

    getPrintifyPrice();
  }, [printifyProductId, name]);

  return (
    <Link to={`/products/${id}`} className="product-card-link">
      <article className="product-card">
        <figure className="product-card__image">
          <img
            src={image}
            alt={name}
            loading="lazy"
          />
        </figure>

        <div className="product-card__info">
          <h3>{name}</h3>

          <p>
            {price !== null
              ? `$${price.toFixed(2)}`
              : "Loading price..."}
          </p>
        </div>
      </article>
    </Link>
  );
}

export default ProductCard;