import React, { useState, useRef, useEffect } from "react";
import "./KundliAndBirthChart.css";

import logoImg from "../assets/logo.png";
import kundliHeroBg from "../assets/Kundli-hero.png";
import { useAuth } from "../AuthContext";

const HERO_BG_FALLBACK = kundliHeroBg || "";

// Mock Planetary Positions Data
const MOCK_PLANETARY_POSITIONS = [
  {
    planet: "Sun (Surya)",
    rashi: "Aries (Mesha)",
    degree: "14° 22'",
    house: "1st",
    nakshatra: "Bharani",
    pada: "1",
  },
  {
    planet: "Moon (Chandra)",
    rashi: "Taurus (Vrishabha)",
    degree: "08° 15'",
    house: "2nd",
    nakshatra: "Krittika",
    pada: "4",
  },
  {
    planet: "Mars (Mangal)",
    rashi: "Scorpio (Vrishchik)",
    degree: "21° 40'",
    house: "8th",
    nakshatra: "Jyeshta",
    pada: "2",
  },
  {
    planet: "Mercury (Budh)",
    rashi: "Pisces (Meen)",
    degree: "03° 10'",
    house: "12th",
    nakshatra: "Uttara Bhadrapada",
    pada: "1",
  },
  {
    planet: "Jupiter (Guru)",
    rashi: "Sagittarius (Dhanu)",
    degree: "18° 55'",
    house: "9th",
    nakshatra: "Purva Ashadha",
    pada: "3",
  },
  {
    planet: "Venus (Shukra)",
    rashi: "Taurus (Vrishabha)",
    degree: "27° 04'",
    house: "2nd",
    nakshatra: "Mrigashira",
    pada: "2",
  },
  {
    planet: "Saturn (Shani)",
    rashi: "Capricorn (Makar)",
    degree: "11° 30'",
    house: "10th",
    nakshatra: "Shravana",
    pada: "1",
  },
  {
    planet: "Rahu",
    rashi: "Gemini (Mithun)",
    degree: "05° 12'",
    house: "3rd",
    nakshatra: "Mrigashira",
    pada: "4",
  },
  {
    planet: "Ketu",
    rashi: "Sagittarius (Dhanu)",
    degree: "05° 12'",
    house: "9th",
    nakshatra: "Mula",
    pada: "2",
  },
];

// Mock Astrologer Consultants for Chart Consultation
const MOCK_KUNDLI_CONSULTANTS = [
  {
    id: 1,
    name: "Pandit Ramachandra",
    status: "Online Now",
    statusType: "available",
    expertise: ["Birth Chart Analysis", "Dasha Timing", "Vedic Remedies"],
    category: "Kundli Reading",
    experience: "16+ Years",
    languages: ["English", "Hindi", "Sanskrit"],
    rating: "4.95",
    reviewsCount: "1,120+",
    pricePerMin: 65,
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=60",
  },
  {
    id: 2,
    name: "Dr. Ananya Shastri",
    status: "Online Now",
    statusType: "available",
    expertise: ["Navamsha Analysis", "Dosha Redressal", "Life Career Kundli"],
    category: "Chart Interpretation",
    experience: "14+ Years",
    languages: ["Hindi", "English"],
    rating: "4.90",
    reviewsCount: "890+",
    pricePerMin: 70,
    image:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop&q=60",
  },
  {
    id: 3,
    name: "Acharya Dev Vrat",
    status: "In Session",
    statusType: "busy",
    expertise: ["Mangal Dosha", "Sade Sati Phase", "Planetary Yogas"],
    category: "Dosha & Yogas",
    experience: "20+ Years",
    languages: ["English", "Hindi", "Gujarati"],
    rating: "4.88",
    reviewsCount: "1,450+",
    pricePerMin: 85,
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=60",
  },
];

export default function KundliAndBirthChart({
  onBack,
  onOpenAuth,
  onOpenSidebar,
  userProfile,
  setIsDetailsModalOpen,
}) {
  const { currentUser, logout } = useAuth();

  // Active chart view state
  const [activeTab, setActiveTab] = useState("chart"); // 'chart' | 'planets' | 'dasha' | 'dosha'

  // User Profile Birth Details State
  const [userBirthDetails, setUserBirthDetails] = useState(null);

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileDropdownRef = useRef(null);

  // Load Saved Birth Details on Mount / Change
  useEffect(() => {
    if (currentUser) {
      const savedDetails = localStorage.getItem(
        `user_details_${currentUser.uid}`,
      );
      if (savedDetails) {
        try {
          const parsed = JSON.parse(savedDetails);
          setUserBirthDetails(parsed);
        } catch (e) {
          console.error("Failed to parse birth details", e);
        }
      } else {
        const defaultData = {
          fullName:
            userProfile?.displayName || currentUser.displayName || "User",
          dob: "1998-05-15",
          timeOfBirth: "08:30",
          placeOfBirth: "New Delhi, India",
          gender: "male",
        };
        setUserBirthDetails(defaultData);
      }
    } else {
      const guestData = {
        fullName: "Guest User",
        dob: "1995-10-24",
        timeOfBirth: "14:15",
        placeOfBirth: "Mumbai, India",
        gender: "other",
      };
      setUserBirthDetails(guestData);
    }
  }, [currentUser, userProfile]);

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
    if (userBirthDetails?.fullName) return userBirthDetails.fullName;
    const savedName = localStorage.getItem("userName");
    if (savedName) return savedName;

    if (userProfile?.displayName) return userProfile.displayName;
    if (currentUser?.displayName) return currentUser.displayName;

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

  // Open central modal in EDIT mode
  const handleOpenEdit = () => {
    if (setIsDetailsModalOpen) {
      setIsDetailsModalOpen(true);
    }
  };

  // Open central modal for NEW profile entry
  const handleOpenNew = () => {
    if (setIsDetailsModalOpen) {
      setIsDetailsModalOpen(true);
    }
  };

  return (
    <div className="kundli-page-container">
      {/* Hero Section */}
      <div
        className="kundli-hero-wrapper"
        style={{
          backgroundImage: HERO_BG_FALLBACK
            ? `url(${HERO_BG_FALLBACK})`
            : "none",
        }}
      >
        {/* Top Header Bar */}
        <header className="kundli-header">
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
            <a href="#chart-section" className="nav-item-btn active">
              Kundli Chart
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
                Get Your Kundli
              </button>
            )}
          </div>
        </header>

        {/* Hero Content */}
        <div className="hero-left-content">
          <span className="hero-subheading">
            KUNDLI & BIRTH CHART <span className="subheading-line"></span>
          </span>
          <h1 className="hero-main-title">
            Unveil Your <em>Celestial</em>
            <br />
            Blueprint
          </h1>
          <p className="hero-description">
            Explore your accurate birth chart calculations, planetary
            placements, running Dasha periods, and Vedic yoga insights derived
            from your exact birth timing.
          </p>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="kundli-body-content" id="chart-section">
        {/* User Birth Details Summary & Reactive Action Buttons */}
        <section className="birth-summary-card">
          <div className="summary-card-header">
            <div className="summary-title-group">
              <span className="badge-active-profile">
                ✦ Active Birth Profile
              </span>
              <h3>{userBirthDetails?.fullName || "User Profile"}</h3>
            </div>
            <div className="summary-actions-row">
              <button
                className="btn-summary-action btn-edit"
                onClick={handleOpenEdit}
              >
                ✎ Edit Details
              </button>
              <button
                className="btn-summary-action btn-new"
                onClick={handleOpenNew}
              >
                + Enter New Details
              </button>
            </div>
          </div>

          <div className="summary-data-grid">
            <div className="data-item">
              <span className="data-label">Date of Birth</span>
              <span className="data-value">
                {userBirthDetails?.dob || "15 May 1998"}
              </span>
            </div>
            <div className="data-item">
              <span className="data-label">Time of Birth</span>
              <span className="data-value">
                {userBirthDetails?.timeOfBirth || "08:30 AM"}
              </span>
            </div>
            <div className="data-item">
              <span className="data-label">Place of Birth</span>
              <span className="data-value">
                {userBirthDetails?.placeOfBirth || "New Delhi, India"}
              </span>
            </div>
            <div className="data-item">
              <span className="data-label">Gender</span>
              <span className="data-value">
                {userBirthDetails?.gender
                  ? userBirthDetails.gender.toUpperCase()
                  : "MALE"}
              </span>
            </div>
          </div>
        </section>

        {/* Interactive Chart Viewer Tabs */}
        <section className="chart-viewer-section">
          <div className="chart-tabs-header">
            <button
              className={`chart-tab-btn ${activeTab === "chart" ? "active" : ""}`}
              onClick={() => setActiveTab("chart")}
            >
              Birth Chart (Lagna)
            </button>
            <button
              className={`chart-tab-btn ${activeTab === "planets" ? "active" : ""}`}
              onClick={() => setActiveTab("planets")}
            >
              Planetary Positions
            </button>
            <button
              className={`chart-tab-btn ${activeTab === "dasha" ? "active" : ""}`}
              onClick={() => setActiveTab("dasha")}
            >
              Vimshottari Dasha
            </button>
            <button
              className={`chart-tab-btn ${activeTab === "dosha" ? "active" : ""}`}
              onClick={() => setActiveTab("dosha")}
            >
              Dosha Analysis
            </button>
          </div>

          <div className="chart-tab-display">
            {/* Tab 1: Visual Birth Chart Diagram */}
            {activeTab === "chart" && (
              <div className="chart-diagram-wrapper">
                <div className="chart-box-container">
                  <div className="north-indian-chart">
                    {/* Visual Diamond Chart SVG Grid */}
                    <svg viewBox="0 0 300 300" className="chart-svg">
                      <rect
                        x="5"
                        y="5"
                        width="290"
                        height="290"
                        fill="none"
                        stroke="#a37c3f"
                        strokeWidth="2"
                      />
                      <line
                        x1="5"
                        y1="5"
                        x2="295"
                        y2="295"
                        stroke="#a37c3f"
                        strokeWidth="1.5"
                      />
                      <line
                        x1="295"
                        y1="5"
                        x2="5"
                        y2="295"
                        stroke="#a37c3f"
                        strokeWidth="1.5"
                      />
                      <polygon
                        points="150,5 295,150 150,295 5,150"
                        fill="none"
                        stroke="#a37c3f"
                        strokeWidth="1.5"
                      />

                      {/* House Numbers & Planets Labels */}
                      <text
                        x="150"
                        y="80"
                        textAnchor="middle"
                        fill="#2c2523"
                        fontSize="12"
                        fontWeight="600"
                      >
                        1st (ASC) Sun
                      </text>
                      <text
                        x="80"
                        y="50"
                        textAnchor="middle"
                        fill="#615953"
                        fontSize="11"
                      >
                        2nd Moon, Ven
                      </text>
                      <text
                        x="40"
                        y="100"
                        textAnchor="middle"
                        fill="#615953"
                        fontSize="11"
                      >
                        3rd Rahu
                      </text>
                      <text
                        x="80"
                        y="150"
                        textAnchor="middle"
                        fill="#615953"
                        fontSize="11"
                      >
                        4th
                      </text>
                      <text
                        x="40"
                        y="200"
                        textAnchor="middle"
                        fill="#615953"
                        fontSize="11"
                      >
                        5th
                      </text>
                      <text
                        x="80"
                        y="250"
                        textAnchor="middle"
                        fill="#615953"
                        fontSize="11"
                      >
                        6th
                      </text>
                      <text
                        x="150"
                        y="220"
                        textAnchor="middle"
                        fill="#615953"
                        fontSize="11"
                      >
                        7th
                      </text>
                      <text
                        x="220"
                        y="250"
                        textAnchor="middle"
                        fill="#615953"
                        fontSize="11"
                      >
                        8th Mars
                      </text>
                      <text
                        x="260"
                        y="200"
                        textAnchor="middle"
                        fill="#615953"
                        fontSize="11"
                      >
                        9th Jup, Ketu
                      </text>
                      <text
                        x="220"
                        y="150"
                        textAnchor="middle"
                        fill="#615953"
                        fontSize="11"
                      >
                        10th Sat
                      </text>
                      <text
                        x="260"
                        y="100"
                        textAnchor="middle"
                        fill="#615953"
                        fontSize="11"
                      >
                        11th
                      </text>
                      <text
                        x="220"
                        y="50"
                        textAnchor="middle"
                        fill="#615953"
                        fontSize="11"
                      >
                        12th Merc
                      </text>
                    </svg>
                  </div>
                </div>
                <div className="chart-legend">
                  <h4>Lagna Ascendant: Aries (Mesha)</h4>
                  <p>
                    Your birth chart indicates strong leadership qualities with
                    Sun in the 1st house. Jupiter’s placement in the 9th house
                    grants wisdom and good fortune in long-term endeavors.
                  </p>
                </div>
              </div>
            )}

            {/* Tab 2: Planetary Table */}
            {activeTab === "planets" && (
              <div className="table-responsive-wrapper">
                <table className="planets-table">
                  <thead>
                    <tr>
                      <th>Planet</th>
                      <th>Rashi (Sign)</th>
                      <th>Degree</th>
                      <th>House</th>
                      <th>Nakshatra</th>
                      <th>Pada</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MOCK_PLANETARY_POSITIONS.map((row, idx) => (
                      <tr key={idx}>
                        <td className="planet-name">{row.planet}</td>
                        <td>{row.rashi}</td>
                        <td>{row.degree}</td>
                        <td>{row.house}</td>
                        <td>{row.nakshatra}</td>
                        <td>{row.pada}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Tab 3: Dasha Period */}
            {activeTab === "dasha" && (
              <div className="dasha-container">
                <div className="dasha-active-card">
                  <span className="dasha-tag">CURRENT ACTIVE DASHA</span>
                  <h3>Jupiter (Guru) Mahadasha</h3>
                  <p className="dasha-dates">12 Nov 2021 &mdash; 12 Nov 2037</p>
                  <p className="dasha-sub">
                    Active Antardasha: Saturn (Shani) &bull; Ends Oct 2027
                  </p>
                </div>
                <div className="dasha-list">
                  <div className="dasha-item completed">
                    <span className="dasha-name">Rahu Mahadasha</span>
                    <span className="dasha-status">
                      Completed (2003 - 2021)
                    </span>
                  </div>
                  <div className="dasha-item current">
                    <span className="dasha-name">Jupiter Mahadasha</span>
                    <span className="dasha-status">
                      Active Now (2021 - 2037)
                    </span>
                  </div>
                  <div className="dasha-item upcoming">
                    <span className="dasha-name">Saturn Mahadasha</span>
                    <span className="dasha-status">Upcoming (2037 - 2056)</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 4: Dosha Analysis */}
            {activeTab === "dosha" && (
              <div className="dosha-cards-grid">
                <div className="dosha-card safe">
                  <div className="dosha-icon">✓</div>
                  <h4>Mangal Dosha</h4>
                  <span className="dosha-badge no-dosha">
                    No Dosha Detected
                  </span>
                  <p>
                    Mars is favorably placed in your chart without afflictions
                    to marriage houses.
                  </p>
                </div>

                <div className="dosha-card warning">
                  <div className="dosha-icon">✦</div>
                  <h4>Sade Sati Phase</h4>
                  <span className="dosha-badge active-dosha">
                    Phase 2 Active
                  </span>
                  <p>
                    Saturn transit requires mindful discipline and focus during
                    career investments.
                  </p>
                </div>

                <div className="dosha-card safe">
                  <div className="dosha-icon">✓</div>
                  <h4>Kaal Sarp Dosha</h4>
                  <span className="dosha-badge no-dosha">Absent</span>
                  <p>
                    Planetary positions are well-balanced across your birth
                    chart houses.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Expert Consultation Section */}
        <section className="consultants-section">
          <div className="section-title-wrapper">
            <span className="section-subheading">
              KUNDLI & CHART ASTROLOGERS
            </span>
            <h2 className="section-main-heading">
              Discuss Your Birth Chart Live
            </h2>
          </div>

          <div className="consultants-grid">
            {MOCK_KUNDLI_CONSULTANTS.map((consultant) => (
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
                        {consultant.experience}
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
                    <button className="btn-secondary-action">
                      View Profile
                    </button>
                    <button className="btn-primary-action">Consult Now</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
