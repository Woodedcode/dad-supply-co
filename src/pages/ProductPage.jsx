import { useState } from "react";
import { useParams } from "react-router-dom";
import products from "../data/products";

function ProductPage({ addToCart }) {
  const { id } = useParams();

  const product = products.find(
    (product) => String(product.id) === id
  );

  const [selectedImage, setSelectedImage] = useState(product?.image);
  const [selectedSize, setSelectedSize] = useState("");
  const [added, setAdded] = useState(false);
  const [sizeError, setSizeError] = useState(false);

  if (!product) {
    return <h1>Product not found</h1>;
  }

  return (
    <main className="product-page">
      <div className="product-page__images">

        <div className="product-page__thumbnails">
          <button onClick={() => setSelectedImage(product.image)}>
            <img
              src={product.image}
              alt={`${product.name} front`}
            />
          </button>

          {product.backImage && (
            <button onClick={() => setSelectedImage(product.backImage)}>
              <img
                src={product.backImage}
                alt={`${product.name} back`}
              />
            </button>
          )}
        </div>

        <div className="product-page__main-image-wrap">
          <img
            className="product-page__main-image"
            src={selectedImage}
            alt={product.name}
          />
        </div>

      </div>

      <div className="product-page__info">
        <h1>{product.name}</h1>

        <p className="product-page__price">
          {product.price}
        </p>

        <p className="product-page__description">
          {product.description}
        </p>

        <label htmlFor="product-size">
          Size
        </label>

        <select
          id="product-size"
          value={selectedSize}
          onChange={(event) => {
            setSelectedSize(event.target.value);
            setSizeError(false);
          }}
        >
          <option value="">Select Size</option>

          {product.sizes?.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>

        {sizeError && (
          <p className="product-page__size-error">
            Please select a size first.
          </p>
        )}

        <button
          className="product-page__add-button"
          onClick={() => {
            if (!selectedSize) {
              setSizeError(true);
              return;
            }

            addToCart({
              ...product,
              size: selectedSize,
            });

            setAdded(true);
            setSizeError(false);

            setTimeout(() => {
              setAdded(false);
            }, 1500);
          }}
        >
          {added ? "✓ Added to Cart!" : "Add to Cart"}
        </button>

      </div>
    </main>
  );
}

export default ProductPage;