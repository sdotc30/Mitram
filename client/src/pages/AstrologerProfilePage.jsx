import React, { useState, useEffect } from "react";
import "./AstrologerProfilePage.css";
import logoImg from "../assets/logo.png";
import heroBg from "../assets/hero-card-bg.png";
import aboutBannerBg from "../assets/about-banner-bg.png";
import revDivBg from "../assets/rev-div-bg.png";
import chatBg from "../assets/chat-bg.png";
import callBg from "../assets/call-bg.png";
import whyConsultBg from "../assets/why-consult-bg.png";
import chatPriceBg from "../assets/chat-price-bg.png";
import callPriceBg from "../assets/call-price-bg.png";
import ratingCardBg from "../assets/rating-card-bg.png";
import { useAuth } from "../AuthContext";

export default function AstrologerProfilePage({
  astrologerId,
  onBack,
  onOpenAuth,
  onOpenSidebar,
  onStartChat,
  onStartCall,
}) {
  const { currentUser } = useAuth();
  const [astrologer, setAstrologer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isAboutExpanded, setIsAboutExpanded] = useState(true);
  const [reviewSort, setReviewSort] = useState("recent");
  const [reviewsList, setReviewsList] = useState([]);
  const [helpfulVotes, setHelpfulVotes] = useState({});
  const [showAddReviewModal, setShowAddReviewModal] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const [newRating, setNewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    let isMounted = true;
    async function fetchAstrologerDetails() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `http://localhost:5000/api/astrologers/${astrologerId}`,
        );
        if (!res.ok) {
          throw new Error(`Astrologer not found (ID: ${astrologerId})`);
        }
        const data = await res.json();
        if (isMounted) {
          setAstrologer(data);
          setReviewsList(data.reviews || []);
        }
      } catch (err) {
        console.error("Error loading astrologer:", err);
        if (isMounted)
          setError("Could not find astrologer details in the database.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    if (astrologerId) {
      fetchAstrologerDetails();
    }
    return () => {
      isMounted = false;
    };
  }, [astrologerId]);

  if (isLoading) {
    return (
      <div className="profile-loading-screen">
        <div className="spinner"></div>
        <p>Loading spiritual guide profile...</p>
      </div>
    );
  }

  if (error || !astrologer) {
    return (
      <div className="profile-loading-screen">
        <h2>Profile Unavailable</h2>
        <p>{error || "Astrologer not found."}</p>
        <button className="btn-back-link" onClick={onBack}>
          &larr; Back to Directory
        </button>
      </div>
    );
  }

  const handleHelpfulClick = async (revId) => {
    if (helpfulVotes[revId]) return;
    setHelpfulVotes((prev) => ({ ...prev, [revId]: true }));
    setReviewsList((prev) =>
      prev.map((r) =>
        r.id === revId
          ? { ...r, helpful_count: (r.helpful_count || 0) + 1 }
          : r,
      ),
    );

    try {
      await fetch(`http://localhost:5000/api/reviews/${revId}/helpful`, {
        method: "POST",
      });
    } catch (err) {
      console.error("Error logging helpful vote:", err);
    }
  };

  const handleAddReviewSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmittingReview) return;

    setIsSubmittingReview(true);
    const authorName = currentUser
      ? currentUser.displayName || currentUser.email?.split("@")[0] || "Seeker"
      : "Anonymous Seeker";

    const reviewPayload = {
      user_name: authorName,
      rating: Number(newRating),
      comment: newComment.trim(),
    };

    try {
      const res = await fetch(
        `http://localhost:5000/api/astrologers/${astrologerId}/reviews`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(reviewPayload),
        },
      );

      if (res.ok) {
        const savedReview = await res.json();
        setReviewsList((prev) => [savedReview, ...prev]);
      } else {
        const fallbackRev = {
          id: Date.now(),
          ...reviewPayload,
          helpful_count: 0,
          created_at: "Just now",
        };
        setReviewsList((prev) => [fallbackRev, ...prev]);
      }
    } catch (err) {
      console.error(
        "Failed to post review to backend, applying local fallback:",
        err,
      );
      const fallbackRev = {
        id: Date.now(),
        ...reviewPayload,
        helpful_count: 0,
        created_at: "Just now",
      };
      setReviewsList((prev) => [fallbackRev, ...prev]);
    } finally {
      setIsSubmittingReview(false);
      setNewComment("");
      setNewRating(5);
      setShowAddReviewModal(false);
    }
  };

  const sortedReviews = [...reviewsList].sort((a, b) => {
    if (reviewSort === "highest") return b.rating - a.rating;
    if (reviewSort === "lowest") return a.rating - b.rating;
    return b.id - a.id;
  });

  const totalRevCount = reviewsList.length;
  const sumRatings = reviewsList.reduce(
    (acc, curr) => acc + Number(curr.rating),
    0,
  );
  const liveAverageRating =
    totalRevCount > 0
      ? (sumRatings / totalRevCount).toFixed(1)
      : astrologer.rating
        ? Number(astrologer.rating).toFixed(1)
        : "5.0";

  const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviewsList.forEach((r) => {
    const star = Math.floor(r.rating);
    if (ratingCounts[star] !== undefined) {
      ratingCounts[star]++;
    }
  });

  const baseRate = Number(astrologer.price_per_min) || 25;
  const chatPackagePrice = baseRate * 45;
  const callPackagePrice = Math.round(baseRate * 1.15 * 45);

  const displayCategory =
    astrologer.category ||
    (astrologer.categories && astrologer.categories[0]) ||
    "Vedic Astrologer";
  const displayStatus =
    astrologer.status_type || astrologer.status || "Online Now";
  const isOnline = displayStatus.toLowerCase().includes("online");

  return (
    <div className="astrologer-profile-page">
      {/* Site Header */}
      <header className="profile-site-header">
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
            <img src={logoImg} alt="Mitram Logo" className="header-logo-only" />
          </div>
        </div>

        <nav className="nav-menu-pill">
          <a href="#home" onClick={onBack} className="nav-link">
            Home
          </a>
          <a href="#consultations" onClick={onBack} className="nav-link">
            Consultations
          </a>
          <a href="#astrologers" className="nav-link active">
            Astrologer
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
            <div className="user-avatar-circle" onClick={onBack}>
              {currentUser.displayName
                ? currentUser.displayName[0].toUpperCase()
                : "U"}
            </div>
          ) : (
            <button className="btn-top-book" onClick={onOpenAuth}>
              Get Started
            </button>
          )}
        </div>
      </header>

      {/* Main Page Layout Grid */}
      <div className="profile-main-grid" style={{ marginTop: "20px" }}>
        {/* Left Column */}
        <div className="profile-left-column">
          {/* PROFILE HERO SECTION */}
          <div className="profile-hero-card">
            <div className="profile-image-container">
              <img src={astrologer.image} alt={astrologer.name} />
              <span
                className={`online-status-badge ${isOnline ? "is-online" : "is-offline"}`}
              >
                <span className="status-dot"></span> {displayStatus}
              </span>
            </div>

            <div
              className="profile-hero-details"
              style={{ backgroundImage: `url(${heroBg})` }}
            >
              <span className="profile-tag">{displayCategory}</span>
              <h1>
                {astrologer.name}{" "}
                <span className="verified-check" title="Verified Astrologer">
                  ✓
                </span>
              </h1>
              <p className="profile-tagline">
                Guiding you with clarity, compassion and ancient wisdom.
              </p>

              <div className="profile-stats-row">
                <div className="stat-pill">
                  <div>
                    <strong>
                      {astrologer.experience
                        ? `${astrologer.experience} yrs`
                        : "10+ yrs"}
                    </strong>
                    <span>Experience</span>
                  </div>
                </div>

                <div className="stat-pill">
                  <div>
                    <strong>
                      {astrologer.reviews_count || `${totalRevCount}+`}
                    </strong>
                    <span>Consultations</span>
                  </div>
                </div>

                <div className="stat-pill">
                  <div>
                    <strong>{liveAverageRating}</strong>
                    <span>
                      ({totalRevCount || astrologer.reviews_count || "0"}{" "}
                      reviews)
                    </span>
                  </div>
                </div>
              </div>

              <div className="profile-expertise-pills">
                {astrologer.expertise && astrologer.expertise.length > 0 ? (
                  astrologer.expertise.map((exp, idx) => (
                    <span key={`exp-${idx}`} className="expertise-pill">
                      {exp}
                    </span>
                  ))
                ) : (
                  <span className="expertise-pill">Vedic Astrology</span>
                )}

                {astrologer.languages &&
                  astrologer.languages.length > 0 &&
                  astrologer.languages.map((lang, idx) => (
                    <span
                      key={`lang-${idx}`}
                      className="expertise-pill language-pill"
                    >
                      🗣️ {lang}
                    </span>
                  ))}
              </div>
            </div>
          </div>

          {/* ABOUT SECTION */}
          <div
            className="profile-section-card about-section-card"
            style={{ backgroundImage: `url(${aboutBannerBg})` }}
          >
            <div
              className="section-header-collapsible"
              onClick={() => setIsAboutExpanded(!isAboutExpanded)}
            >
              <div className="title-with-icon">
                <h2>About {astrologer.name}</h2>
              </div>
              <span className={`chevron ${isAboutExpanded ? "expanded" : ""}`}>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </span>
            </div>

            {isAboutExpanded && (
              <div className="about-content-wrapper">
                <p className="about-text">
                  {astrologer.bio ||
                    `${astrologer.name} is a certified ${displayCategory} with over ${astrologer.experience || "10+"} years of experience in guiding seekers toward clarity and purpose. Combining classical scripture with practical contemporary remedies, consultations focus on Kundli analysis, career direction, relationship compatibility, and planetary alignment.`}
                </p>
              </div>
            )}
          </div>

          {/* REVIEWS LIST SECTION */}
          <div
            className="profile-section-card reviews-section-card"
            id="reviews"
            style={{ backgroundImage: `url(${revDivBg})` }}
          >
            <div className="reviews-header-bar">
              <div>
                <h2>Client Reviews ({totalRevCount})</h2>
              </div>

              <div className="reviews-actions-top">
                <button
                  className="btn-add-review"
                  onClick={() => setShowAddReviewModal(true)}
                >
                  Write a Review
                </button>
                <select
                  className="review-sort-select"
                  value={reviewSort}
                  onChange={(e) => setReviewSort(e.target.value)}
                >
                  <option value="recent">Most Recent</option>
                  <option value="highest">Highest Rating</option>
                  <option value="lowest">Lowest Rating</option>
                </select>
              </div>
            </div>

            <div className="reviews-list">
              {sortedReviews.length === 0 ? (
                <p className="no-reviews-notice">
                  No reviews yet. Be the first to consult and leave a review!
                </p>
              ) : (
                sortedReviews.map((rev) => (
                  <div key={rev.id} className="review-item">
                    <div className="review-header-row">
                      <div className="reviewer-avatar">
                        {rev.user_name ? rev.user_name[0].toUpperCase() : "S"}
                      </div>
                      <div className="reviewer-meta">
                        <h4>{rev.user_name}</h4>
                        <div className="review-stars">
                          {"★".repeat(rev.rating)}
                        </div>
                      </div>
                      <span className="review-date">
                        {rev.created_at || "Recent"}
                      </span>
                    </div>

                    <p className="review-comment">"{rev.comment}"</p>

                    <div className="review-footer-actions">
                      <button
                        className={`action-btn-pill ${helpfulVotes[rev.id] ? "voted" : ""}`}
                        onClick={() => handleHelpfulClick(rev.id)}
                      >
                        Like {rev.helpful_count || 0}
                      </button>
                      <button className="action-btn-pill">Reply</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="profile-right-column">
          <div className="consultation-action-card">
            <h2>Start a Consultation</h2>
            <p>Choose how you'd like to connect with {astrologer.name}.</p>

            <div
              className="consult-option-tile chat"
              onClick={() => onStartChat && onStartChat(astrologer)}
              style={{ backgroundImage: `url(${chatBg})` }}
            >
              <div className="consult-icon-box">💬</div>
              <div className="consult-info">
                <strong>Chat Now</strong>
                <span>₹{baseRate}/min &bull; Instant Session</span>
              </div>
              <span className="consult-arrow">&rarr;</span>
            </div>

            <div
              className="consult-option-tile call"
              onClick={() => onStartCall && onStartCall(astrologer)}
              style={{ backgroundImage: `url(${callBg})` }}
            >
              <div className="consult-icon-box">📞</div>
              <div className="consult-info">
                <strong>Voice Call</strong>
                <span>
                  ₹{Math.round(baseRate * 1.15)}/min &bull; Talk in real time
                </span>
              </div>
              <span className="consult-arrow">&rarr;</span>
            </div>

            <div className="secure-notice">
              Your conversations are private and secure.
            </div>

            <div className="consultation-pricing-pills-row">
              <div
                className="sub-price-pill"
                style={{ backgroundImage: `url(${chatPriceBg})` }}
              >
                <span>Chat</span>
                <strong>₹ {chatPackagePrice.toLocaleString()}</strong>
                <small>(45 mins @ ₹{baseRate}/m)</small>
              </div>
              <div
                className="sub-price-pill call-price-pill"
                style={{ backgroundImage: `url(${callPriceBg})` }}
              >
                <span>Voice Call</span>
                <strong>₹ {callPackagePrice.toLocaleString()}</strong>
                <small>(45 mins @ ₹{Math.round(baseRate * 1.15)}/m)</small>
              </div>
            </div>
          </div>

          {/* RATINGS & REVIEWS CARD */}
          <div
            className="profile-section-card rating-breakdown-card"
            style={{ backgroundImage: `url(${ratingCardBg})` }}
          >
            <div className="rating-card-header-flex">
              <h2>Ratings &amp; Reviews</h2>
            </div>
            <p className="sub-caption">
              Based on {totalRevCount || astrologer.reviews_count || 0} reviews
            </p>

            <div className="rating-score-row">
              <div className="big-score">
                <span>{liveAverageRating}</span>
                <div className="score-stars">★★★★★</div>
                <small>
                  {totalRevCount || astrologer.reviews_count || 0} reviews
                </small>
              </div>

              <div className="score-bars">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = ratingCounts[star] || 0;
                  const pct =
                    totalRevCount > 0
                      ? Math.round((count / totalRevCount) * 100)
                      : 0;
                  return (
                    <div key={star} className="bar-row">
                      <span>{star} ★</span>
                      <div className="bar">
                        <div
                          className="fill"
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                      <span className="count-num">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* WHY CONSULT CARD - Exact original copy with dynamic astrologer name */}
          <div
            className="why-consult-card"
            style={{ backgroundImage: `url(${whyConsultBg})` }}
          >
            <h3>Why Consult {astrologer.name}?</h3>
            <ul className="why-list">
              <li>
                <div>
                  <strong>Personalized Guidance</strong>
                  <p>Tailored insights for your unique journey.</p>
                </div>
              </li>
              <li>
                <div>
                  <strong>Vedic Expertise</strong>
                  <p>Rooted in authentic scriptures.</p>
                </div>
              </li>
              <li>
                <div>
                  <strong>Practical Solutions</strong>
                  <p>Ancient wisdom for modern life.</p>
                </div>
              </li>
              <li>
                <div>
                  <strong>Safe &amp; Confidential</strong>
                  <p>Your privacy and trust always come first.</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Interactive Review Modal */}
      {showAddReviewModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowAddReviewModal(false)}
        >
          <div
            className="review-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setShowAddReviewModal(false)}
            >
              &times;
            </button>
            <h3>Write a Review for {astrologer.name}</h3>

            <form onSubmit={handleAddReviewSubmit}>
              <div className="form-group">
                <label>Your Rating</label>
                <div className="interactive-star-picker">
                  {[1, 2, 3, 4, 5].map((starNum) => (
                    <span
                      key={starNum}
                      className={`picker-star ${starNum <= (hoverRating || newRating) ? "active" : ""}`}
                      onMouseEnter={() => setHoverRating(starNum)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setNewRating(starNum)}
                    >
                      ★
                    </span>
                  ))}
                  <span className="rating-label-text">
                    ({hoverRating || newRating}/5)
                  </span>
                </div>
              </div>

              <div className="form-group">
                <label>Your Review</label>
                <textarea
                  rows="4"
                  placeholder="Share details of your experience..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                className="btn-submit-review"
                disabled={isSubmittingReview}
              >
                {isSubmittingReview ? "Submitting..." : "Submit Review"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
