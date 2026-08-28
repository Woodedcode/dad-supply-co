import ProductCard from "../components/ProductCard";
import products from "../data/products";

function HatsPage({ addToCart }) {
  const hats = products.filter((product) => product.type === "hat");

  return (
    <section className="featured">
      <h1>Hats</h1>

      <div className="featured__products">
        {hats.map((product) => (
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

export default HatsPage;