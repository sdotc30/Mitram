import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./App.css";

import { useAuth } from "./AuthContext";
import {
  loginWithGoogle,
  loginAsGuest,
  loginWithEmail,
  registerWithEmail,
} from "./firebase";

import heroBg from "./assets/hero-bg.png";
import wheelImg from "./assets/wheel-of-fortune.png";
import logoImg from "./assets/logo.png";

import iconCareer from "./assets/icon-careerwealth.png";
import iconSpace from "./assets/icon-judgefreespace.png";
import iconKundli from "./assets/icon-kundlichart.png";
import iconLove from "./assets/icon-lovecompat.png";
import iconRemedies from "./assets/icon-remedies.png";
import iconVastu from "./assets/icon-vastuhome.png";

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const { currentUser, logout } = useAuth();

  // Auth Modal States
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // User Auth Fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // User Profile / Birth Details Modal States
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [profileFullName, setProfileFullName] = useState("");
  const [dob, setDob] = useState("");
  const [timeOfBirth, setTimeOfBirth] = useState(""); // Optional (can be null/empty)
  const [placeOfBirth, setPlaceOfBirth] = useState("");
  const [gender, setGender] = useState("");

  const heroTrackRef = useRef(null);
  const stickyFrameRef = useRef(null);
  const textBoxRef = useRef(null);
  const wheelRef = useRef(null);
  const profileDropdownRef = useRef(null);

  // Load existing profile details or trigger onboarding if first time
  useEffect(() => {
    if (currentUser) {
      const savedDetails = localStorage.getItem(
        `user_details_${currentUser.uid}`,
      );
      const hasCompletedProfile = localStorage.getItem(
        `profile_completed_${currentUser.uid}`,
      );

      if (savedDetails) {
        const parsed = JSON.parse(savedDetails);
        setProfileFullName(parsed.fullName || currentUser.displayName || "");
        setDob(parsed.dob || "");
        setTimeOfBirth(parsed.timeOfBirth || "");
        setPlaceOfBirth(parsed.placeOfBirth || "");
        setGender(parsed.gender || "");
      } else if (currentUser.displayName) {
        setProfileFullName(currentUser.displayName);
      }

      // Auto popup ONLY if user hasn't marked setup as done
      if (!hasCompletedProfile) {
        setIsDetailsModalOpen(true);
      }
    }
  }, [currentUser]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(wheelRef.current, {
        xPercent: -50,
        yPercent: -50,
        x: "32vw",
        scale: 0.85,
        transformOrigin: "center center",
      });

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

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (isAuthOpen) closeAuth();
        if (isProfileMenuOpen) setIsProfileMenuOpen(false);
        if (isDetailsModalOpen) setIsDetailsModalOpen(false);
        if (isMobileNavOpen) setIsMobileNavOpen(false);
      }
    };

    const handleClickOutside = (e) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(e.target)
      ) {
        setIsProfileMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isAuthOpen, isProfileMenuOpen, isDetailsModalOpen, isMobileNavOpen]);

  const switchMode = (mode) => {
    setAuthMode(mode);
    setAuthError("");
    setEmail("");
    setPassword("");
    setFullName("");
  };

  const openAuth = (mode = "login") => {
    switchMode(mode);
    setIsAuthOpen(true);
  };

  const closeAuth = () => {
    setIsAuthOpen(false);
    setAuthError("");
    setEmail("");
    setPassword("");
    setFullName("");
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);

    try {
      if (authMode === "login") {
        await loginWithEmail(email, password);
      } else {
        await registerWithEmail(email, password, fullName);
      }
      closeAuth();
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleClick = async () => {
    setAuthError("");
    setAuthLoading(true);
    const res = await loginWithGoogle();
    setAuthLoading(false);
    if (res.error) {
      setAuthError(res.error);
    } else {
      closeAuth();
    }
  };

  const handleGuestClick = async () => {
    setAuthError("");
    setAuthLoading(true);
    const res = await loginAsGuest();
    setAuthLoading(false);
    if (res.error) {
      setAuthError(res.error);
    } else {
      closeAuth();
    }
  };

  const handleLogout = async () => {
    setIsProfileMenuOpen(false);
    await logout();
  };

  const handleSaveDetails = (e) => {
    e.preventDefault();

    if (!profileFullName.trim() || !dob || !placeOfBirth.trim() || !gender) {
      alert(
        "Please fill in all required fields (Full Name, Date of Birth, Place of Birth, and Gender).",
      );
      return;
    }

    const birthData = {
      fullName: profileFullName.trim(),
      dob: dob,
      timeOfBirth: timeOfBirth || null,
      placeOfBirth: placeOfBirth.trim(),
      gender: gender,
      updatedAt: new Date().toISOString(),
      hasCompletedOnboarding: true,
    };

    if (currentUser) {
      localStorage.setItem(`profile_completed_${currentUser.uid}`, "true");
      localStorage.setItem(
        `user_details_${currentUser.uid}`,
        JSON.stringify(birthData),
      );
    }

    setIsDetailsModalOpen(false);
  };

  const getUserDisplayName = () => {
    if (profileFullName.trim()) return profileFullName;
    if (!currentUser) return "";
    if (currentUser.isAnonymous) return "Guest User";
    if (currentUser.displayName) return currentUser.displayName;
    if (currentUser.email) {
      const username = currentUser.email.split("@")[0];
      return username.charAt(0).toUpperCase() + username.slice(1);
    }
    return "User";
  };

  const getUserInitial = () => {
    const name = getUserDisplayName();
    return name ? name.charAt(0).toUpperCase() : "U";
  };

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

  const testimonialsList = [
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
  ];

  const marqueeItems = [
    ...testimonialsList.map((item, idx) => ({
      ...item,
      uniqueKey: `orig-${idx}`,
    })),
    ...testimonialsList.map((item, idx) => ({
      ...item,
      uniqueKey: `dup-${idx}`,
    })),
  ];

  return (
    <div className="landing-container">
      <header className="site-header">
        <div className="header-left">
          <img src={logoImg} alt="Logo" className="header-logo-only" />
        </div>

        {/* Navigation Links with Hamburger Mobile Menu Support */}
        <nav
          className={`nav-menu-pill ${isMobileNavOpen ? "mobile-open" : ""}`}
        >
          <a
            href="#home"
            className="nav-link"
            onClick={() => setIsMobileNavOpen(false)}
          >
            Home
          </a>
          <a
            href="#consultations"
            className="nav-link"
            onClick={() => setIsMobileNavOpen(false)}
          >
            Consultations
          </a>
          <a
            href="#reviews"
            className="nav-link"
            onClick={() => setIsMobileNavOpen(false)}
          >
            Reviews
          </a>
          <a
            href="#about"
            className="nav-link"
            onClick={() => setIsMobileNavOpen(false)}
          >
            About
          </a>
        </nav>

        <div className="header-right" ref={profileDropdownRef}>
          {currentUser ? (
            <div className="user-profile-wrapper">
              <button
                className="user-profile-btn"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                aria-expanded={isProfileMenuOpen}
              >
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt="Profile"
                    className="user-avatar-img"
                  />
                ) : (
                  <div className="user-avatar-placeholder">
                    {getUserInitial()}
                  </div>
                )}
                <span className="user-profile-name">
                  {getUserDisplayName()}
                </span>
                <svg
                  className={`dropdown-chevron ${isProfileMenuOpen ? "open" : ""}`}
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>

              {isProfileMenuOpen && (
                <div className="profile-dropdown-menu">
                  <div className="dropdown-header">
                    <p className="dropdown-user-name">{getUserDisplayName()}</p>
                    <p className="dropdown-user-sub">
                      {currentUser.isAnonymous ? "Guest Account" : "Member"}
                    </p>
                  </div>
                  <div className="dropdown-divider" />

                  <button
                    className="dropdown-item"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      setIsDetailsModalOpen(true);
                    }}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    Birth Details
                  </button>

                  <button
                    className="dropdown-item logout-item"
                    onClick={handleLogout}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Log Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button className="btn-primary" onClick={() => openAuth("signup")}>
              Get Started &rarr;
            </button>
          )}

          {/* Hamburger Menu Toggle Icon */}
          <button
            className="hamburger-toggle-btn"
            onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
            aria-label="Toggle Navigation Menu"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              {isMobileNavOpen ? (
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </header>

      <div ref={heroTrackRef} className="scroll-hero-track" id="home">
        <section ref={stickyFrameRef} className="sticky-hero-frame">
          <div
            className="hero-bg-layer"
            style={{ backgroundImage: `url(${heroBg})` }}
          />

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

          <div ref={wheelRef} className="wheel-container">
            <img src={wheelImg} alt="Zodiac Wheel" className="wheel-img" />
          </div>

          <div className="scroll-indicator">
            <div className="scroll-mouse-pill">
              <div className="scroll-wheel-dot" />
            </div>
            <span>Scroll</span>
          </div>
        </section>
      </div>

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

      <section id="reviews" className="full-width-section testimonials-section">
        <div className="section-header">
          <span className="section-subtitle">TESTIMONIALS</span>
          <h2 className="section-title">What Our Clients Say</h2>
        </div>

        <div className="marquee-wrapper">
          <div className="marquee-container">
            {marqueeItems.map((review) => (
              <div key={review.uniqueKey} className="testimonial-card">
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
            <button
              className="modal-close-btn"
              onClick={closeAuth}
              aria-label="Close modal"
            >
              &times;
            </button>

            {authError && <div className="auth-error-msg">{authError}</div>}

            <div className="auth-tabs">
              <button
                className={`tab-btn ${authMode === "login" ? "active" : ""}`}
                onClick={() => switchMode("login")}
              >
                Log In
              </button>
              <button
                className={`tab-btn ${authMode === "signup" ? "active" : ""}`}
                onClick={() => switchMode("signup")}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} autoComplete="off">
              {authMode === "signup" && (
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    disabled={authLoading}
                    autoComplete="off"
                  />
                </div>
              )}

              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={authLoading}
                  autoComplete="off"
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={authLoading}
                  autoComplete="new-password"
                />
              </div>

              <button
                type="submit"
                className="btn-auth-submit"
                disabled={authLoading}
              >
                {authLoading
                  ? "Processing..."
                  : authMode === "login"
                    ? "Log In"
                    : "Create Account"}
              </button>
            </form>

            <div className="auth-divider">
              <span>OR</span>
            </div>

            <div className="social-auth-row">
              <button
                type="button"
                className="btn-social"
                onClick={handleGoogleClick}
                disabled={authLoading}
              >
                <svg className="social-icon" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.29v3.14C3.26 21.3 7.31 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.59H1.29C.47 8.22 0 10.06 0 12s.47 3.78 1.29 5.41l3.99-3.14z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.59l3.99 3.14c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                Google
              </button>

              <button
                type="button"
                className="btn-social btn-guest-inline"
                onClick={handleGuestClick}
                disabled={authLoading}
              >
                <svg
                  className="social-icon"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                Guest
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Onboarding & Birth Details Modal */}
      {isDetailsModalOpen && (
        <div
          className="auth-modal-overlay"
          onClick={() => setIsDetailsModalOpen(false)}
        >
          <div
            className="auth-modal-card profile-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close-btn"
              onClick={() => setIsDetailsModalOpen(false)}
              aria-label="Close details modal"
            >
              &times;
            </button>

            <div className="modal-header-text">
              <h2>Birth Profile Setup</h2>
              <p>
                Provide your accurate birth details to unlock precise Kundli and
                astrology readings.
              </p>
            </div>

            <form onSubmit={handleSaveDetails}>
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={profileFullName}
                  onChange={(e) => setProfileFullName(e.target.value)}
                  required
                />
              </div>

              <div className="form-row-2col">
                <div className="form-group">
                  <label>Date of Birth *</label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Time of Birth</label>
                  <input
                    type="time"
                    value={timeOfBirth}
                    onChange={(e) => setTimeOfBirth(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Place of Birth (City, Country) *</label>
                <input
                  type="text"
                  placeholder="e.g. New Delhi, India"
                  value={placeOfBirth}
                  onChange={(e) => setPlaceOfBirth(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Gender *</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  required
                >
                  <option value="" disabled>
                    Select Gender
                  </option>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="other">Other / Prefer not to say</option>
                </select>
              </div>

              <button type="submit" className="btn-auth-submit">
                Save & Continue
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
