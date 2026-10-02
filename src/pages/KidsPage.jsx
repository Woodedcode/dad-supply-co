import ProductCard from "../components/ProductCard";
import products from "../data/products";

function KidsPage({ addToCart }) {
  const kids = products.filter((product) => product.type === "kid");

  return (
    <section className="featured">
      <h1>Kids</h1>
      <p className="category-subtitle">
        Little gear for the next generation of Dad-joke professionals.
      </p>
      <br />
      <br />
      <h3>COMING SOON...</h3>

      <div className="featured__products">
        {kids.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
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

export default KidsPage;
