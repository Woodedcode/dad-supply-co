import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import products from "../data/products";
import ProductInfoTabs from "../components/ProductInfoTabs";

function ProductPage({ addToCart }) {
  const { id } = useParams();

  const product = products.find(
    (product) => String(product.id) === id,
  );

  const [selectedImage, setSelectedImage] = useState(product?.image);

  const [selectedSize, setSelectedSize] = useState(
    product?.sizes?.length === 1 &&
      product.sizes[0] === "One Size"
      ? "One Size"
      : "",
  );

  const [added, setAdded] = useState(false);
  const [sizeError, setSizeError] = useState(false);
  const [selectedDadSize, setSelectedDadSize] = useState("");
  const [selectedKidSize, setSelectedKidSize] = useState("");

  const [printifyPrice, setPrintifyPrice] = useState(null);
  const [printifyPrices, setPrintifyPrices] = useState({});

  useEffect(() => {
    async function getPrintifyPrice() {
      try {
        const response = await fetch("/api/printify-products");

        if (!response.ok) {
          throw new Error("Could not load Printify pricing");
        }

        const data = await response.json();

        setPrintifyPrice(data.price);
        setPrintifyPrices(data.prices || {});
      } catch (error) {
        console.error("Price fetch failed:", error);
      }
    }

    getPrintifyPrice();
  }, []);

  if (!product) {
    return <h1>Product not found</h1>;
  }

  const currentPrice =
    selectedSize && printifyPrices[selectedSize]
      ? printifyPrices[selectedSize]
      : printifyPrice;

  const handleAddToCart = () => {
    if (product.type === "matching-set") {
      if (!selectedDadSize || !selectedKidSize) {
        setSizeError(true);
        return;
      }

      addToCart({
        ...product,
        dadSize: selectedDadSize,
        kidSize: selectedKidSize,
        price: currentPrice,
      });
    } else {
      if (!selectedSize) {
        setSizeError(true);
        return;
      }

      addToCart({
        ...product,
        size: selectedSize,
        price: currentPrice,
      });
    }

    setAdded(true);
    setSizeError(false);

    setTimeout(() => {
      setAdded(false);
    }, 1500);
  };

  return (
    <main className="product-page">
      <div className="product-page__images">
        {product.backImage && (
          <div className="product-page__thumbnails">
            <button
              type="button"
              onClick={() => setSelectedImage(product.image)}
            >
              <img
                src={product.image}
                alt={`${product.name} front`}
              />
            </button>

            <button
              type="button"
              onClick={() => setSelectedImage(product.backImage)}
            >
              <img
                src={product.backImage}
                alt={`${product.name} back`}
              />
            </button>
          </div>
        )}

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
          {currentPrice !== null
            ? `$${currentPrice.toFixed(2)}`
            : "Loading price..."}
        </p>

        {product.sizes?.[0] === "One Size" && (
          <p className="product-page__one-size">
            One Size
          </p>
        )}

        {product.sizes?.[0] !== "One Size" && (
          <>
            {product.type === "matching-set" ? (
              <>
                <label>Dad Shirt Size</label>

                <select
                  value={selectedDadSize}
                  onChange={(e) => {
                    setSelectedDadSize(e.target.value);
                    setSizeError(false);
                  }}
                >
                  <option value="">
                    Select Dad Size
                  </option>

                  {product.dadSizes.map((size) => (
                    <option
                      key={size}
                      value={size}
                    >
                      {size}
                    </option>
                  ))}
                </select>

                <label>Baby Onesie Size</label>

                <select
                  value={selectedKidSize}
                  onChange={(e) => {
                    setSelectedKidSize(e.target.value);
                    setSizeError(false);
                  }}
                >
                  <option value="">
                    Select Baby Size
                  </option>

                  {product.kidSizes.map((size) => (
                    <option
                      key={size}
                      value={size}
                    >
                      {size}
                    </option>
                  ))}
                </select>
              </>
            ) : (
              <>
                <label>Size</label>

                <select
                  value={selectedSize}
                  onChange={(e) => {
                    setSelectedSize(e.target.value);
                    setSizeError(false);
                  }}
                >
                  <option value="">
                    Select Size
                  </option>

                  {product.sizes.map((size) => (
                    <option
                      key={size}
                      value={size}
                    >
                      {size}
                    </option>
                  ))}
                </select>
              </>
            )}
          </>
        )}

        {sizeError && (
          <p className="product-page__size-error">
            Please select a size first.
          </p>
        )}

        <button
          className="product-page__add-button"
          onClick={handleAddToCart}
        >
          {added
            ? "✓ Added to Cart!"
            : "Add to Cart"}
        </button>

        <ProductInfoTabs product={product} />
      </div>
    </main>
  );
}

export default ProductPage;