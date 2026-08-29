return (
  <main className="product-page">
    <div className="product-page__images">
      <img src={product.image} alt={product.name} />

      {product.backImage && (
        <img src={product.backImage} alt={`${product.name} back`} />
      )}
    </div>

    <div className="product-page__info">
      <h1>{product.name}</h1>
      <p>{product.price}</p>
    </div>
  </main>
);