import { Link } from "react-router-dom";
import DadFounderPic from "../assets/family.jpg";

function AboutPage() {
  return (
    <main className="about-page">
      <section className="about-hero">
        <div className="about-photo">
          <div className="about-photo__placeholder">
            <div className="about-photo">
              <img
                src={DadFounderPic}
                alt="Ryan, founder of Dad Standard Co."
                className="about-photo__image"
              />
            </div>
          </div>
        </div>

        <div className="about-story">
          <p className="about-story__eyebrow">THE STORY BEHIND THE STANDARD</p>

          <h1>Hey, I’m Ryan.</h1>

          <p>I got into making shirts kind of by accident.</p>

          <p>
            I started creating a few designs, put them out into the world, and
            they actually did 'okay'. They never completely took off, but I
            realized I really enjoyed turning an idea into something people
            could actually wear.
          </p>

          <p>
            Around the same time, I was studying React and working toward
            becoming a software engineer. Somewhere in the middle of learning
            how to build websites, I thought:
          </p>

          <blockquote>
            “Hey, I could build an e-commerce site... and sell some shirts.”
          </blockquote>

          <p>Then came the obvious next idea:</p>

          <blockquote>“Why not make it for dads?”</blockquote>

          <p>
            I’m a dad, I love a terrible dad joke, and I’ve always liked simple,
            classic shirts. So Dad Standard Co. became a mix of all three — dad
            humor, everyday gear, and a project I could build from the ground
            up.
          </p>

          <p>
            So I dove straight into the deep end, because apparently one major
            fall off a cliff wasn’t enough to teach me anything.
          </p>

          <p>
            What started as a small React project turned into a <br />
            <strong> 100+ hour e-commerce build</strong> with product pages, a
            cart, checkout, payments, fulfillment, and plenty of bugs along the
            way.
          </p>

          <p>
            Somewhere in the process, Dad Standard became more than just a
            store. It became a real brand I wanted to grow and a project I could
            point to and say:
          </p>

          <p className="about-story__built">
            <strong>“I built this.”</strong>
          </p>

          <h2>Welcome to Dad Standard Co.</h2>

          <p className="about-story__tagline">
            Built for Dad Life. Powered by questionable jokes.
          </p>

          <Link to="/shirts" className="about-shop-button">
            SHOP THE STANDARD
          </Link>
        </div>
      </section>
    </main>
  );
}

export default AboutPage;
