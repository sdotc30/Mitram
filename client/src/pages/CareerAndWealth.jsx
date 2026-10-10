import React, { useState, useRef, useEffect } from "react";
import "./CareerAndWealth.css";

import logoImg from "../assets/logo.png";
import careerHeroBg from "../assets/Career-hero.png";
import { useAuth } from "../AuthContext";

// Mock Career & Wealth Consultants
const MOCK_CONSULTANTS = [
  {
    id: 1,
    name: "Acharya Vikram",
    status: "Online Now",
    statusType: "available",
    expertise: ["Career Growth", "Financial Timing", "Business Astrology"],
    category: "Career Guidance",
    experience: "12+ Years",
    languages: ["English", "Hindi"],
    rating: "4.9",
    reviewsCount: "620+",
    pricePerMin: 60,
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=60",
  },
  {
    id: 2,
    name: "Dr. Sunita Mehta",
    status: "Online Now",
    statusType: "available",
    expertise: ["Wealth & Investments", "Dasha Timing", "Job Shifts"],
    category: "Wealth & Finance",
    experience: "15+ Years",
    languages: ["Hindi", "English", "Gujarati"],
    rating: "4.95",
    reviewsCount: "850+",
    pricePerMin: 75,
    image:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop&q=60",
  },
  {
    id: 3,
    name: "Pandit Rajesh Shastri",
    status: "In Session",
    statusType: "busy",
    expertise: ["Business Ventures", "Corporate Astrology", "Wealth Yogas"],
    category: "Business Strategy",
    experience: "18+ Years",
    languages: ["English", "Hindi", "Sanskrit"],
    rating: "4.88",
    reviewsCount: "940+",
    pricePerMin: 80,
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=60",
  },
  {
    id: 4,
    name: "Meera Deshmukh",
    status: "Available Today",
    statusType: "today",
    expertise: ["Promotions", "Foreign Work Prospects", "Financial Remedies"],
    category: "Career Guidance",
    experience: "8+ Years",
    languages: ["English", "Marathi", "Hindi"],
    rating: "4.85",
    reviewsCount: "410+",
    pricePerMin: 50,
    image:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=500&auto=format&fit=crop&q=60",
  },
];

export default function CareerAndWealth({
  onBack,
  onOpenAuth,
  onOpenSidebar,
  userProfile,
}) {
  const { currentUser, logout } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLanguage, setSelectedLanguage] = useState("All");
  const [selectedPrice, setSelectedPrice] = useState("All");
  const [selectedAvailability, setSelectedAvailability] = useState("All");

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(e.target)
      ) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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

  const getUserFirstInitial = () => {
    const name = getUserDisplayName().trim();
    return name ? name.charAt(0).toUpperCase() : "S";
  };

  const getUserInitials = () => {
    const name = getUserDisplayName().trim();
    if (!name) return "SC";

    const parts = name.split(" ").filter(Boolean);
    if (parts.length > 1) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setSelectedLanguage("All");
    setSelectedPrice("All");
    setSelectedAvailability("All");
  };

  const filteredConsultants = MOCK_CONSULTANTS.filter((consultant) => {
    const matchesCategory =
      selectedCategory === "All" ||
      consultant.category === selectedCategory ||
      consultant.expertise.includes(selectedCategory);

    const matchesLanguage =
      selectedLanguage === "All" ||
      consultant.languages.includes(selectedLanguage);

    const matchesAvailability =
      selectedAvailability === "All" ||
      (selectedAvailability === "Online Now" &&
        consultant.statusType === "available") ||
      (selectedAvailability === "Available Today" &&
        consultant.statusType === "today");

    const matchesSearch =
      consultant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      consultant.expertise.some((exp) =>
        exp.toLowerCase().includes(searchQuery.toLowerCase()),
      ) ||
      consultant.languages.some((lang) =>
        lang.toLowerCase().includes(searchQuery.toLowerCase()),
      );

    return (
      matchesCategory && matchesLanguage && matchesAvailability && matchesSearch
    );
  });

  return (
    <div className="cw-page-container">
      {/* Hero Wrapper with Background Image */}
      <div
        className="cw-hero-wrapper"
        style={{ backgroundImage: `url(${careerHeroBg})` }}
      >
        {/* Top Header Bar */}
        <header className="cw-header">
          <div className="header-left">
            <button
              className="hamburger-circle-btn"
              onClick={onOpenSidebar}
              aria-label="Open Sidebar"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div
              className="logo-pill"
              onClick={onBack}
              style={{ cursor: "pointer" }}
            >
              <img
                src={logoImg}
                alt="Mitram Logo"
                className="header-logo-img"
              />
            </div>
          </div>

          <nav className="center-nav-pill">
            <button onClick={onBack} className="nav-item-btn">
              Home
            </button>
            <a href="#consultants" className="nav-item-btn active">
              Consultations
            </a>
            <button onClick={onBack} className="nav-item-btn">
              Reviews
            </button>
            <button onClick={onBack} className="nav-item-btn">
              About
            </button>
          </nav>

          <div className="header-right" ref={profileDropdownRef}>
            {currentUser ? (
              <div className="user-profile-wrapper">
                <button
                  className="profile-pill-btn"
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                >
                  <div className="currency-badge">{getUserFirstInitial()}</div>
                  <span className="user-initials-text">
                    {getUserInitials()}
                  </span>
                  <svg
                    className={`dropdown-chevron ${
                      isProfileMenuOpen ? "open" : ""
                    }`}
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
                      <p className="dropdown-user-name">
                        {getUserDisplayName()}
                      </p>
                      <p className="dropdown-user-sub">
                        {currentUser.email || "Guest Account"}
                      </p>
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
              <button className="book-pill-btn" onClick={onOpenAuth}>
                Book Consultation
              </button>
            )}
          </div>
        </header>

        {/* Hero Left-Aligned Content */}
        <div className="hero-left-content">
          <span className="hero-subheading">
            CAREER & WEALTH <span className="subheading-line"></span>
          </span>
          <h1 className="hero-main-title">
            Align Your Purpose
            <br />
            With <em>Prosperity</em>
          </h1>
          <p className="hero-description">
            Get astrological guidance for your career path, financial growth and
            new opportunities. Understand the right timing, make confident
            decisions, and build a more abundant future.
          </p>
        </div>

        {/* Search & Filter Floating Card */}
        <div className="hero-floating-filter-card" id="consultants">
          <div className="floating-search-row">
            <input
              type="text"
              placeholder="Search astrologers by name, expertise, or language..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="floating-search-input"
            />
            <button className="btn-gold-search">Search &rarr;</button>
          </div>

          <div className="floating-dropdowns-row">
            <div className="dropdown-select-wrapper">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="All">Career & Wealth</option>
                <option value="Career Guidance">Career Guidance</option>
                <option value="Wealth & Finance">Wealth & Finance</option>
                <option value="Business Strategy">Business Strategy</option>
              </select>
            </div>

            <div className="dropdown-select-wrapper">
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
              >
                <option value="All">Language</option>
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
                <option value="Gujarati">Gujarati</option>
                <option value="Marathi">Marathi</option>
              </select>
            </div>

            <div className="dropdown-select-wrapper">
              <select
                value={selectedPrice}
                onChange={(e) => setSelectedPrice(e.target.value)}
              >
                <option value="All">Price Range</option>
                <option value="under60">Under ₹60/min</option>
                <option value="60to80">₹60 - ₹80/min</option>
                <option value="above80">Above ₹80/min</option>
              </select>
            </div>

            <div className="dropdown-select-wrapper">
              <select
                value={selectedAvailability}
                onChange={(e) => setSelectedAvailability(e.target.value)}
              >
                <option value="All">Availability</option>
                <option value="Online Now">Online Now</option>
                <option value="Available Today">Available Today</option>
              </select>
            </div>

            <button className="btn-reset-filters" onClick={handleResetFilters}>
              Reset All
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid Body */}
      <div className="cw-body-content">
        <div className="section-title-wrapper">
          <span className="section-subheading">CAREER & WEALTH EXPERTS</span>
          <h2 className="section-main-heading">
            Unlock Financial & Professional Growth
          </h2>
        </div>

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
                  <button className="btn-primary-action">Consult Now</button>
                </div>
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
