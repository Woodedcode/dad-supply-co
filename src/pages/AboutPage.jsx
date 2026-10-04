import { Link } from "react-router-dom";
import DadFounderPic from "../assets/family.jpg";

function AboutPage() {
  return (
    <main className="about-page">
      <section className="about-hero">
        <div className="about-photo">
          <img
            src={DadFounderPic}
            alt="Ryan and family"
            className="about-photo__image"
          />
        </div>

        <div className="about-story">
          <p className="about-story__eyebrow">
            THE STORY BEHIND THE STANDARD
          </p>

          <h1>Hey, I’m Ryan.</h1>

          <p>
            I got into making shirts kind of by accident. I made a few
            designs, put them out into the world, and they actually did
            'okay'. More importantly, I realized I really enjoyed creating
            something people could actually wear.
          </p>

          <p>
            Around the same time, I was studying React and working toward
            becoming a Software Engineer. Somewhere in the middle of all
            that, I thought:
          </p>

          <blockquote>
            “Hey, I could build an e-commerce site... and sell some shirts.”
          </blockquote>

          <p>
            Then came the obvious next question:
          </p>

          <blockquote>
            “Why not make it for dads?”
          </blockquote>

          <p>
            I was already making shirts, I needed a real project to build,
            and dad life had become a huge part of my world. Instead of
            building another fake portfolio store, I wanted to make
            something that could actually become something.
          </p>

          <p>
            That’s where <strong>Dad Standard Co.</strong> came from.
            Part clothing brand, part coding project, and part excuse to
            put terrible dad jokes on shirts.
          </p>

          <p>
            So I dove straight into the deep end, because apparently one
            major fall off a cliff wasn’t enough to teach me anything.
          </p>

          <p>
            What started as a small React project turned into a
            <strong> 100+ hour e-commerce build</strong> with product
            pages, a cart, checkout, payments, fulfillment, and plenty of
            bugs along the way.
          </p>

          <p>
            Somewhere in the process, Dad Standard became more than just
            a store. It became a real brand I wanted to grow and a project
            I could point to and say:
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