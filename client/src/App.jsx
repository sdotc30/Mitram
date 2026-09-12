import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import logoImg from "./assets/logo.png";
import heroImg from "./assets/hero-arch.jpg";
import "./App.css";

gsap.registerPlugin(ScrollTrigger);

function App() {
  const heroRef = useRef(null);
  const heroBgRef = useRef(null);
  const heroContentRef = useRef(null);
  const landscapeTextRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "+=200%",
          scrub: 1,
          pin: true,
        },
      });

      // 1. Fade out hero card text box
      tl.to(
        heroContentRef.current,
        {
          opacity: 0,
          scale: 0.9,
          ease: "power1.inOut",
          duration: 0.4,
        },
        0,
      );

      // 2. Zoom into archway landscape
      tl.to(
        heroBgRef.current,
        {
          scale: 3.5,
          transformOrigin: "72% 42%",
          ease: "power1.inOut",
          duration: 1,
        },
        0,
      );

      // 3. Reveal inner landscape heading
      tl.to(
        landscapeTextRef.current,
        {
          opacity: 1,
          y: 0,
          ease: "power2.out",
          duration: 0.4,
        },
        0.6,
      );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="landing-container">
      {/* Floating Navigation Pill */}
      <nav className="landing-nav">
        <div className="nav-logo-pill">
          <img src={logoImg} alt="Mitram Logo" className="brand-logo-img" />
        </div>

        <div className="nav-menu-pill">
          <a href="#home" className="nav-link">
            Home
          </a>
          <a href="#consultations" className="nav-link">
            Consultations
          </a>
          <a href="#experts" className="nav-link">
            Our Experts
          </a>
          <a href="#store" className="nav-link">
            Store
          </a>
          <a href="#about" className="nav-link">
            About
          </a>
          <a href="#blog" className="nav-link">
            Blog
          </a>
        </div>

        <div className="nav-action-pill">
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

        {/* Updated Hero Content Box */}
        <div className="hero-content-layer" ref={heroContentRef}>
          <div className="hero-text-tint-box">
            <span className="hero-sub-header">
              CLARITY &bull; BALANCE &bull; A BRIGHTER TOMORROW
            </span>
            <h1 className="hero-title">
              Your Journey
              <br />
              Deserves a Mitram.
            </h1>
            <p className="hero-desc">
              Take the first step towards clarity, balance and a brighter
              tomorrow.
            </p>
            <div className="hero-actions">
              <button className="btn-hero">Book a Consultation &rarr;</button>
              <a href="#consultations" className="btn-link">
                Explore Services
              </a>
            </div>
            <div className="hero-trust-badges">
              <span>🪷 Trusted Experts</span>
              <span>🛡️ Safe & Private</span>
              <span>👥 Guidance for All</span>
            </div>
          </div>
        </div>

        {/* Text Revealing inside Landscape on Scroll */}
        <div className="landscape-reveal-text" ref={landscapeTextRef}>
          <span className="landscape-tag">WELCOME TO MITRAM</span>
          <h2>Step Into Clarity</h2>
          <p>
            A sacred space designed for deep conversation, ancient wisdom, and
            personal growth.
          </p>
        </div>
      </section>

      {/* Consultation Services Grid Section */}
      <section className="services-grid-section" id="consultations">
        <div className="section-header">
          <span className="section-subtitle">OUR CONSULTATION SERVICES</span>
          <h2 className="section-title">
            Choose the Path That Resonates With You
          </h2>
          <p className="section-desc">
            Tailored sessions designed to bring peace, perspective, and
            direction.
          </p>
        </div>

        <div className="services-grid">
          <div className="service-card">
            <div className="service-icon">💬</div>
            <h3>Normal Consultation</h3>
            <p>
              A compassionate, safe space to discuss personal challenges, seek
              advice, and regain mental clarity without judgment.
            </p>
            <button className="service-btn">Learn More &rarr;</button>
          </div>

          <div className="service-card">
            <div className="service-icon">🕉️</div>
            <h3>Vedic Consultation</h3>
            <p>
              Rooted in ancient scriptures and timeless philosophies to guide
              you through life's deeper spiritual questions.
            </p>
            <button className="service-btn">Learn More &rarr;</button>
          </div>

          <div className="service-card">
            <div className="service-icon">✦</div>
            <h3>Astro Consultation</h3>
            <p>
              In-depth horoscope alignments and celestial chart analysis to
              reveal underlying life patterns and opportunities.
            </p>
            <button className="service-btn">Learn More &rarr;</button>
          </div>

          <div className="service-card">
            <div className="service-icon">🕊️</div>
            <h3>No-Judgement Zone</h3>
            <p>
              1-on-1 confidential listening sessions dedicated entirely to
              expressing yourself freely and feeling heard.
            </p>
            <button className="service-btn">Learn More &rarr;</button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default App;
