import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./App.css";

// Core Assets
import heroBg from "./assets/hero-bg.png";
import wheelImg from "./assets/wheel-of-fortune.png";
import logoImg from "./assets/logo.png";

// Category Icons
import iconCareer from "./assets/icon-careerwealth.png";
import iconSpace from "./assets/icon-judgefreespace.png";
import iconKundli from "./assets/icon-kundlichart.png";
import iconLove from "./assets/icon-lovecompat.png";
import iconRemedies from "./assets/icon-remedies.png";
import iconVastu from "./assets/icon-vastuhome.png";

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");

  const heroTrackRef = useRef(null);
  const stickyFrameRef = useRef(null);
  const textBoxRef = useRef(null);
  const wheelRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Put the wheel exactly where it appears in the initial hero.
      // GSAP owns the complete transform so CSS and GSAP never fight each other.
      gsap.set(wheelRef.current, {
        xPercent: -50,
        yPercent: -50,
        x: "32vw",
        scale: 0.85,
        transformOrigin: "center center",
      });

      // Initial text state.
      gsap.set(textBoxRef.current, {
        x: 0,
        opacity: 1,
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: heroTrackRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
          pin: stickyFrameRef.current,
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      // Text exits while the wheel moves into focus.
      tl.to(
        textBoxRef.current,
        {
          x: -120,
          opacity: 0,
          duration: 1,
          ease: "power2.inOut",
        },
        0,
      );

      // Wheel travels from the wall to the exact center of the viewport.
      tl.to(
        wheelRef.current,
        {
          x: 0,
          scale: 1.15,
          duration: 1,
          ease: "power2.inOut",
        },
        0,
      );
    }, heroTrackRef);

    return () => ctx.revert();
  }, []);

  const openAuth = (mode = "login") => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  const closeAuth = () => setIsAuthOpen(false);

  const categories = [
    {
      title: "Kundli & Birth Chart",
      desc: "Unveil your core life blueprint, natural talents, and planetary positions with deep precision.",
      icon: iconKundli,
      badge: "Popular",
    },
    {
      title: "Love & Compatibility",
      desc: "Understand emotional bonds, relationship dynamics, and long-term harmony with your partner.",
      icon: iconLove,
      badge: "Relationships",
    },
    {
      title: "Career & Wealth",
      desc: "Discover upcoming financial growth cycles, optimal career shifts, and business paths.",
      icon: iconCareer,
      badge: "Growth",
    },
    {
      title: "Gemstones & Remedies",
      desc: "Personalized elemental solutions, mantras, and gemstone guidance to balance your energy.",
      icon: iconRemedies,
      badge: "Balance",
    },
    {
      title: "Vastu & Living Spaces",
      desc: "Harmonize your home and workplace environment to invite positivity and prosperity.",
      icon: iconVastu,
      badge: "Home",
    },
    {
      title: "Judgment-Free Space",
      desc: "A compassionate, confidential environment to talk openly about life’s uncertainties.",
      icon: iconSpace,
      badge: "Safe Space",
    },
  ];

  return (
    <div className="landing-container">
      {/* Header */}
      <header className="site-header">
        <div className="header-left">
          <img src={logoImg} alt="Logo" className="header-logo-only" />
        </div>

        <nav className="nav-menu-pill">
          <a href="#home" className="nav-link">
            Home
          </a>
          <a href="#consultations" className="nav-link">
            Consultations
          </a>
          <a href="#reviews" className="nav-link">
            Reviews
          </a>
          <a href="#about" className="nav-link">
            About
          </a>
        </nav>

        <div className="header-right">
          <button className="btn-primary" onClick={() => openAuth("signup")}>
            Get Started &rarr;
          </button>
        </div>
      </header>

      {/* GSAP Scroll Animation Track */}
      <div ref={heroTrackRef} className="scroll-hero-track" id="home">
        <section ref={stickyFrameRef} className="sticky-hero-frame">
          {/* Hero Background - Pinned solidly */}
          <div
            className="hero-bg-layer"
            style={{ backgroundImage: `url(${heroBg})` }}
          />

          {/* Hero Content Layer */}
          <div className="hero-content-layer">
            <div ref={textBoxRef} className="hero-text-tint-box">
              <span className="hero-sub-header">STEP INTO CLARITY</span>
              <h1 className="hero-title">Your Journey Deserves a Mitram.</h1>
              <p className="hero-desc">
                Take the first step towards clarity, balance, and a brighter
                tomorrow with personalized astrology guidance.
              </p>

              <div className="hero-actions">
                <button className="btn-hero" onClick={() => openAuth("signup")}>
                  Book a Consultation &rarr;
                </button>
                <a href="#consultations" className="btn-link">
                  Explore Services
                </a>
              </div>

              <div className="hero-trust-badges">
                <span className="badge-item">✦ Trusted Experts</span>
                <span className="badge-item">🔒 Safe & Private</span>
                <span className="badge-item">☀️ Guidance</span>
              </div>
            </div>
          </div>

          {/* Wheel Container Layer */}
          <div ref={wheelRef} className="wheel-container">
            <img src={wheelImg} alt="Zodiac Wheel" className="wheel-img" />
          </div>
        </section>
      </div>

      {/* Services Grid Section */}
      <section
        id="consultations"
        className="full-width-section services-grid-section"
      >
        <div className="section-header">
          <span className="section-subtitle">OUR SERVICES</span>
          <h2 className="section-title">Personalized Readings</h2>
          <p className="section-desc">
            Discover tailored insights designed to navigate your life paths with
            wisdom and peace.
          </p>
        </div>

        <div className="flashcard-grid">
          {categories.map((cat, idx) => (
            <div key={idx} className="flashcard">
              <div className="card-top">
                <div className="card-icon-wrapper">
                  <img
                    src={cat.icon}
                    alt={cat.title}
                    className="category-icon-img"
                  />
                </div>
                <span className="card-badge">{cat.badge}</span>
              </div>
              <div className="card-body">
                <h3>{cat.title}</h3>
                <p>{cat.desc}</p>
              </div>
              <button
                className="card-action-btn"
                onClick={() => openAuth("signup")}
              >
                Book Session
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section id="reviews" className="full-width-section testimonials-section">
        <div className="section-header">
          <span className="section-subtitle">TESTIMONIALS</span>
          <h2 className="section-title">What Our Clients Say</h2>
        </div>

        <div className="marquee-wrapper">
          <div className="marquee-container">
            {[
              {
                name: "Ananya R.",
                role: "Career Guidance",
                text: "The birth chart reading provided so much clarity during my career transition. Highly recommended!",
                rating: "★★★★★",
              },
              {
                name: "Rohan M.",
                role: "Relationship Sync",
                text: "Incredible insight into our compatibility. Helped us communicate with far more understanding.",
                rating: "★★★★★",
              },
              {
                name: "Priya S.",
                role: "Annual Reading",
                text: "Spot on year forecast! Helped me prepare for major transitions with complete confidence.",
                rating: "★★★★★",
              },
              {
                name: "Dev K.",
                role: "Personal Guidance",
                text: "Genuinely compassionate approach. The session felt warm, grounded, and deeply insightful.",
                rating: "★★★★★",
              },
            ]
              .concat([
                {
                  name: "Ananya R.",
                  role: "Career Guidance",
                  text: "The birth chart reading provided so much clarity during my career transition. Highly recommended!",
                  rating: "★★★★★",
                },
                {
                  name: "Rohan M.",
                  role: "Relationship Sync",
                  text: "Incredible insight into our compatibility. Helped us communicate with far more understanding.",
                  rating: "★★★★★",
                },
                {
                  name: "Priya S.",
                  role: "Annual Reading",
                  text: "Spot on year forecast! Helped me prepare for major transitions with complete confidence.",
                  rating: "★★★★★",
                },
                {
                  name: "Dev K.",
                  role: "Personal Guidance",
                  text: "Genuinely compassionate approach. The session felt warm, grounded, and deeply insightful.",
                  rating: "★★★★★",
                },
              ])
              .map((review, idx) => (
                <div key={idx} className="testimonial-card">
                  <div className="testimonial-rating">{review.rating}</div>
                  <p className="testimonial-text">"{review.text}"</p>
                  <div className="testimonial-author">
                    <div className="author-avatar">{review.name[0]}</div>
                    <div className="author-info">
                      <h4>{review.name}</h4>
                      <span>{review.role}</span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="full-width-section site-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="footer-logo-row">
              <img
                src={logoImg}
                alt="Mitram Logo"
                className="footer-logo-img"
              />
            </div>
            <p>
              Guiding your journey with wisdom, cosmic alignment, and
              personalized spiritual clarity.
            </p>
          </div>

          <div className="footer-column">
            <h4>Services</h4>
            <ul>
              <li>
                <a href="#consultations">Kundli & Chart</a>
              </li>
              <li>
                <a href="#consultations">Love Compatibility</a>
              </li>
              <li>
                <a href="#consultations">Career & Wealth</a>
              </li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>Company</h4>
            <ul>
              <li>
                <a href="#about">About Us</a>
              </li>
              <li>
                <a href="#reviews">Reviews</a>
              </li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>Legal</h4>
            <ul>
              <li>
                <a href="#privacy">Privacy Policy</a>
              </li>
              <li>
                <a href="#terms">Terms of Service</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>
            &copy; {new Date().getFullYear()} Mitram. All rights reserved.
          </span>
          <span>Crafted with clarity & wisdom.</span>
        </div>
      </footer>

      {/* Auth Modal */}
      {isAuthOpen && (
        <div className="auth-modal-overlay" onClick={closeAuth}>
          <div className="auth-modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={closeAuth}>
              &times;
            </button>

            <div className="auth-tabs">
              <button
                className={`tab-btn ${authMode === "login" ? "active" : ""}`}
                onClick={() => setAuthMode("login")}
              >
                Log In
              </button>
              <button
                className={`tab-btn ${authMode === "signup" ? "active" : ""}`}
                onClick={() => setAuthMode("signup")}
              >
                Sign Up
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert(
                  `${authMode === "login" ? "Logging in" : "Signing up"}...`,
                );
              }}
            >
              {authMode === "signup" && (
                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" placeholder="Enter your name" required />
                </div>
              )}

              <div className="form-group">
                <label>Email Address</label>
                <input type="email" placeholder="name@example.com" required />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input type="password" placeholder="••••••••" required />
              </div>

              <button type="submit" className="btn-auth-submit">
                {authMode === "login" ? "Log In" : "Create Account"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
