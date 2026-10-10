import React, { useState } from "react";
import "./VastuAndLivingSpaces.css";

import logoImg from "../assets/logo.png";
import vastuHeroBg from "../assets/vastu-hero.png";
import { useAuth } from "../AuthContext";

// Vastu Consultants Data
const MOCK_VASTU_CONSULTANTS = [
  {
    id: 1,
    name: "Dr. Ananya Sharma",
    status: "Available Now",
    statusType: "available",
    expertise: ["Home Vastu", "Office Vastu", "Space Energy"],
    category: "Home Vastu",
    experience: "8+ Years",
    languages: ["Hindi", "English"],
    rating: "4.9",
    reviewsCount: "320+",
    pricePerMin: 60,
    image:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop&q=60",
  },
  {
    id: 2,
    name: "Acharya Rohan Mehta",
    status: "Available Now",
    statusType: "available",
    expertise: ["Floor Plan Analysis", "Residential Vastu", "Remedies"],
    category: "Floor Plan Analysis",
    experience: "12+ Years",
    languages: ["Hindi", "English", "Gujarati"],
    rating: "4.8",
    reviewsCount: "410+",
    pricePerMin: 80,
    image:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=500&auto=format&fit=crop&q=60",
  },
  {
    id: 3,
    name: "Shalini Iyer",
    status: "Available Now",
    statusType: "available",
    expertise: ["Home Vastu", "Interior Alignment", "Element Balancing"],
    category: "Home Vastu",
    experience: "6+ Years",
    languages: ["English", "Hindi", "Tamil"],
    rating: "4.9",
    reviewsCount: "280+",
    pricePerMin: 50,
    image:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=500&auto=format&fit=crop&q=60",
  },
  {
    id: 4,
    name: "Dr. Vivek Rao",
    status: "In Session",
    statusType: "busy",
    expertise: ["Commercial Vastu", "Business Growth", "Space Planning"],
    category: "Office Vastu",
    experience: "15+ Years",
    languages: ["English", "Hindi"],
    rating: "4.8",
    reviewsCount: "500+",
    pricePerMin: 100,
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=60",
  },
  {
    id: 5,
    name: "Meera Kulkarni",
    status: "Available Today",
    statusType: "today",
    expertise: ["Home Vastu", "Land & Plot Analysis", "Remedies"],
    category: "Remedies & Energy",
    experience: "9+ Years",
    languages: ["Marathi", "Hindi", "English"],
    rating: "4.9",
    reviewsCount: "310+",
    pricePerMin: 70,
    image:
      "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=500&auto=format&fit=crop&q=60",
  },
  {
    id: 6,
    name: "Karan Malhotra",
    status: "Available Today",
    statusType: "today",
    expertise: ["Office Vastu", "Workspace Design", "Energy Alignment"],
    category: "Office Vastu",
    experience: "7+ Years",
    languages: ["English", "Hindi", "Punjabi"],
    rating: "4.7",
    reviewsCount: "200+",
    pricePerMin: 65,
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=60",
  },
];

export default function VastuAndLivingSpaces({
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

  const filteredConsultants = MOCK_VASTU_CONSULTANTS.filter((consultant) => {
    const matchesCategory =
      selectedCategory === "All" ||
      consultant.category === selectedCategory ||
      consultant.expertise.includes(selectedCategory);

    const matchesSearch =
      consultant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      consultant.expertise.some((exp) =>
        exp.toLowerCase().includes(searchQuery.toLowerCase()),
      ) ||
      consultant.languages.some((lang) =>
        lang.toLowerCase().includes(searchQuery.toLowerCase()),
      );

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="vastu-page-container">
      {/* Edge-to-Edge Hero Container */}
      <div
        className="vastu-hero-wrapper"
        style={{ backgroundImage: `url(${vastuHeroBg})` }}
      >
        {/* Navigation Header */}
        <header className="vastu-header">
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
          <span className="hero-subheading">VASTU &amp; LIVING SPACE</span>
          <h1 className="hero-main-title">
            Harmonize Your Space,
            <br />
            Elevate Your Life.
          </h1>
          <p className="hero-description">
            Discover personalized Vastu guidance to create a home or workspace
            that supports peace, prosperity, good health, and positive energy.
          </p>

          <div className="hero-cta-group">
            <button className="btn-hero-book">Book a Session &rarr;</button>
            <button className="btn-hero-secondary">
              Explore Vastu Services
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="vastu-body-content">
        {/* Search & Filter Section */}
        <section className="filter-container">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search Vastu consultants by name, expertise, or language..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="btn-search">Search &rarr;</button>
          </div>

          <div className="filter-pills">
            {[
              "All",
              "Home Vastu",
              "Office Vastu",
              "Floor Plan Analysis",
              "Remedies & Energy",
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
          <span className="section-subheading">OUR VASTU CONSULTANTS</span>
          <h2 className="section-main-heading">
            Find the Right Consultant for Your Space.
          </h2>
        </div>

        {/* Consultants Grid */}
        <section className="consultants-grid">
          {filteredConsultants.map((consultant) => (
            <div key={consultant.id} className="consultant-card">
              <div className="card-header">
                <div className="avatar-wrapper">
                  <img src={consultant.image} alt={consultant.name} />
                </div>
                <div className="header-info">
                  <div className="name-status-row">
                    <h3>{consultant.name}</h3>
                    <span className={`status-pill ${consultant.statusType}`}>
                      • {consultant.status}
                    </span>
                  </div>
                  <p className="expertise-tags">
                    {consultant.expertise.join(" • ")}
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
                      {consultant.experience} Experience
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
                      {consultant.languages.join(", ")}
                    </span>
                    <span className="meta-item rating">
                      <span className="star-icon">★</span> {consultant.rating}
                      <span className="review-count">
                        ({consultant.reviewsCount} reviews)
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="card-footer">
                <div className="price-tag">
                  <span className="price-amount">
                    ₹ {consultant.pricePerMin}
                  </span>
                  <span className="price-unit">/min</span>
                </div>
                <div className="action-btns">
                  <button className="btn-secondary-action">View Profile</button>
                  <button className="btn-primary-action">Book Session</button>
                </div>
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
