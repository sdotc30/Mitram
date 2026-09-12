import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import logoImg from "./assets/logo.png";
import heroImg from "./assets/hero-arch.jpg"; // Adjust extension if using .webp / .png
import "./App.css";

gsap.registerPlugin(ScrollTrigger);

function App() {
  const heroRef = useRef(null);
  const heroBgRef = useRef(null);
  const heroContentRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "+=150%",
          scrub: 1,
          pin: true,
        },
      });

      // 1. Fade & shrink overlay elements
      tl.to(
        heroContentRef.current,
        {
          opacity: 0,
          scale: 0.95,
          ease: "power1.inOut",
        },
        0,
      );

      // 2. Smooth zoom into the archway landscape
      tl.to(
        heroBgRef.current,
        {
          scale: 3.5,
          transformOrigin: "72% 42%", // Locks onto archway center
          ease: "power1.inOut",
        },
        0,
      );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="landing-container">
      {/* Top Navigation Bar - Clean Floating Design */}
      <nav className="landing-nav">
        <div className="nav-left">
          <img src={logoImg} alt="Mitram Logo" className="brand-logo-img" />
        </div>
        <div className="nav-links">
          <a href="#home" className="nav-link">
            Home
          </a>
          <a href="#consultations" className="nav-link">
            Consultations
          </a>
          <a href="#experts" className="nav-link">
            Our Experts
          </a>
          <a href="#about" className="nav-link">
            About
          </a>
          <a href="#blog" className="nav-link">
            Blog
          </a>
        </div>
        <div className="nav-right">
          <button className="btn-primary">Get Started &rarr;</button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="scroll-hero-wrapper" ref={heroRef}>
        <div
          className="hero-bg-layer"
          ref={heroBgRef}
          style={{ backgroundImage: `url(${heroImg})` }}
        />

        <div className="hero-content-layer" ref={heroContentRef}>
          {/* Light Tint Box with Soft Gradient */}
          <div className="hero-text-tint-box">
            <span className="hero-sub-header">
              CLARITY &bull; BALANCE &bull; A BRIGHTER TOMORROW
            </span>
            <h1 className="hero-title">
              Guidance for
              <br />a Fuller You
            </h1>
            <p className="hero-desc">
              Whether it's a simple conversation, deep Vedic wisdom
              <br />
              or astrological insights — Mitram is here for you.
            </p>
            <div className="hero-actions">
              <button className="btn-hero">Book a Consultation &rarr;</button>
              <a href="#services" className="btn-link">
                Explore Services
              </a>
            </div>
            <div className="hero-trust-badges">
              <span>🪷 Trusted Experts</span>
              <span>🛡️ Safe & Private</span>
              <span>👥 Guidance for All</span>
            </div>
          </div>

          {/* Cards Row */}
          <div className="hero-cards-row">
            <div className="category-card-mini">
              <div className="card-mini-icon">💬</div>
              <div className="card-mini-content">
                <h3>Normal Consultation</h3>
                <p>A safe space to talk, seek advice and get clarity.</p>
              </div>
              <button className="card-mini-btn">&rarr;</button>
            </div>

            <div className="category-card-mini">
              <div className="card-mini-icon">🕉️</div>
              <div className="card-mini-content">
                <h3>Vedic Consultation</h3>
                <p>Discover timeless wisdom from Vedic knowledge.</p>
              </div>
              <button className="card-mini-btn">&rarr;</button>
            </div>

            <div className="category-card-mini">
              <div className="card-mini-icon">✦</div>
              <div className="card-mini-content">
                <h3>Astro Consultation</h3>
                <p>Get personalised astrological insights for your journey.</p>
              </div>
              <button className="card-mini-btn">&rarr;</button>
            </div>
          </div>
        </div>
      </section>

      {/* Next Section Placeholder */}
      <section className="next-section-placeholder">
        <h2>Welcome to the Landscape View</h2>
        <p>Next category transitions can go right here!</p>
      </section>
    </div>
  );
}

export default App;
