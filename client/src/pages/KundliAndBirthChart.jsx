import React, { useState, useRef, useEffect } from "react";
import "./KundliAndBirthChart.css";

import logoImg from "../assets/logo.png";
import kundliHeroBg from "../assets/Kundli-hero.png";
import { useAuth } from "../AuthContext";
import { fetchKundliData } from "../services/astrologyApi";

const HERO_BG_FALLBACK = kundliHeroBg || "";

const LOADING_MESSAGES = [
  "Resolving geographic coordinates & timezone offsets...",
  "Computing exact sidereal ephemerides & Lahiri ayanamsha...",
  "Mapping planetary houses, rashis, and nakshatra padas...",
  "Synthesizing Vimshottari Dasha cycles and planetary alignments...",
  "Finalizing your celestial blueprint...",
];

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

const VIMSHOTTARI_SEQUENCE = [
  {
    planet: "Ketu",
    years: 7,
    significance:
      "Spiritual awakening, inner purification, and detachment from materialism.",
  },
  {
    planet: "Venus",
    years: 20,
    significance:
      "Material comfort, relationship harmony, artistic expression, and luxury.",
  },
  {
    planet: "Sun",
    years: 6,
    significance:
      "Core vitality, career leadership, authority, and self-realization.",
  },
  {
    planet: "Moon",
    years: 10,
    significance:
      "Emotional intelligence, mental peace, public interaction, and nourishment.",
  },
  {
    planet: "Mars",
    years: 7,
    significance:
      "Drive, physical energy, ambition, property, and competitive courage.",
  },
  {
    planet: "Rahu",
    years: 18,
    significance:
      "Worldly ambition, sudden growth, unconventional breakthroughs, and deep curiosity.",
  },
  {
    planet: "Jupiter",
    years: 16,
    significance:
      "Wisdom, expansion, higher learning, financial fortune, and mentorship.",
  },
  {
    planet: "Saturn",
    years: 19,
    significance:
      "Karmic discipline, long-term perseverance, structure, and hard work.",
  },
  {
    planet: "Mercury",
    years: 17,
    significance:
      "Intellectual agility, commercial success, communication, and learning.",
  },
];

const ZODIAC_NUMBER_MAP = {
  Aries: 1,
  Mesha: 1,
  Taurus: 2,
  Vrishabha: 2,
  Gemini: 3,
  Mithun: 3,
  Cancer: 4,
  Karka: 4,
  Leo: 5,
  Simha: 5,
  Virgo: 6,
  Kanya: 6,
  Libra: 7,
  Tula: 7,
  Scorpio: 8,
  Vrishchik: 8,
  Sagittarius: 9,
  Dhanu: 9,
  Capricorn: 10,
  Makar: 10,
  Aquarius: 11,
  Kumbh: 11,
  Pisces: 12,
  Meen: 12,
};

const NORTH_INDIAN_HOUSE_SLOTS = {
  1: { signX: 150, signY: 105, planetX: 150, planetY: 75 },
  2: { signX: 85, signY: 45, planetX: 80, planetY: 25 },
  3: { signX: 45, signY: 85, planetX: 25, planetY: 75 },
  4: { signX: 105, signY: 150, planetX: 75, planetY: 150 },
  5: { signX: 45, signY: 215, planetX: 25, planetY: 225 },
  6: { signX: 85, signY: 255, planetX: 80, planetY: 275 },
  7: { signX: 150, signY: 195, planetX: 150, planetY: 225 },
  8: { signX: 215, signY: 255, planetX: 220, planetY: 275 },
  9: { signX: 255, signY: 215, planetX: 275, planetY: 225 },
  10: { signX: 195, signY: 150, planetX: 225, planetY: 150 },
  11: { signX: 255, signY: 85, planetX: 275, planetY: 75 },
  12: { signX: 215, signY: 45, planetX: 220, planetY: 25 },
};

export default function KundliAndBirthChart({
  onBack,
  onOpenAuth,
  onOpenSidebar,
  userProfile,
  setIsDetailsModalOpen,
}) {
  const { currentUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("chart");
  const [userBirthDetails, setUserBirthDetails] = useState(null);

  const [liveKundliData, setLiveKundliData] = useState(null);
  const [isLoadingChart, setIsLoadingChart] = useState(false);
  const [loadingTextIndex, setLoadingTextIndex] = useState(0);
  const [chartError, setChartError] = useState(null);

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileDropdownRef = useRef(null);

  useEffect(() => {
    let interval;
    if (isLoadingChart) {
      interval = setInterval(() => {
        setLoadingTextIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 1200);
    }
    return () => clearInterval(interval);
  }, [isLoadingChart]);

  useEffect(() => {
    let details = null;
    if (currentUser) {
      const savedDetails = localStorage.getItem(
        `user_details_${currentUser.uid}`,
      );
      if (savedDetails) {
        try {
          details = JSON.parse(savedDetails);
        } catch (e) {
          console.error("Failed to parse birth details", e);
        }
      }
    }

    if (!details) {
      details = {
        fullName:
          userProfile?.displayName || currentUser?.displayName || "User",
        dob: "2001-10-09",
        timeOfBirth: "20:15",
        placeOfBirth: "New Delhi, India",
        gender: "male",
      };
    }

    setUserBirthDetails(details);
  }, [currentUser, userProfile]);

  useEffect(() => {
    if (!userBirthDetails) return;

    let isMounted = true;
    async function loadChart() {
      setIsLoadingChart(true);
      setChartError(null);
      try {
        const data = await fetchKundliData(userBirthDetails);
        if (isMounted) {
          setLiveKundliData(data);
        }
      } catch (err) {
        console.error("Error fetching live chart:", err);
        if (isMounted) {
          setChartError(
            err.message || "Failed to establish live connection with Navamsha.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoadingChart(false);
        }
      }
    }

    loadChart();
    return () => {
      isMounted = false;
    };
  }, [userBirthDetails]);

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

  const handleOpenEdit = () => {
    if (setIsDetailsModalOpen) setIsDetailsModalOpen(true);
  };

  const handleOpenNew = () => {
    if (setIsDetailsModalOpen) setIsDetailsModalOpen(true);
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  const scrollToConsultants = () => {
    const el = document.getElementById("astrologers-roster");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const navOutput = liveKundliData?.output || liveKundliData;

  const getPlanetMeaning = (key, val) => {
    const p = key.toLowerCase();
    const h = val.house_number;
    const sign = val.zodiac_sign_name;
    const retro = val.isRetro === "true" || val.isRetro === true;

    if (p.includes("ascendant") || key.includes("Ascendant")) {
      return `Your Lagna in ${sign} defines your baseline temperament, physical vitality, and how you naturally project yourself to the outside world.`;
    }
    if (p.includes("sun")) {
      return `The Sun in ${sign} (House ${h}) highlights your core identity, drive for recognition, and willpower. Placed here, it encourages steady self-expression while reminding you to stay grounded against ego friction.`;
    }
    if (p.includes("moon")) {
      return `Moon in ${sign} (House ${h}) governs your emotional processing, subconscious instincts, and inner comfort. It suggests sensitivity and adaptability in navigating personal environments.`;
    }
    if (p.includes("mars")) {
      return `Mars in ${sign} (House ${h}) fuels your ambition, physical drive, and competitive energy. It brings strong initiative, though practicing mindful patience helps channel this intensity constructively.`;
    }
    if (p.includes("mercury")) {
      return `Mercury in ${sign} (House ${h}) influences your mental agility, communication style, and analytical thinking. It favors problem-solving and continuous intellectual engagement.`;
    }
    if (p.includes("jupiter")) {
      return `Jupiter in ${sign} (House ${h}) acts as a natural benefic, supporting wisdom, optimism, and philosophical growth, often opening doors through mentorship or higher learning.`;
    }
    if (p.includes("venus")) {
      return `Venus in ${sign} (House ${h}) shapes your appreciation for aesthetics, harmony, and relationship dynamics, bringing grace and a desire for peaceful connections.`;
    }
    if (p.includes("saturn")) {
      return `Saturn in ${sign} (House ${h}) introduces structural discipline and important karmic lessons. While it may require extra patience or persistence in this domain, it builds lasting resilience.`;
    }
    if (p.includes("rahu")) {
      return `Rahu in ${sign} (House ${h}) stimulates worldly ambition, unconventional pursuits, and strong curiosity. ${retro ? "Its retrograde motion encourages deep introspection regarding outward desires." : ""}`;
    }
    if (p.includes("ketu")) {
      return `Ketu in ${sign} (House ${h}) fosters spiritual detachment, intuitive depth, and a tendency to look past superficial matters toward inner clarity.`;
    }
    if (p.includes("uranus")) {
      return `Uranus in ${sign} (House ${h}) brings flashes of independence, originality, and sudden shifts that encourage breaking free from outdated routines.`;
    }
    if (p.includes("neptune")) {
      return `Neptune in ${sign} (House ${h}) deepens your imagination, empathy, and subtle artistic or spiritual leanings.`;
    }
    if (p.includes("pluto")) {
      return `Pluto in ${sign} (House ${h}) points toward profound personal transformation and inner regeneration through navigating major life cycles.`;
    }
    return `Placed in ${sign} in the ${h}th house under ${val.nakshatra_name} Nakshatra, shaping distinct themes in this life area.`;
  };

  const getPlanetaryRows = () => {
    if (!navOutput) return [];
    const rows = [];

    if (navOutput.ascendant) {
      const asc = navOutput.ascendant;
      rows.push({
        key: "ascendant",
        planet: "Ascendant (Lagna)",
        rashi: asc.zodiac_sign_name,
        lord: asc.zodiac_sign_lord,
        degree: `${asc.degrees}° ${asc.minutes}' ${Math.round(asc.seconds || 0)}"`,
        fullDegree: asc.fullDegree?.toFixed(2) || "0.00",
        house: `${asc.house_number}st House`,
        houseNumber: asc.house_number || 1,
        nakshatra: asc.nakshatra_name,
        pada: asc.nakshatra_pada,
        vimsottariLord: asc.nakshatra_vimsottari_lord,
        isRetro: false,
        meaning: getPlanetMeaning("Ascendant", asc),
      });
    }

    if (navOutput.planets && typeof navOutput.planets === "object") {
      Object.entries(navOutput.planets).forEach(([key, val]) => {
        const isRetro = val.isRetro === "true" || val.isRetro === true;
        rows.push({
          key,
          planet: val.localized_name || key,
          rashi: val.zodiac_sign_name,
          lord: val.zodiac_sign_lord,
          degree: `${val.degrees}° ${val.minutes}' ${Math.round(val.seconds || 0)}"`,
          fullDegree: val.fullDegree?.toFixed(2) || "0.00",
          house: `${val.house_number}${val.house_number === 1 ? "st" : val.house_number === 2 ? "nd" : val.house_number === 3 ? "rd" : "th"} House`,
          houseNumber: val.house_number,
          nakshatra: val.nakshatra_name,
          pada: val.nakshatra_pada,
          vimsottariLord: val.nakshatra_vimsottari_lord,
          isRetro,
          meaning: getPlanetMeaning(key, val),
        });
      });
    }

    return rows;
  };

  const planetaryRows = getPlanetaryRows();

  const getHouseChartData = () => {
    const houseMap = {};
    for (let h = 1; h <= 12; h++) {
      houseMap[h] = { signNumber: null, planets: [] };
    }

    const ascSignName = navOutput?.ascendant?.zodiac_sign_name || "Cancer";
    const startSignNum = ZODIAC_NUMBER_MAP[ascSignName] || 4;

    for (let h = 1; h <= 12; h++) {
      let signNum = (startSignNum + (h - 1)) % 12;
      if (signNum === 0) signNum = 12;
      houseMap[h].signNumber = signNum;
    }

    planetaryRows.forEach((p) => {
      const hNum = p.houseNumber || 1;
      if (houseMap[hNum]) {
        let shortName = p.planet.split(" ")[0].slice(0, 2);
        if (p.planet.includes("Ascendant")) shortName = "Asc";
        if (p.isRetro) shortName += "(R)";
        houseMap[hNum].planets.push(shortName);
      }
    });

    return houseMap;
  };

  const houseChartData = getHouseChartData();

  const getMangalDoshaStatus = () => {
    const mars = navOutput?.planets?.Mars;
    if (!mars)
      return {
        isDosha: false,
        title: "Calculating...",
        description: "Awaiting Mars placement.",
      };

    const doshaHouses = [1, 2, 4, 7, 8, 12];
    const isDosha = doshaHouses.includes(mars.house_number);
    return {
      isDosha,
      title: isDosha ? "Mangal Dosha Present" : "No Mangal Dosha",
      description: isDosha
        ? `Mars is positioned in House ${mars.house_number} (${mars.zodiac_sign_name}). This indicates high passion and potential timing friction in partnerships, which can be balanced with mindful communication.`
        : `Mars is placed in House ${mars.house_number} (${mars.zodiac_sign_name}), free from core Manglik afflictions.`,
    };
  };

  const getRahuKetuAxis = () => {
    const rahu = navOutput?.planets?.Rahu;
    const ketu = navOutput?.planets?.Ketu;
    if (!rahu || !ketu) return "Calculating karmic nodal axis...";
    return `Rahu in ${rahu.zodiac_sign_name} (House ${rahu.house_number}) & Ketu in ${ketu.zodiac_sign_name} (House ${ketu.house_number}). Highlights your balance between worldly ambition and inner spiritual grounding.`;
  };

  const mangalStatus = getMangalDoshaStatus();
  const currentMahadashaLord =
    navOutput?.planets?.Moon?.nakshatra_vimsottari_lord || "Jupiter";

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
        <header className="kundli-header no-print">
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
                Generate Kundli & Consult
              </button>
            )}
          </div>
        </header>

        <div className="hero-left-content no-print">
          <span className="hero-subheading">
            KUNDLI & BIRTH CHART <span className="subheading-line"></span>
          </span>
          <h1 className="hero-main-title">
            Unveil Your <em>Celestial</em>
            <br />
            Blueprint
          </h1>
          <p className="hero-description">
            Explore your birth chart calculations, exact planetary longitudes,
            running Vimshottari Dasha lords, and Vedic dosha insights powered by
            Navamsha.
          </p>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="kundli-body-content" id="chart-section">
        {/* Active Birth Profile Summary */}
        <section className="birth-summary-card">
          <div className="summary-card-header">
            <div className="summary-title-group">
              <span className="badge-active-profile">
                ✦ Active Birth Profile
              </span>
              <h3>{userBirthDetails?.fullName || "User Profile"}</h3>
            </div>
            <div className="summary-actions-row no-print">
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
                {userBirthDetails?.dob || "09 Oct 2001"}
              </span>
            </div>
            <div className="data-item">
              <span className="data-label">Time of Birth</span>
              <span className="data-value">
                {userBirthDetails?.timeOfBirth || "08:15 PM"}
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

          {navOutput && (
            <div
              style={{
                marginTop: "1.5rem",
                paddingTop: "1rem",
                borderTop: "1px solid #ebdccb",
                display: "flex",
                flexWrap: "wrap",
                gap: "1.5rem",
                fontSize: "0.85rem",
                color: "#615953",
              }}
            >
              <span>
                <strong>Lagna Sign:</strong>{" "}
                {navOutput?.ascendant?.zodiac_sign_name || "Cancer"} (
                {navOutput?.ascendant?.zodiac_sign_lord})
              </span>
              <span>
                <strong>Julian Day (UT):</strong>{" "}
                {navOutput?.julian_day_ut?.toFixed(4) || "N/A"}
              </span>
              <span>
                <strong>UTC Timestamp:</strong>{" "}
                {navOutput?.utc_datetime || "N/A"}
              </span>
              <span>
                <strong>Reference Sign:</strong>{" "}
                {navOutput?.reference_sign || "N/A"}
              </span>
            </div>
          )}
        </section>

        {/* Animated Loading Spinner */}
        {isLoadingChart && (
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #ebdccb",
              borderRadius: "16px",
              padding: "2.5rem",
              textAlign: "center",
              marginBottom: "3rem",
              boxShadow: "0 4px 20px rgba(181, 122, 42, 0.08)",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                border: "3px solid #f4f0ec",
                borderTop: "3px solid #b57a2a",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                margin: "0 auto 1.2rem auto",
              }}
            />
            <h4
              style={{
                fontFamily: "Georgia, serif",
                fontSize: "1.2rem",
                color: "#2c2523",
                margin: "0 0 0.4rem 0",
              }}
            >
              Generating Your Astrological Chart
            </h4>
            <p
              style={{
                color: "#b57a2a",
                fontSize: "0.95rem",
                fontWeight: "600",
                margin: 0,
                transition: "all 0.4s ease",
              }}
            >
              ✨ {LOADING_MESSAGES[loadingTextIndex]}
            </p>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {chartError && (
          <div
            style={{
              background: "#fce8e6",
              color: "#c5221f",
              padding: "1rem 1.5rem",
              borderRadius: "12px",
              marginBottom: "2rem",
            }}
          >
            ⚠️ {chartError}
          </div>
        )}

        {/* Navigation Tabs */}
        <section className="chart-viewer-section">
          <div className="chart-tabs-header no-print">
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
              Full Planetary Positions ({planetaryRows.length})
            </button>
            <button
              className={`chart-tab-btn ${activeTab === "dasha" ? "active" : ""}`}
              onClick={() => setActiveTab("dasha")}
            >
              Vimshottari & Nakshatra Lords
            </button>
            <button
              className={`chart-tab-btn ${activeTab === "dosha" ? "active" : ""}`}
              onClick={() => setActiveTab("dosha")}
            >
              Dosha Analysis
            </button>
          </div>

          <div className="chart-tab-display">
            {/* Section 1: Birth Chart (Lagna) */}
            <div
              className={`print-section ${activeTab === "chart" ? "active-screen-tab" : "hidden-screen-tab"}`}
            >
              <h3 className="print-section-title">1. Birth Chart (Lagna)</h3>
              <div
                className="chart-diagram-wrapper"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "2rem",
                  alignItems: "center",
                }}
              >
                <div
                  className="chart-box-container"
                  style={{ width: "100%", maxWidth: "380px", margin: "0 auto" }}
                >
                  <div
                    className="north-indian-chart"
                    style={{
                      position: "relative",
                      width: "100%",
                      paddingBottom: "100%",
                    }}
                  >
                    <svg
                      viewBox="0 0 300 300"
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                      }}
                    >
                      <rect
                        x="5"
                        y="5"
                        width="290"
                        height="290"
                        fill="#fdfbf7"
                        stroke="#a37c3f"
                        strokeWidth="2"
                      />
                      <line
                        x1="5"
                        y1="5"
                        x2="295"
                        y2="295"
                        stroke="#a37c3f"
                        strokeWidth="1.2"
                      />
                      <line
                        x1="295"
                        y1="5"
                        x2="5"
                        y2="295"
                        stroke="#a37c3f"
                        strokeWidth="1.2"
                      />
                      <polygon
                        points="150,5 295,150 150,295 5,150"
                        fill="none"
                        stroke="#a37c3f"
                        strokeWidth="1.5"
                      />

                      {Object.entries(NORTH_INDIAN_HOUSE_SLOTS).map(
                        ([houseStr, coords]) => {
                          const hNum = parseInt(houseStr, 10);
                          const hData = houseChartData[hNum];
                          const planetText = hData.planets.join(", ");

                          return (
                            <g key={`house-${hNum}`}>
                              <text
                                x={coords.signX}
                                y={coords.signY}
                                textAnchor="middle"
                                fill="#a37c3f"
                                fontSize="11"
                                fontWeight="bold"
                              >
                                {hData.signNumber}
                              </text>

                              {planetText && (
                                <text
                                  x={coords.planetX}
                                  y={coords.planetY}
                                  textAnchor="middle"
                                  fill="#2c2523"
                                  fontSize="10"
                                  fontWeight="600"
                                >
                                  {planetText}
                                </text>
                              )}
                            </g>
                          );
                        },
                      )}
                    </svg>
                  </div>
                </div>

                <div className="chart-legend" style={{ textAlign: "left" }}>
                  <span
                    style={{
                      color: "#b57a2a",
                      fontWeight: "700",
                      textTransform: "uppercase",
                      fontSize: "0.8rem",
                      letterSpacing: "1px",
                    }}
                  >
                    ✦ D1 Lagna Chart Blueprint
                  </span>
                  <h3
                    style={{
                      fontFamily: "Georgia, serif",
                      fontSize: "1.6rem",
                      color: "#2c2523",
                      margin: "0.4rem 0 0.8rem 0",
                    }}
                  >
                    Ascendant (Lagna):{" "}
                    {navOutput?.ascendant?.zodiac_sign_name || "Cancer"}
                  </h3>
                  <p
                    style={{
                      color: "#615953",
                      fontSize: "0.95rem",
                      lineHeight: "1.6",
                    }}
                  >
                    {navOutput?.ascendant
                      ? `Your chart originates with ${navOutput.ascendant.zodiac_sign_name} in House 1 (Sign #${ZODIAC_NUMBER_MAP[navOutput.ascendant.zodiac_sign_name] || 4}), governed by ${navOutput.ascendant.zodiac_sign_lord}. Exact ascendant coordinates: ${navOutput.ascendant.degrees}° ${navOutput.ascendant.minutes}' under ${navOutput.ascendant.nakshatra_name} Nakshatra (Pada ${navOutput.ascendant.nakshatra_pada}).`
                      : "Computed live from Navamsha astronomical ephemerides."}
                  </p>
                  <div
                    style={{
                      marginTop: "1rem",
                      padding: "0.8rem 1rem",
                      background: "#faf8f5",
                      borderRadius: "10px",
                      border: "1px solid #ebdccb",
                    }}
                  >
                    <strong style={{ color: "#2c2523", fontSize: "0.85rem" }}>
                      💡 How to read this chart:
                    </strong>
                    <p
                      style={{
                        margin: "4px 0 0 0",
                        fontSize: "0.8rem",
                        color: "#615953",
                      }}
                    >
                      The gold numbers in each diamond represent the Sidereal
                      Zodiac Signs (1=Aries ... 12=Pisces). Dark text badges
                      represent the planets positioned in those houses.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Full Planetary Positions */}
            <div
              className={`print-section ${activeTab === "planets" ? "active-screen-tab" : "hidden-screen-tab"}`}
            >
              <h3 className="print-section-title">
                2. Full Planetary Positions
              </h3>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.5rem",
                }}
              >
                <div className="table-responsive-wrapper">
                  <table className="planets-table">
                    <thead>
                      <tr>
                        <th>Celestial Body</th>
                        <th>Zodiac Sign (Lord)</th>
                        <th>Degree (D° M' S")</th>
                        <th>House Placement</th>
                        <th>Nakshatra & Pada</th>
                        <th>Vimsottari Lord</th>
                      </tr>
                    </thead>
                    <tbody>
                      {planetaryRows.length > 0 ? (
                        planetaryRows.map((row) => (
                          <tr key={row.key}>
                            <td className="planet-name">
                              {row.planet}
                              {row.isRetro && (
                                <span
                                  style={{
                                    marginLeft: "6px",
                                    color: "#c5221f",
                                    fontSize: "0.75rem",
                                    fontWeight: "bold",
                                  }}
                                >
                                  [R]
                                </span>
                              )}
                            </td>
                            <td>
                              {row.rashi} ({row.lord})
                            </td>
                            <td>
                              {row.degree} <br />
                              <span
                                style={{
                                  fontSize: "0.75rem",
                                  color: "#8a7e78",
                                }}
                              >
                                Abs: {row.fullDegree}°
                              </span>
                            </td>
                            <td>{row.house}</td>
                            <td>
                              {row.nakshatra} (Pada {row.pada})
                            </td>
                            <td>{row.vimsottariLord || "N/A"}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="6"
                            style={{
                              textAlign: "center",
                              padding: "2rem",
                              color: "#7a726f",
                            }}
                          >
                            {isLoadingChart
                              ? "Calculating coordinates..."
                              : "No planetary records found."}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(280px, 1fr))",
                    gap: "1rem",
                    marginTop: "1rem",
                  }}
                >
                  {planetaryRows.map((row) => (
                    <div
                      key={`card-${row.key}`}
                      style={{
                        background: "#faf8f5",
                        border: "1px solid #ebdccb",
                        borderRadius: "12px",
                        padding: "1rem 1.2rem",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "0.5rem",
                        }}
                      >
                        <h4
                          style={{
                            margin: 0,
                            color: "#2c2523",
                            fontSize: "1rem",
                          }}
                        >
                          {row.planet} {row.isRetro && "(Retrograde)"}
                        </h4>
                        <span
                          style={{
                            fontSize: "0.8rem",
                            color: "#b57a2a",
                            fontWeight: "600",
                          }}
                        >
                          {row.house}
                        </span>
                      </div>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "0.85rem",
                          color: "#615953",
                          lineHeight: "1.4",
                        }}
                      >
                        {row.meaning}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Section 3: Vimshottari Dasha Timeline */}
            <div
              className={`print-section ${activeTab === "dasha" ? "active-screen-tab" : "hidden-screen-tab"}`}
            >
              <h3 className="print-section-title">
                3. Vimshottari & Nakshatra Lords
              </h3>
              <div
                className="dasha-container"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.5rem",
                }}
              >
                <div
                  className="dasha-active-card"
                  style={{
                    background:
                      "linear-gradient(135deg, #2c2523 0%, #1a1514 100%)",
                    color: "#fff",
                    padding: "1.8rem",
                    borderRadius: "16px",
                    border: "1px solid #a37c3f",
                  }}
                >
                  <span
                    className="dasha-tag"
                    style={{
                      color: "#d4af37",
                      letterSpacing: "1px",
                      fontSize: "0.75rem",
                      fontWeight: "700",
                    }}
                  >
                    CURRENT RUNNING MAHADASHA
                  </span>
                  <h3
                    style={{
                      fontFamily: "Georgia, serif",
                      fontSize: "1.6rem",
                      margin: "0.5rem 0 0.3rem 0",
                      color: "#fff",
                    }}
                  >
                    {currentMahadashaLord} Mahadasha Period
                  </h3>
                  <p
                    style={{ color: "#d1c7bd", fontSize: "0.9rem", margin: 0 }}
                  >
                    Derived from Moon's placement in{" "}
                    {navOutput?.planets?.Moon?.nakshatra_name || "Pushya"}{" "}
                    Nakshatra. This planetary ruler actively shapes your primary
                    life focus, decision-making cycles, and inner growth.
                  </p>
                </div>

                <div
                  style={{
                    background: "#ffffff",
                    border: "1px solid #ebdccb",
                    borderRadius: "16px",
                    padding: "1.5rem",
                  }}
                >
                  <h4
                    style={{
                      fontFamily: "Georgia, serif",
                      fontSize: "1.2rem",
                      color: "#2c2523",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Vimshottari Dasha Sequence & Lifespan Cycle
                  </h4>
                  <p
                    style={{
                      color: "#615953",
                      fontSize: "0.85rem",
                      marginBottom: "1.5rem",
                    }}
                  >
                    The 120-year Vedic predictive cycle broken down by ruling
                    planetary periods:
                  </p>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "1rem",
                    }}
                  >
                    {VIMSHOTTARI_SEQUENCE.map((dasha, idx) => {
                      const isActive =
                        dasha.planet.toLowerCase() ===
                        currentMahadashaLord.toLowerCase();
                      const totalYears = 120;
                      const percentage = Math.round(
                        (dasha.years / totalYears) * 100,
                      );

                      return (
                        <div
                          key={`dasha-row-${idx}`}
                          style={{
                            background: isActive ? "#fdfbf7" : "#faf8f5",
                            border: isActive
                              ? "2px solid #b57a2a"
                              : "1px solid #ebdccb",
                            borderRadius: "12px",
                            padding: "1rem 1.2rem",
                            transition: "all 0.2s ease",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              marginBottom: "0.4rem",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                              }}
                            >
                              <span
                                style={{
                                  fontWeight: "700",
                                  color: isActive ? "#b57a2a" : "#2c2523",
                                  fontSize: "1rem",
                                }}
                              >
                                {idx + 1}. {dasha.planet} Mahadasha
                              </span>
                              {isActive && (
                                <span
                                  style={{
                                    background: "#b57a2a",
                                    color: "#fff",
                                    fontSize: "0.7rem",
                                    padding: "2px 8px",
                                    borderRadius: "20px",
                                    fontWeight: "600",
                                  }}
                                >
                                  Active Now
                                </span>
                              )}
                            </div>
                            <span
                              style={{
                                fontSize: "0.85rem",
                                fontWeight: "600",
                                color: "#8a7e78",
                              }}
                            >
                              {dasha.years} Years ({percentage}%)
                            </span>
                          </div>

                          <p
                            style={{
                              margin: "0 0 0.8rem 0",
                              fontSize: "0.82rem",
                              color: "#615953",
                            }}
                          >
                            {dasha.significance}
                          </p>

                          <div
                            style={{
                              width: "100%",
                              height: "6px",
                              background: "#f0ece4",
                              borderRadius: "3px",
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                width: `${percentage}%`,
                                height: "100%",
                                background: isActive ? "#b57a2a" : "#d1c7bd",
                                borderRadius: "3px",
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4: Dosha Analysis */}
            <div
              className={`print-section ${activeTab === "dosha" ? "active-screen-tab" : "hidden-screen-tab"}`}
            >
              <h3 className="print-section-title">4. Dosha Analysis</h3>
              <div className="dosha-cards-grid">
                <div
                  className={`dosha-card ${mangalStatus.isDosha ? "warning" : "safe"}`}
                >
                  <div className="dosha-icon">
                    {mangalStatus.isDosha ? "✦" : "✓"}
                  </div>
                  <h4>Mangal Dosha (Mars Placement)</h4>
                  <span
                    className={`dosha-badge ${mangalStatus.isDosha ? "active-dosha" : "no-dosha"}`}
                  >
                    {mangalStatus.title}
                  </span>
                  <p>{mangalStatus.description}</p>
                </div>

                <div className="dosha-card warning">
                  <div className="dosha-icon">✦</div>
                  <h4>Karmic Nodal Axis (Rahu - Ketu)</h4>
                  <span className="dosha-badge active-dosha">
                    Nodal Axis Active
                  </span>
                  <p>{getRahuKetuAxis()}</p>
                </div>
              </div>
            </div>

            {/* Download PDF Button inside tab container footer */}
            <div
              className="no-print"
              style={{
                marginTop: "2.5rem",
                paddingTop: "1.5rem",
                borderTop: "1px solid #eee8e3",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <button className="btn-download-pdf" onClick={handleDownloadPDF}>
                ↓ Download Full PDF Report
              </button>
            </div>
          </div>
        </section>

        {/* Connect with Astrologers CTA Banner */}
        <div
          className="no-print"
          style={{
            margin: "3rem 0",
            background: "linear-gradient(135deg, #2c2523 0%, #1a1514 100%)",
            color: "#ffffff",
            padding: "2.5rem 2rem",
            borderRadius: "20px",
            textAlign: "center",
            boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
            border: "1px solid #a37c3f",
          }}
        >
          <span
            style={{
              color: "#d4af37",
              textTransform: "uppercase",
              letterSpacing: "1.5px",
              fontSize: "0.85rem",
              fontWeight: "700",
            }}
          >
            ✦ Deep Astrological Guidance ✦
          </span>
          <h2
            style={{
              fontFamily: "Georgia, serif",
              fontSize: "1.8rem",
              margin: "0.8rem 0 0.5rem 0",
              color: "#ffffff",
            }}
          >
            Connect with one of our astrologers to get more clarity or remedies
          </h2>
          <p
            style={{
              color: "#d1c7bd",
              maxWidth: "650px",
              margin: "0 auto 1.5rem auto",
              fontSize: "0.95rem",
              lineHeight: "1.6",
            }}
          >
            Have questions regarding your Mangal Dosha, Retrograde planetary
            impacts, career transit timing, or specific gemstones? Consult
            directly with verified Vedic scholars.
          </p>
          <button
            onClick={scrollToConsultants}
            style={{
              background: "#b57a2a",
              color: "#ffffff",
              border: "none",
              padding: "0.85rem 2rem",
              borderRadius: "30px",
              fontWeight: "600",
              fontSize: "0.95rem",
              cursor: "pointer",
              transition: "transform 0.2s ease, background-color 0.2s ease",
            }}
          >
            Talk to an Astrologer Now ↓
          </button>
        </div>

        {/* Astrologers Roster Section */}
        <section
          className="consultants-section no-print"
          id="astrologers-roster"
        >
          <div className="section-title-wrapper">
            <span className="section-subheading">VERIFIED ASTROLOGERS</span>
            <h2 className="section-main-heading">
              Available Chart Consultants
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
