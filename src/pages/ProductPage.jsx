import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import products from "../data/products";
import ProductInfoTabs from "../components/ProductInfoTabs";

function ProductPage({ addToCart }) {
  const { id } = useParams();

  const product = products.find(
    (product) => String(product.id) === id
  );

  const getLocalPrice = (price) => {
    if (!price) return null;

    const parsedPrice = parseFloat(
      String(price).replace("$", "")
    );

    return Number.isNaN(parsedPrice)
      ? null
      : parsedPrice;
  };

  const [selectedImage, setSelectedImage] = useState(
    product?.image
  );

  const [selectedSize, setSelectedSize] = useState(
    product?.sizes?.length === 1 &&
      product.sizes[0] === "One Size"
      ? "One Size"
      : ""
  );

  const [added, setAdded] = useState(false);
  const [sizeError, setSizeError] = useState(false);

  const [selectedDadSize, setSelectedDadSize] =
    useState("");

  const [selectedKidSize, setSelectedKidSize] =
    useState("");

  /*
    Start with the local price from products.js.

    This makes the price appear immediately instead of
    showing "Loading price..." while Printify responds.
  */
  const [printifyPrice, setPrintifyPrice] = useState(
    () => getLocalPrice(product?.price)
  );

  const [printifyPrices, setPrintifyPrices] = useState(
    {}
  );

  /*
    Reset product-specific information whenever
    the customer switches to another product.
  */
  useEffect(() => {
    if (!product) return;

    setSelectedImage(product.image);

    setSelectedSize(
      product.sizes?.length === 1 &&
        product.sizes[0] === "One Size"
        ? "One Size"
        : ""
    );

    setSelectedDadSize("");
    setSelectedKidSize("");
    setSizeError(false);
    setAdded(false);

    /*
      Immediately show the local fallback price.
    */
    setPrintifyPrice(
      getLocalPrice(product.price)
    );

    setPrintifyPrices({});
  }, [product?.id]);

  /*
    Get the live price from Printify.
  */
  useEffect(() => {
    if (!product?.printifyProductId) {
      return;
    }

    const controller = new AbortController();

    async function getPrintifyPrice() {
      try {
        const response = await fetch(
          `/api/printify-products?productId=${product.printifyProductId}`,
          {
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error(
            "Could not load Printify pricing"
          );
        }

        const data = await response.json();

        /*
          Update the main price only if Printify
          actually returned one.
        */
        if (data.price !== undefined && data.price !== null) {
          const livePrice = Number(data.price);

          if (!Number.isNaN(livePrice)) {
            setPrintifyPrice(livePrice);
          }
        }

        /*
          Store individual size prices if available.
        */
        if (data.prices) {
          const normalizedPrices = {};

          Object.entries(data.prices).forEach(
            ([size, price]) => {
              const numericPrice = Number(price);

              if (!Number.isNaN(numericPrice)) {
                normalizedPrices[size] =
                  numericPrice;
              }
            }
          );

          setPrintifyPrices(normalizedPrices);
        }
      } catch (error) {
        if (error.name === "AbortError") {
          return;
        }

        console.error(
          "Price fetch failed:",
          error
        );

        /*
          We do NOT clear the local price here.

          If Printify fails, the customer still sees
          the fallback price from products.js.
        */
      }
    }

    getPrintifyPrice();

    return () => {
      controller.abort();
    };
  }, [product?.printifyProductId]);

  /*
    Product doesn't exist.
  */
  if (!product) {
    return <h1>Product not found</h1>;
  }

  /*
    If a selected size has its own Printify price,
    use it.

    Otherwise use the main price.
  */
  const currentPrice =
    selectedSize &&
    printifyPrices[selectedSize] !== undefined
      ? printifyPrices[selectedSize]
      : printifyPrice;

  const handleAddToCart = () => {
    /*
      Matching sets have two size selections.
    */
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
      /*
        Regular products have one size selection.
      */
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
              onClick={() =>
                setSelectedImage(product.image)
              }
            >
              <img
                src={product.image}
                alt={`${product.name} front`}
              />
            </button>

            <button
              type="button"
              onClick={() =>
                setSelectedImage(product.backImage)
              }
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
          {currentPrice !== null &&
          currentPrice !== undefined
            ? `$${Number(currentPrice).toFixed(2)}`
            : "Price unavailable"}
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
                    setSelectedDadSize(
                      e.target.value
                    );

                    setSizeError(false);
                  }}
                >
                  <option value="">
                    Select Dad Size
                  </option>

                  {product.dadSizes?.map(
                    (size) => (
                      <option
                        key={size}
                        value={size}
                      >
                        {size}
                      </option>
                    )
                  )}
                </select>

                <label>Baby Onesie Size</label>

                <select
                  value={selectedKidSize}
                  onChange={(e) => {
                    setSelectedKidSize(
                      e.target.value
                    );

                    setSizeError(false);
                  }}
                >
                  <option value="">
                    Select Baby Size
                  </option>

                  {product.kidSizes?.map(
                    (size) => (
                      <option
                        key={size}
                        value={size}
                      >
                        {size}
                      </option>
                    )
                  )}
                </select>
              </>
            ) : (
              <>
                <label>Size</label>

                <select
                  value={selectedSize}
                  onChange={(e) => {
                    setSelectedSize(
                      e.target.value
                    );

                    setSizeError(false);
                  }}
                >
                  <option value="">
                    Select Size
                  </option>

                  {product.sizes?.map(
                    (size) => (
                      <option
                        key={size}
                        value={size}
                      >
                        {size}
                      </option>
                    )
                  )}
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
