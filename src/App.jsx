import "./App.css";
import { useState } from "react";
import DadSupplyLogo from "./assets/dad-supply-logo.png";
import HeroImage from "./assets/hero-image.png";
import ProductCard from "./components/ProductCard";
import DadSupplyTee from "./assets/dad-supply-tee.png"
import DadSupplyHat from "./assets/dad-supply-hat.png"
import Cart from "./components/Cart";

function App() {
  const [cartItems,setCartItems] = useState([])
  return (
    <>
      <div className="app">
        <header className="header">
          <figure>
            <img
              src={DadSupplyLogo}
              alt="Dad Supply Logo"
              className="header__logo"
            />
          </figure>

          <nav className="nav__links">
            <a href="#">Shop</a>
            <a href="#">About</a>
            <a href="#">Cart ({cartItems.length})</a>
          </nav>
        </header>

        <main>
          <section className="hero">
            <div className="hero__content">
              <h1>Built for Dad Life</h1>
              <p>
                Quality gear for dads who take absolutely nothing too serious.
              </p>
              <button>Shop Now</button>
            </div>
            <figure className="hero__image">
              <img src={HeroImage} alt="Dad Supply Co. Clothing" />
            </figure>
          </section>
          <section className="featured">
            <h2>Featured Products</h2>

            <div className="featured__products">
              <ProductCard
               name="Dad Supply Tee" 
               price="$28.00" 
               image={DadSupplyTee}
               addToCart={() => setCartItems([...cartItems, {
                name: "Dad Supply Tee",
                price: "$28.00",
                image: DadSupplyTee
              }])}
               />
              <ProductCard
              name="Dad Supply Trucker Hat"
              price="$32.00"
              image={DadSupplyHat}
              addToCart={() => setCartItems([...cartItems, {
                name: "Dad Supply Trucker Hat",
                price: "$32.00",
                image: DadSupplyHat
              }])}
              />
            </div>
          </section>
          <Cart cartItems={cartItems} />
        </main>
      </div>
    </>
  );
}

export default App;
