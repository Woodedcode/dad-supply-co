import "./App.css";
import { useState, useEffect } from "react";
import { Routes, Route, Link } from "react-router-dom";
import DadSupplyLogo from "./assets/dad-supply-logo.png";
import HeroImage from "./assets/hero-image.png";
import ProductCard from "./components/ProductCard";
import DadSupplyTee from "./assets/dad-supply-tee.png";
import DadSupplyHat from "./assets/dad-supply-hat.png";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";

function App() {
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem("cartItems");

    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);

  const removeFromCart = (indexToRemove) => {
    setCartItems(
      cartItems
        .map((item, index) =>
          index === indexToRemove
            ? { ...item, quantity: item.quantity - 1 }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const addToCart = (products) => {
    const existingItem = cartItems.find(
      (item) => 
      item.name === products.name && 
      item.size === products.size,
    );

    if (existingItem) {
      setCartItems(
        cartItems.map((item) =>
          item.name === products.name &&
          item.size === products.size
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        ),
      );
    } else {
      setCartItems([
        ...cartItems,
        {
          ...products,
          quantity: 1,
        },
      ]);
    }
  };

  const increaseQuantity = (indexToIncrease) => {
    setCartItems(
      cartItems.map((item, index) =>
        index === indexToIncrease
          ? { ...item, quantity: item.quantity + 1 }
          : item,
      ),
    );
  };

  const removeItem = (indexToRemove) => {
    setCartItems(cartItems.filter((item, index) => index !== indexToRemove));
  };

  const cartCount = cartItems.reduce((total, item) => {
    return total + item.quantity;
  }, 0);

  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <div className="app">
      <header className="header">
        <figure>
          <Link to="/">
            <img
              src={DadSupplyLogo}
              alt="Dad Supply Logo"
              className="header__logo"
            />
          </Link>
        </figure>

        <nav className="nav__links">
          <Link
            to="/"
            onClick={() => {
              setTimeout(() => {
                document
                  .getElementById("featured-products")
                  ?.scrollIntoView({ behavior: "smooth" });
              }, 100);
            }}
          >
            Shop
          </Link>
          <Link
            to="/#about"
            onClick={() => {
              setTimeout(() => {
                document
                  .getElementById("about")
                  ?.scrollIntoView({ behavior: "smooth" });
              }, 300);
            }}
          >
            About
          </Link>
          <Link to="/cart">Cart ({cartCount})</Link>
        </nav>
      </header>

      <main>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <section className="hero">
                  <div className="hero__content">
                    <h1>Built for Dad Life</h1>
                    <p>
                      Quality gear for dads who take absolutely nothing too
                      serious.
                    </p>
                    <button
                      onClick={() => {
                        document
                          .getElementById("featured-products")
                          .scrollIntoView({ behavior: "smooth" });
                      }}
                    >
                      Shop Now
                    </button>
                  </div>

                  <figure className="hero__image">
                    <img src={HeroImage} alt="Dad Supply Co. Clothing" />
                  </figure>
                </section>

                <section className="featured" id="featured-products">
                  <h2>Featured Products</h2>

                  <div className="featured__products">
                    <ProductCard
                      name="Dad Supply Tee"
                      price="$28.00"
                      image={DadSupplyTee}
                      sizes={["S", "M", "L", "XL", "2XL"]}
                      addToCart={(selectedSize) =>
                        addToCart({
                          name: "Dad Supply Tee",
                          price: "$28.00",
                          image: DadSupplyTee,
                          size: selectedSize,
                        })
                      }
                    />

                    <ProductCard
                      name="Dad Supply Trucker Hat"
                      price="$32.00"
                      image={DadSupplyHat}
                      addToCart={() =>
                        addToCart({
                          name: "Dad Supply Trucker Hat",
                          price: "$32.00",
                          image: DadSupplyHat,
                        })
                      }
                    />
                  </div>
                </section>
                <section className="about" id="about">
                  <h2>About Dad Supply Co.</h2>
                  <p>
                    Dad Supply Co. is made for dads doing their best, cracking
                    terrible jokes, hauling too much stuff, and somehow keeping
                    it all together. <br />
                    <br />
                    Comfortable gear for the everyday chaos of dad life.
                  </p>
                </section>
              </>
            }
          />

          <Route
            path="/cart"
            element={
              <CartPage
                cartItems={cartItems}
                removeFromCart={removeFromCart}
                increaseQuantity={increaseQuantity}
                removeItem={removeItem}
              />
            }
          />
          <Route
            path="/checkout"
            element={
              <CheckoutPage cartItems={cartItems} clearCart={clearCart} />
            }
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;
