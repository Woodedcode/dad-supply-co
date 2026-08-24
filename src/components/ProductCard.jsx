import { useState } from "react";

function ProductCard({ name, price, image, addToCart, sizes }) {
  const [added, setAdded] = useState(false);
  const [selectedSize, setSelectedSize] = useState("");
  const [sizeError, setSizeError] = useState(false);

  return (
    <>
      <article className="product-card">
        <figure className="product-card__image">
          <img src={image} alt={name} />
        </figure>

        <div className="product-card__info">
          <h3>{name}</h3>
          <p>{price}</p>
          {sizes && (
            <select
              value={selectedSize}
              onChange={(event) => setSelectedSize(event.target.value)}
            >
              <option value="">Select Size</option>

              {sizes.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          )}
          {sizeError && (
            <p className="product-card__size-error">
              Please select a size first.
            </p>
          )}
          <button
            onClick={() => {
              if (sizes && !selectedSize) {
                setSizeError(true);

                setTimeout(() => {
                  setSizeError(false);
                }, 2000);

                return;
              }

              addToCart(selectedSize);
              setAdded(true);
              setSizeError(false);
              setSelectedSize("")

              setTimeout(() => {
                setAdded(false);
              }, 1500);
            }}
          >
            {added ? "✓ Added!" : "Add to Cart"}
          </button>
        </div>
      </article>
    </>
  );
}

export default ProductCard;
