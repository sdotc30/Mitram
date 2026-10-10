import React, { useState } from "react";
import "./GemstonesAndRemedies.css";

import logoImg from "../assets/logo.png";
import gemstonesHeroBg from "../assets/gemstones-hero.png";
import { useAuth } from "../AuthContext";

// Product Data
const MOCK_REMEDIES = [
  {
    id: 1,
    name: "Yellow Sapphire (Pukhraj)",
    category: "Gemstones",
    price: 4999,
    rating: "4.9 ★",
    benefits: "Attracts wealth, wisdom, and professional success.",
    image:
      "https://images.unsplash.com/photo-1615109398623-88346a601842?w=500&auto=format&fit=crop&q=60",
  },
  {
    id: 2,
    name: "Blue Sapphire (Neelam)",
    category: "Gemstones",
    price: 6499,
    rating: "4.8 ★",
    benefits: "Brings rapid progress, discipline, and mental focus.",
    image:
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&auto=format&fit=crop&q=60",
  },
  {
    id: 3,
    name: "Natural Ruby (Manik)",
    category: "Gemstones",
    price: 5299,
    rating: "4.9 ★",
    benefits: "Enhances leadership, confidence, and vital energy.",
    image:
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500&auto=format&fit=crop&q=60",
  },
  {
    id: 4,
    name: "Sage Cleansing Bundle",
    category: "Cleansing Rituals",
    price: 899,
    rating: "4.7 ★",
    benefits: "Clears stagnant or negative aura and cleanses spaces.",
    image:
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=500&auto=format&fit=crop&q=60",
  },
  {
    id: 5,
    name: "Singing Bowl Ritual Kit",
    category: "Mantras & Sound",
    price: 2499,
    rating: "4.9 ★",
    benefits: "Harmonizes chakra frequency for deep meditation.",
    image:
      "https://images.unsplash.com/photo-1512290900673-0498b8849b2c?w=500&auto=format&fit=crop&q=60",
  },
  {
    id: 6,
    name: "Shree Yantra Plaque",
    category: "Yantras",
    price: 1899,
    rating: "4.8 ★",
    benefits:
      "Invites abundance and positive cosmic geometry into living spaces.",
    image:
      "https://images.unsplash.com/photo-1567225557594-88d73e55f2cb?w=500&auto=format&fit=crop&q=60",
  },
];

export default function GemstonesAndRemedies({
  onBack,
  onOpenAuth,
  onOpenSidebar,
  userProfile,
}) {
  const { currentUser, logout } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
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

  const filteredItems = MOCK_REMEDIES.filter((item) => {
    const matchesCategory =
      selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.benefits.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="gemstones-page-container">
      {/* Edge-to-Edge Hero Container with Integrated Header */}
      <div
        className="gemstones-hero-wrapper"
        style={{ backgroundImage: `url(${gemstonesHeroBg})` }}
      >
        {/* Navigation Header */}
        <header className="gemstones-header">
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
                    className={`dropdown-chevron ${
                      isProfileMenuOpen ? "open" : ""
                    }`}
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
              <button className="btn-top-book" onClick={onOpenAuth}>
                Book a Session
              </button>
            )}
          </div>
        </header>

        {/* Hero Content Area */}
        <div className="hero-overlay-content">
          <span className="hero-subheading">GEMSTONES &amp; REMEDIES</span>
          <h1 className="hero-main-title">
            Small Shifts.
            <br />
            Big Positive
            <br />
            Changes.
          </h1>
          <p className="hero-description">
            Personalized gemstone and remedy guidance to bring balance,
            protection and prosperity into your life.
          </p>
          <button className="btn-hero-book">Book a Session &rarr;</button>
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="gemstones-body-content">
        {/* Filtering & Search Section Immediately Below Hero */}
        <section className="filter-container">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search gemstones, yantras, or remedies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="btn-search">Search &rarr;</button>
          </div>

          <div className="filter-pills">
            {[
              "All",
              "Gemstones",
              "Cleansing Rituals",
              "Mantras & Sound",
              "Yantras",
            ].map((cat) => (
              <button
                key={cat}
                className={`category-pill ${
                  selectedCategory === cat ? "active" : ""
                }`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
            <button
              className="btn-reset"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
              }}
            >
              Reset All
            </button>
          </div>
        </section>

        {/* Products Grid */}
        <section className="astrologer-grid-section">
          <div className="cards-grid">
            {filteredItems.map((item) => (
              <div key={item.id} className="astro-card">
                <div>
                  <div
                    style={{
                      height: "180px",
                      borderRadius: "10px",
                      overflow: "hidden",
                      marginBottom: "12px",
                      position: "relative",
                    }}
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                    <span
                      style={{
                        position: "absolute",
                        top: "8px",
                        right: "8px",
                        background: "rgba(255,255,255,0.9)",
                        padding: "2px 8px",
                        borderRadius: "12px",
                        fontSize: "0.75rem",
                        fontWeight: "bold",
                        color: "#b8860b",
                      }}
                    >
                      {item.rating}
                    </span>
                  </div>
                  <span className="status-badge" style={{ color: "#b8860b" }}>
                    {item.category.toUpperCase()}
                  </span>
                  <h3 style={{ marginTop: "4px" }}>{item.name}</h3>
                  <p className="astro-title" style={{ marginTop: "6px" }}>
                    {item.benefits}
                  </p>
                </div>

                <div
                  className="astro-card-footer"
                  style={{ marginTop: "16px" }}
                >
                  <span className="price">₹ {item.price.toLocaleString()}</span>
                  <button className="btn-book-session">Consult &rarr;</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
