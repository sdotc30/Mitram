import React, { useState } from "react";
import "./LoveAndCompatibility.css";

import logoImg from "../assets/logo.png";
import loveHeroBg from "../assets/love-hero-bg.png";
import { useAuth } from "../AuthContext";

// Local Mock Data to bypass backend requirement for UI design phase
const MOCK_ASTROLOGERS = [
  {
    id: 1,
    name: "Astro Ramesh",
    title: "Vedic & Synastry Expert",
    rating: 4.9,
    reviews: 128,
    status: "Available Now",
    price: 499,
    tags: ["Love", "Marriage", "Vedic"],
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: 2,
    name: "Priya Sharma",
    title: "Relationship & Tarot Reader",
    rating: 4.8,
    reviews: 95,
    status: "Available Now",
    price: 399,
    tags: ["Tarot", "Soulmate", "Numerology"],
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: 3,
    name: "Dr. K. V. Shastri",
    title: "Kundali Matching Specialist",
    rating: 5.0,
    reviews: 210,
    status: "Busy",
    price: 699,
    tags: ["Kundali", "Compatibility", "Remedies"],
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
  },
];

export default function LoveAndCompatibility({
  onBack,
  onOpenAuth,
  onOpenSidebar,
  userProfile,
}) {
  const { currentUser, logout } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

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

  const filteredAstrologers = MOCK_ASTROLOGERS.filter(
    (astro) =>
      astro.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      astro.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="love-page-wrapper">
      {/* Top Hero Container */}
      <div className="love-hero-wrapper">
        {/* Full-Width Site Header */}
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

        {/* Hero Section */}
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

      {/* Filters & Search Section */}
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

      {/* Astrologers Section */}
      <section className="astrologer-grid-section">
        <div className="section-title-row">
          <span className="sub-title">EXPERT ASTROLOGERS</span>
          <h2>Find Your Guide</h2>
          <p>
            Connect with experienced astrologers specializing in love,
            relationships, and compatibility.
          </p>
        </div>

        <div className="cards-grid">
          {filteredAstrologers.map((astro) => (
            <div key={astro.id} className="astro-card">
              <div className="astro-card-top">
                <img src={astro.image} alt={astro.name} className="astro-img" />
                <div className="astro-info">
                  <span
                    className={`status-badge ${
                      astro.status === "Available Now" ? "online" : "busy"
                    }`}
                  >
                    ● {astro.status}
                  </span>
                  <h3>{astro.name}</h3>
                  <p className="astro-title">{astro.title}</p>
                  <p className="astro-rating">
                    ★ {astro.rating} ({astro.reviews} reviews)
                  </p>
                </div>
              </div>
              <div className="astro-tags">
                {astro.tags?.map((tag, i) => (
                  <span key={i} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="astro-card-footer">
                <span className="price">₹ {astro.price} / session</span>
                <button className="btn-book-session">
                  Book Session &rarr;
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
