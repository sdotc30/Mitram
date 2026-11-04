import React, { useState, useEffect } from "react";
import "./GemstonesAndRemedies.css";

import logoImg from "../assets/logo.png";
import gemstonesHeroBg from "../assets/gemstones-hero.png";
import { useAuth } from "../AuthContext";
import { fetchProducts } from "../services/productService";
import CartDrawer from "../components/CartDrawer";
import CheckoutPage from "./CheckoutPage"; // Import the dedicated Checkout Page

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
  const [isCartOpen, setIsCartOpen] = useState(false); // Sliding cart panel state
  const [currentView, setCurrentView] = useState("store"); // 'store' or 'checkout'

  // Cart state
  const [cartItems, setCartItems] = useState([]);

  // Products fetched live from backend database
  const [productsList, setProductsList] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadStoreProducts() {
      setIsLoadingProducts(true);
      try {
        const data = await fetchProducts(selectedCategory);
        if (isMounted) {
          setProductsList(data || []);
        }
      } catch (err) {
        console.error("Failed to load store products:", err);
      } finally {
        if (isMounted) {
          setIsLoadingProducts(false);
        }
      }
    }
    loadStoreProducts();
    return () => {
      isMounted = false;
    };
  }, [selectedCategory]);

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

  const handleAddToCart = (product) => {
    setCartItems((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id);
      if (existing) {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (productId, delta) => {
    setCartItems((prevCart) => {
      return prevCart
        .map((item) => {
          if (item.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean);
    });
  };

  const totalCartCount = cartItems.reduce(
    (acc, item) => acc + item.quantity,
    0,
  );

  const totalCartPrice = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );

  const filteredItems = productsList.filter((item) => {
    const matchesSearch =
      item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description || item.benefits || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // If user navigated to the dedicated checkout page
  if (currentView === "checkout") {
    return (
      <CheckoutPage
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onBackToStore={() => setCurrentView("store")}
        onOrderSuccess={() => setCartItems([])}
      />
    );
  }

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
            {/* Cart Button */}
            <button
              className="cart-nav-btn"
              onClick={() => setIsCartOpen(true)}
              title="View Shopping Cart"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
              >
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
              <span>Cart</span>
              {totalCartCount > 0 && (
                <span className="cart-nav-badge">{totalCartCount}</span>
              )}
            </button>

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
          <div className="hero-divider"></div>
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
          {isLoadingProducts ? (
            <div
              style={{ textAlign: "center", padding: "3rem", color: "#8a7e78" }}
            >
              Loading spiritual store inventory...
            </div>
          ) : filteredItems.length === 0 ? (
            <div
              style={{ textAlign: "center", padding: "3rem", color: "#8a7e78" }}
            >
              No remedies found for this category.
            </div>
          ) : (
            <div className="cards-grid">
              {filteredItems.map((item) => {
                const cartItem = cartItems.find((ci) => ci.id === item.id);
                const quantity = cartItem ? cartItem.quantity : 0;

                return (
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
                          ★ {item.rating}
                        </span>
                      </div>
                      <span
                        className="status-badge"
                        style={{ color: "#b8860b" }}
                      >
                        {(item.category || "").toUpperCase()}
                      </span>
                      <h3 style={{ marginTop: "4px" }}>{item.name}</h3>
                      <p className="astro-title" style={{ marginTop: "6px" }}>
                        {item.description || item.benefits}
                      </p>
                    </div>

                    <div
                      className="astro-card-footer"
                      style={{ marginTop: "16px" }}
                    >
                      <span className="price">
                        ₹ {Number(item.price).toLocaleString()}
                      </span>

                      {/* Quantity Control or Add to Cart Button */}
                      {quantity > 0 ? (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            background: "rgba(184, 134, 11, 0.1)",
                            border: "1px solid rgba(184, 134, 11, 0.4)",
                            borderRadius: "6px",
                            padding: "4px 8px",
                          }}
                        >
                          <button
                            onClick={() => handleUpdateQuantity(item.id, -1)}
                            style={{
                              background: "none",
                              border: "none",
                              color: "#b8860b",
                              fontWeight: "bold",
                              fontSize: "1rem",
                              cursor: "pointer",
                              padding: "0 4px",
                            }}
                          >
                            -
                          </button>
                          <span
                            style={{
                              fontSize: "0.9rem",
                              fontWeight: "bold",
                              color: "#1e1b18",
                              minWidth: "16px",
                              textAlign: "center",
                            }}
                          >
                            {quantity}
                          </span>
                          <button
                            onClick={() => handleUpdateQuantity(item.id, 1)}
                            style={{
                              background: "none",
                              border: "none",
                              color: "#b8860b",
                              fontWeight: "bold",
                              fontSize: "1rem",
                              cursor: "pointer",
                              padding: "0 4px",
                            }}
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <button
                          className="btn-book-session"
                          onClick={() => handleAddToCart(item)}
                        >
                          Add to Cart 🛒
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Floating Bottom-Center Cart Bar */}
      {totalCartCount > 0 && (
        <div className="floating-cart-bar">
          <div className="floating-cart-info">
            <span className="floating-cart-count">
              {totalCartCount} item{totalCartCount > 1 ? "s" : ""} selected
            </span>
            <span className="floating-cart-total">
              ₹ {totalCartPrice.toLocaleString()}
            </span>
          </div>
          <button
            className="btn-floating-view-cart"
            onClick={() => setIsCartOpen(true)}
          >
            View Cart &amp; Checkout &rarr;
          </button>
        </div>
      )}

      {/* Cart Sliding Panel Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setCurrentView("checkout");
        }}
      />
    </div>
  );
}
