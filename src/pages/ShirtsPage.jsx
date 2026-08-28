import ProductCard from "../components/ProductCard";
import products from "../data/products";

function ShirtsPage({ addToCart }) {
  const shirts = products.filter((product) => product.type === "shirt");

  return (
    <section className="featured">
      <h1>Shirts</h1>

      <div className="featured__products">
        {shirts.map((product) => (
          <ProductCard
            key={product.id}
            name={product.name}
            price={product.price}
            image={product.image}
            backImage={product.backImage}
            sizes={product.sizes}
            addToCart={(selectedSize) =>
              addToCart({
                ...product,
                size: selectedSize,
              })
            }
          />
        ))}
      </div>
    </section>
  );
}

export default ShirtsPage;