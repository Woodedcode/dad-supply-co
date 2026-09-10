import products from "../data/products";
import ProductCard from "../components/ProductCard";

function MatchingPage() {
  return (
    <section className="featured">
      <h1>Matching Shirts</h1>

      <p className="category-subtitle">
        Because embarrassing them is better when you match.
      </p>

      <div className="matching-collection">
        <h2>The Checker Collection</h2>

        <div className="featured__products">
          {products
            .filter((product) => product.type === "matching-set")
            .map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                price={product.price}
                image={product.image}
              />
            ))}
        </div>
      </div>
    </section>
  );
}

export default MatchingPage;