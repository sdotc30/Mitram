import React, { useState, useEffect } from "react";
import "./VastuAndLivingSpaces.css";

import logoImg from "../assets/logo.png";
import vastuHeroBg from "../assets/vastu-hero.png";
import { useAuth } from "../AuthContext";
import { fetchAstrologers } from "../services/astrologerService";

export default function VastuAndLivingSpaces({
  onBack,
  onOpenAuth,
  onOpenSidebar,
  userProfile,
  onViewAstrologerProfile,
}) {
  const { currentUser, logout } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  // Live backend consultants state for 'VASTU' category
  const [consultantsList, setConsultantsList] = useState([]);
  const [isLoadingConsultants, setIsLoadingConsultants] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadVastuExperts() {
      setIsLoadingConsultants(true);
      try {
        // Fetch only astrologers tagged with the 'VASTU' category code
        const data = await fetchAstrologers("VASTU");
        if (isMounted) {
          setConsultantsList(data || []);
        }
      } catch (err) {
        console.error("Failed to load vastu consultants:", err);
      } finally {
        if (isMounted) {
          setIsLoadingConsultants(false);
        }
      }
    }
    loadVastuExperts();
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

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
  };

  const filteredConsultants = consultantsList.filter((consultant) => {
    const categories = consultant.categories || [];
    const expertise = consultant.expertise || [];
    const languages = consultant.languages || [];

    const matchesCategory =
      selectedCategory === "All" ||
      categories.includes(selectedCategory) ||
      (consultant.category &&
        consultant.category
          .toLowerCase()
          .includes(selectedCategory.toLowerCase())) ||
      expertise.some((e) =>
        e.toLowerCase().includes(selectedCategory.toLowerCase()),
      );

    const matchesSearch =
      consultant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expertise.some((exp) =>
        exp.toLowerCase().includes(searchQuery.toLowerCase()),
      ) ||
      languages.some((lang) =>
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

            <div
              className="header-logo-container"
              onClick={onBack}
              style={{ cursor: "pointer" }}
            >
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
      <div className="vastu-body-content" id="consultations">
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
        {isLoadingConsultants ? (
          <div
            style={{ textAlign: "center", padding: "3rem", color: "#8a7e78" }}
          >
            Loading Vastu consultants...
          </div>
        ) : filteredConsultants.length === 0 ? (
          <div
            style={{ textAlign: "center", padding: "3rem", color: "#8a7e78" }}
          >
            No Vastu experts available for this filter right now.
          </div>
        ) : (
          <section className="consultants-grid">
            {filteredConsultants.map((consultant) => (
              <div key={consultant.id} className="consultant-card">
                <div
                  className="card-header"
                  onClick={() =>
                    onViewAstrologerProfile &&
                    onViewAstrologerProfile(consultant.id)
                  }
                  style={{ cursor: "pointer" }}
                >
                  <div className="avatar-wrapper">
                    <img src={consultant.image} alt={consultant.name} />
                  </div>
                  <div className="header-info">
                    <div className="name-status-row">
                      <h3>{consultant.name}</h3>
                      <span
                        className={`status-pill ${
                          consultant.status_type ||
                          consultant.statusType ||
                          "available"
                        }`}
                      >
                        • {consultant.status}
                      </span>
                    </div>
                    <p className="expertise-tags">
                      {Array.isArray(consultant.expertise)
                        ? consultant.expertise.join(" • ")
                        : consultant.expertise}
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
                        {Array.isArray(consultant.languages)
                          ? consultant.languages.join(", ")
                          : consultant.languages}
                      </span>
                      <span className="meta-item rating">
                        <span className="star-icon">★</span> {consultant.rating}
                        <span className="review-count">
                          (
                          {consultant.reviews_count ||
                            consultant.reviewsCount ||
                            "100+"}{" "}
                          reviews)
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="card-footer">
                  <div className="price-tag">
                    <span className="price-amount">
                      ₹ {consultant.price_per_min || consultant.pricePerMin}
                    </span>
                    <span className="price-unit">/min</span>
                  </div>
                  <div className="action-btns">
                    <button
                      className="btn-primary-action"
                      onClick={() =>
                        onViewAstrologerProfile &&
                        onViewAstrologerProfile(consultant.id)
                      }
                    >
                      Consult Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}
