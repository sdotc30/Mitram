import React, { useState, useEffect } from "react";
import "./LoveAndCompatibility.css";

import logoImg from "../assets/logo.png";
import loveHeroBg from "../assets/love-hero-bg.png";
import { useAuth } from "../AuthContext";
import { fetchAstrologers } from "../services/astrologerService";

export default function LoveAndCompatibility({
  onBack,
  onOpenAuth,
  onOpenSidebar,
  userProfile,
  onViewAstrologerProfile,
}) {
  const { currentUser, logout } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const [astrologersList, setAstrologersList] = useState([]);
  const [isLoadingAstrologers, setIsLoadingAstrologers] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadLoveExperts() {
      setIsLoadingAstrologers(true);
      try {
        const data = await fetchAstrologers("LOVE");
        if (isMounted) {
          setAstrologersList(data || []);
        }
      } catch (err) {
        console.error("Failed to load love & compatibility astrologers:", err);
      } finally {
        if (isMounted) {
          setIsLoadingAstrologers(false);
        }
      }
    }
    loadLoveExperts();
    return () => {
      isMounted = false;
    };
  }, []);

  const getUserDisplayName = () => {
    const savedName = localStorage.getItem("userName");
    if (savedName) return savedName;

    if (userProfile?.displayName) return userProfile.displayName;
    if (userProfile?.name) return userProfile.name;
    if (currentUser?.displayName) return currentUser.displayName;
    if (currentUser?.name) return currentUser.name;

    if (currentUser?.isAnonymous) return "Guest User";
    return currentUser?.email ? currentUser.email.split("@")[0] : "User";
  };

  const getUserInitials = () => {
    const name = getUserDisplayName().trim();
    if (!name) return "U";

    const parts = name.split(" ").filter(Boolean);
    if (parts.length > 1) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

  const filteredAstrologers = astrologersList.filter((astro) => {
    const query = searchQuery.toLowerCase();
    const nameMatch = astro.name?.toLowerCase().includes(query);
    const titleMatch = (astro.category || "").toLowerCase().includes(query);
    const expertiseMatch = Array.isArray(astro.expertise)
      ? astro.expertise.some((e) => e.toLowerCase().includes(query))
      : false;
    return nameMatch || titleMatch || expertiseMatch;
  });

  return (
    <div className="love-page-wrapper">
      <div className="love-hero-wrapper">
        <header className="site-header">
          <div className="header-left">
            <button
              className="hamburger-toggle-btn"
              onClick={onOpenSidebar}
              aria-label="Open Sidebar"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="header-logo-container" onClick={onBack}>
              <img
                src={logoImg}
                alt="Mitram Logo"
                className="header-logo-only"
              />
            </div>
          </div>

          <nav className="nav-menu-pill">
            <a href="#home" onClick={onBack} className="nav-link">
              Home
            </a>
            <a href="#consultations" className="nav-link active">
              Consultations
            </a>
            <a href="#reviews" onClick={onBack} className="nav-link">
              Reviews
            </a>
            <a href="#about" onClick={onBack} className="nav-link">
              About
            </a>
          </nav>

          <div className="header-right">
            {currentUser ? (
              <div className="user-profile-wrapper">
                <button
                  className="user-profile-btn"
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                >
                  <div className="user-avatar-placeholder">
                    {getUserInitials()}
                  </div>
                  <span className="user-profile-name">
                    {getUserDisplayName()}
                  </span>
                  <svg
                    className={`dropdown-chevron ${isProfileMenuOpen ? "open" : ""}`}
                    width="16"
                    height="16"
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
                      <p className="dropdown-user-name">
                        {getUserDisplayName()}
                      </p>
                      <p className="dropdown-user-sub">{currentUser.email}</p>
                    </div>
                    <div className="dropdown-divider" />
                    <button
                      className="dropdown-item logout-item"
                      onClick={logout}
                    >
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button className="btn-primary" onClick={onOpenAuth}>
                Get Started &rarr;
              </button>
            )}
          </div>
        </header>

        <section
          className="love-hero-section"
          style={{ backgroundImage: `url(${loveHeroBg})` }}
        >
          <div className="love-hero-overlay">
            <h1 className="love-hero-title">
              LOVE &amp;
              <br />
              COMPATIBILITY
            </h1>
            <p className="love-hero-quote">
              Some connections are felt.
              <br />
              Some are understood.
            </p>
          </div>
        </section>
      </div>

      <section className="filter-container">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search astrologers by name, expertise, or language..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="btn-search">Search &rarr;</button>
        </div>

        <div className="filter-pills">
          <select>
            <option>Love &amp; Compatibility</option>
          </select>
          <select>
            <option>Language</option>
          </select>
          <select>
            <option>Price Range</option>
          </select>
          <select>
            <option>Availability</option>
          </select>
          <button className="btn-reset" onClick={() => setSearchQuery("")}>
            Reset All
          </button>
        </div>
      </section>

      <section className="astrologer-grid-section">
        <div className="section-title-row">
          <span className="sub-title">EXPERT ASTROLOGERS</span>
          <h2>FIND YOUR GUIDE</h2>
          <p>
            Connect with experienced astrologers specializing in love,
            relationships, and compatibility.
          </p>
        </div>

        {isLoadingAstrologers ? (
          <div className="status-message">
            Loading verified love specialists...
          </div>
        ) : filteredAstrologers.length === 0 ? (
          <div className="status-message">
            No relationship specialists available for this category right now.
          </div>
        ) : (
          <div className="cards-grid">
            {filteredAstrologers.map((astro) => (
              <div key={astro.id} className="astro-card">
                <div className="astro-card-header">
                  <div className="astro-header-left">
                    <img
                      src={astro.image}
                      alt={astro.name}
                      className="astro-img"
                    />
                    <h3>{astro.name}</h3>
                  </div>
                  <span
                    className={`status-badge ${
                      (astro.status_type || astro.statusType || "available") ===
                      "available"
                        ? "online"
                        : "busy"
                    }`}
                  >
                    • {astro.status || "Online Now"}
                  </span>
                </div>

                <div className="astro-card-center">
                  <p className="astro-subtitle">
                    {Array.isArray(astro.expertise)
                      ? astro.expertise.join(" • ")
                      : astro.category ||
                        "Birth Chart Analysis • Vedic Remedies"}
                  </p>

                  <div className="astro-meta-list">
                    <p className="astro-meta-item">
                      <span className="meta-icon">💼</span>{" "}
                      {astro.experience || "14+"} Years Experience
                    </p>
                    <p className="astro-meta-item">
                      <span className="meta-icon">🌐</span>{" "}
                      {Array.isArray(astro.languages)
                        ? astro.languages.join(", ")
                        : astro.languages || "Hindi, English"}
                    </p>
                    <p className="astro-meta-item rating">
                      <span className="star-icon">★</span>{" "}
                      <strong>{astro.rating || "4.90"}</strong> (
                      {astro.reviews_count || "890+"} reviews)
                    </p>
                  </div>
                </div>

                <div className="astro-card-footer">
                  <div className="price-tag">
                    ₹{" "}
                    <strong>
                      {astro.price_per_min || astro.pricePerMin || 70}
                    </strong>{" "}
                    <small>/ min</small>
                  </div>

                  <button
                    className="btn-consult-now"
                    onClick={() =>
                      onViewAstrologerProfile &&
                      onViewAstrologerProfile(astro.id)
                    }
                  >
                    Consult Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
