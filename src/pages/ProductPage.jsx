import { useState } from "react";
import { useParams } from "react-router-dom";
import products from "../data/products";

function ProductPage() {
  const { id } = useParams();

  const product = products.find(
    (product) => String(product.id) === id
  );

  const [selectedImage, setSelectedImage] = useState(product?.image);

  if (!product) {
    return <h1>Product not found</h1>;
  }

  return (
    <main className="product-page">
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

<img
  className="product-page__main-image"
  src={selectedImage}
  alt={product.name}
/>

      <div className="product-page__info">
        <h1>{product.name}</h1>
        <p>{product.price}</p>
      </div>
    </main>
  );
}

export default ProductPage;