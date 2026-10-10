import React, { useState } from "react";
import "./JudgementFreeZone.css";

import logoImg from "../assets/logo.png";
import judgementHeroBg from "../assets/Judgement-hero.png";
import { useAuth } from "../AuthContext";

// Mock Active Listeners / Companions Data
const MOCK_LISTENERS = [
  {
    id: 1,
    name: "Aanya Sharma",
    status: "Online Now",
    statusType: "available",
    expertise: ["Active Listening", "Stress & Anxiety", "Emotional Support"],
    category: "Emotional Support",
    experience: "4+ Years",
    languages: ["English", "Hindi"],
    rating: "4.9",
    reviewsCount: "410+",
    pricePerMin: 30,
    image:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop&q=60",
  },
  {
    id: 2,
    name: "Kabir Verma",
    status: "Online Now",
    statusType: "available",
    expertise: ["Work Stress", "Overthinking", "Relationship Talk"],
    category: "Stress & Anxiety",
    experience: "5+ Years",
    languages: ["Hindi", "English", "Punjabi"],
    rating: "4.8",
    reviewsCount: "350+",
    pricePerMin: 35,
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=60",
  },
  {
    id: 3,
    name: "Priya Nair",
    status: "Online Now",
    statusType: "available",
    expertise: ["Peer Companion", "Daily Venting", "Mindfulness"],
    category: "Peer Listening",
    experience: "3+ Years",
    languages: ["English", "Malayalam"],
    rating: "4.9",
    reviewsCount: "290+",
    pricePerMin: 25,
    image:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=500&auto=format&fit=crop&q=60",
  },
  {
    id: 4,
    name: "Rohan Das",
    status: "In Session",
    statusType: "busy",
    expertise: ["Career Pressure", "Loneliness", "Life Transitions"],
    category: "Stress & Anxiety",
    experience: "6+ Years",
    languages: ["English", "Hindi", "Bengali"],
    rating: "4.8",
    reviewsCount: "480+",
    pricePerMin: 40,
    image:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=500&auto=format&fit=crop&q=60",
  },
  {
    id: 5,
    name: "Sneha Patel",
    status: "Available Today",
    statusType: "today",
    expertise: ["Self-Esteem", "Gentle Guidance", "Safe Venting"],
    category: "Emotional Support",
    experience: "4+ Years",
    languages: ["Gujarati", "Hindi", "English"],
    rating: "4.9",
    reviewsCount: "310+",
    pricePerMin: 30,
    image:
      "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=500&auto=format&fit=crop&q=60",
  },
  {
    id: 6,
    name: "Arjun Kapoor",
    status: "Available Today",
    statusType: "today",
    expertise: ["Relationship Venting", "Mindfulness", "Life Balance"],
    category: "Relationship Talk",
    experience: "5+ Years",
    languages: ["English", "Hindi"],
    rating: "4.7",
    reviewsCount: "220+",
    pricePerMin: 35,
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=60",
  },
];

export default function JudgmentFreeSpace({
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

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
  };

  const filteredListeners = MOCK_LISTENERS.filter((listener) => {
    const matchesCategory =
      selectedCategory === "All" ||
      listener.category === selectedCategory ||
      listener.expertise.includes(selectedCategory);

    const matchesSearch =
      listener.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listener.expertise.some((exp) =>
        exp.toLowerCase().includes(searchQuery.toLowerCase()),
      ) ||
      listener.languages.some((lang) =>
        lang.toLowerCase().includes(searchQuery.toLowerCase()),
      );

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="jfz-page-container">
      {/* Hero Wrapper with Image Background */}
      <div
        className="jfz-hero-wrapper"
        style={{ backgroundImage: `url(${judgementHeroBg})` }}
      >
        {/* Navigation Header */}
        <header className="jfz-header">
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
            <a href="#listeners" className="nav-link active">
              Listeners
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
                Start a Chat
              </button>
            )}
          </div>
        </header>

        {/* Hero Content Overlay */}
        <div className="hero-overlay-content">
          <span className="hero-subheading">JUDGEMENT FREE ZONE</span>
          <h1 className="hero-main-title">
            Sometimes,
            <br />
            you just need
            <br />
            someone to listen.
          </h1>
          <p className="hero-description">
            No judgement. No pressure.
            <br />
            Just a space to be heard.
          </p>

          <div className="hero-cta-group">
            <button className="btn-hero-book">Talk Now &rarr;</button>
            <button className="btn-hero-secondary">How It Works</button>
          </div>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="jfz-body-content">
        {/* Search & Filter Container */}
        <section className="filter-container">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search active listeners by name, topic, or language..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="btn-search">Search &rarr;</button>
          </div>

          <div className="filter-pills">
            {[
              "All",
              "Emotional Support",
              "Stress & Anxiety",
              "Peer Listening",
              "Relationship Talk",
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
            <button className="btn-reset" onClick={handleResetFilters}>
              Reset All
            </button>
          </div>
        </section>

        {/* Center-Aligned Section Header */}
        <div className="section-title-wrapper">
          <span className="section-subheading">LISTENING COMPANIONS</span>
          <h2 className="section-main-heading">
            Connect with Someone Who Cares.
          </h2>
        </div>

        {/* Listeners Grid */}
        <section className="consultants-grid">
          {filteredListeners.map((listener) => (
            <div key={listener.id} className="consultant-card">
              <div className="card-header">
                <div className="avatar-wrapper">
                  <img src={listener.image} alt={listener.name} />
                </div>
                <div className="header-info">
                  <div className="name-status-row">
                    <h3>{listener.name}</h3>
                    <span className={`status-pill ${listener.statusType}`}>
                      • {listener.status}
                    </span>
                  </div>
                  <p className="expertise-tags">
                    {listener.expertise.join(" • ")}
                  </p>
                  <div className="meta-info-row">
                    <span className="meta-item">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <rect
                          x="2"
                          y="7"
                          width="20"
                          height="14"
                          rx="2"
                          ry="2"
                        />
                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                      </svg>
                      {listener.experience} Listening
                    </span>
                    <span className="meta-item">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <line x1="2" y1="12" x2="22" y2="12" />
                      </svg>
                      {listener.languages.join(", ")}
                    </span>
                    <span className="meta-item rating">
                      <span className="star-icon">★</span> {listener.rating}
                      <span className="review-count">
                        ({listener.reviewsCount} reviews)
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="card-footer">
                <div className="price-tag">
                  <span className="price-amount">₹ {listener.pricePerMin}</span>
                  <span className="price-unit">/min</span>
                </div>
                <div className="action-btns">
                  <button className="btn-secondary-action">View Profile</button>
                  <button className="btn-primary-action">Connect Now</button>
                </div>
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
