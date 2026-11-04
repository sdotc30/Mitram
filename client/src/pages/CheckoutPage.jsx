import React, { useState, useEffect } from "react";
import "./CheckoutPage.css";
import logoImg from "../assets/logo.png";
import { useAuth } from "../AuthContext";

// Comprehensive list of all world countries
const ALL_COUNTRIES = [
  "India",
  "United States",
  "United Kingdom",
  "United Arab Emirates",
  "Canada",
  "Australia",
  "Singapore",
  "Germany",
  "France",
  "Japan",
  "Afghanistan",
  "Albania",
  "Algeria",
  "Andorra",
  "Angola",
  "Argentina",
  "Armenia",
  "Austria",
  "Azerbaijan",
  "Bahrain",
  "Bangladesh",
  "Belgium",
  "Brazil",
  "Bulgaria",
  "China",
  "Colombia",
  "Costa Rica",
  "Croatia",
  "Cyprus",
  "Czech Republic",
  "Denmark",
  "Egypt",
  "Estonia",
  "Finland",
  "Georgia",
  "Ghana",
  "Greece",
  "Hong Kong",
  "Hungary",
  "Iceland",
  "Indonesia",
  "Iran",
  "Iraq",
  "Ireland",
  "Israel",
  "Italy",
  "Jordan",
  "Kenya",
  "Kuwait",
  "Lebanon",
  "Malaysia",
  "Maldives",
  "Mauritius",
  "Mexico",
  "Nepal",
  "Netherlands",
  "New Zealand",
  "Nigeria",
  "Norway",
  "Oman",
  "Pakistan",
  "Panama",
  "Peru",
  "Philippines",
  "Poland",
  "Portugal",
  "Qatar",
  "Romania",
  "Russia",
  "Saudi Arabia",
  "Serbia",
  "Slovakia",
  "Slovenia",
  "South Africa",
  "South Korea",
  "Spain",
  "Sri Lanka",
  "Sweden",
  "Switzerland",
  "Taiwan",
  "Thailand",
  "Turkey",
  "Ukraine",
  "Vietnam",
  "Yemen",
  "Zambia",
  "Zimbabwe",
].sort();

// Complete list of Indian States and Union Territories
const INDIAN_STATES = [
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
].sort();

export default function CheckoutPage({
  cartItems,
  onUpdateQuantity,
  onBackToStore,
  onOrderSuccess,
}) {
  const { currentUser } = useAuth();
  const userEmail = currentUser?.email || "";

  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  // Saved addresses state
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [saveForFuture, setSaveForFuture] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: userEmail,
    countryCode: "+91",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
  });

  // Fetch saved addresses from backend on load
  useEffect(() => {
    if (userEmail) {
      fetch(`/api/addresses?email=${encodeURIComponent(userEmail)}`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setSavedAddresses(data);
            const defaultAddr = data.find((a) => a.is_default) || data[0];
            if (defaultAddr) {
              handleSelectSavedAddress(defaultAddr);
            }
          }
        })
        .catch((err) => console.error("Failed to load saved addresses:", err));
    }
  }, [userEmail]);

  const handleSelectSavedAddress = (addr) => {
    setSelectedAddressId(addr.id);
    setFormData({
      fullName: addr.full_name || "",
      email: userEmail,
      countryCode: addr.country_code || "+91",
      phone: addr.phone || "",
      address: addr.address || "",
      city: addr.city || "",
      state: addr.state || "",
      pincode: addr.pincode || "",
      country: addr.country || "India",
    });
  };

  const handleAddNewCardClick = () => {
    setSelectedAddressId(null);
    setFormData({
      fullName: "",
      email: userEmail,
      countryCode: "+91",
      phone: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      country: "India",
    });
  };

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );
  const shippingFee = subtotal > 0 ? 99 : 0;
  const grandTotal = subtotal + shippingFee;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!selectedAddressId && saveForFuture && userEmail) {
        await fetch("/api/addresses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: userEmail, ...formData }),
        });
      }

      setTimeout(() => {
        setIsSubmitting(false);
        setOrderPlaced(true);
        if (onOrderSuccess) onOrderSuccess();
      }, 1200);
    } catch (err) {
      console.error("Error during order placement:", err);
      setIsSubmitting(false);
    }
  };

  if (orderPlaced) {
    return (
      <div className="checkout-page-container">
        <div className="success-page-card">
          <div className="success-icon-badge">✨</div>
          <h1>Order Placed Successfully!</h1>
          <p>
            Blessed be your journey. Your spiritual remedies and gemstones are
            being prepared with sacred Vedic energization.
          </p>
          <div className="order-receipt-box">
            <span>
              Order ID: #MTR-{Math.floor(100000 + Math.random() * 900000)}
            </span>
            <span>Estimated Delivery: 3-5 Business Days</span>
          </div>
          <button className="btn-return-store" onClick={onBackToStore}>
            Return to Spiritual Store &rarr;
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page-container">
      {/* Top Header */}
      <header className="checkout-header">
        <div
          className="checkout-logo-area"
          onClick={onBackToStore}
          style={{ cursor: "pointer" }}
        >
          <img src={logoImg} alt="Mitram Logo" className="header-logo-only" />
          <span className="checkout-brand-title">Mitram Store Checkout</span>
        </div>
        <button className="btn-back-link" onClick={onBackToStore}>
          &larr; Back to Remedies
        </button>
      </header>

      {/* Main Two-Column Layout */}
      <div className="checkout-content-grid">
        {/* Left Column: Delivery & Payment Form */}
        <form onSubmit={handleSubmitOrder} className="checkout-form-section">
          {/* Saved Addresses Selector Box */}
          {savedAddresses.length > 0 && (
            <div className="checkout-card">
              <h2>Select Delivery Address</h2>
              <div className="saved-addresses-grid">
                {savedAddresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={`saved-address-tile ${
                      selectedAddressId === addr.id ? "selected" : ""
                    }`}
                    onClick={() => handleSelectSavedAddress(addr)}
                  >
                    <strong>{addr.full_name}</strong>
                    <p>
                      {addr.address}, {addr.city}, {addr.state} - {addr.pincode}
                    </p>
                    <span>
                      {addr.country_code} {addr.phone}
                    </span>
                  </div>
                ))}
                <div
                  className={`saved-address-tile add-new-tile ${
                    selectedAddressId === null ? "selected" : ""
                  }`}
                  onClick={handleAddNewCardClick}
                >
                  <span className="add-plus-icon">+</span>
                  <strong>Add New Address</strong>
                </div>
              </div>
            </div>
          )}

          <div className="checkout-card">
            <h2>1. Shipping &amp; Contact Information</h2>
            <div className="form-grid">
              <div className="form-group full-width">
                <label>
                  Full Name <span className="required-star">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  required
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>
                  Email Address <span className="required-star">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>
                  Phone Number <span className="required-star">*</span>
                </label>
                <div className="phone-input-row">
                  <select
                    name="countryCode"
                    value={formData.countryCode}
                    onChange={handleChange}
                    className="country-code-select"
                  >
                    <option value="+93">🇦🇫 +93</option>
                    <option value="+355">🇦🇱 +355</option>
                    <option value="+213">🇩🇿 +213</option>
                    <option value="+376">🇦🇩 +376</option>
                    <option value="+244">🇦🇴 +244</option>
                    <option value="+54">🇦🇷 +54</option>
                    <option value="+374">🇦🇲 +374</option>
                    <option value="+61">🇦🇺 +61</option>
                    <option value="+43">🇦🇹 +43</option>
                    <option value="+994">🇦🇿 +994</option>
                    <option value="+973">🇧🇭 +973</option>
                    <option value="+880">🇧🇩 +880</option>
                    <option value="+32">🇧🇪 +32</option>
                    <option value="+55">🇧🇷 +55</option>
                    <option value="+359">🇧🇬 +359</option>
                    <option value="+1">🇨🇦 +1</option>
                    <option value="+56">🇨🇱 +56</option>
                    <option value="+86">🇨🇳 +86</option>
                    <option value="+57">🇨🇴 +57</option>
                    <option value="+506">🇨🇷 +506</option>
                    <option value="+385">🇭🇷 +385</option>
                    <option value="+357">🇨🇾 +357</option>
                    <option value="+420">🇨🇿 +420</option>
                    <option value="+45">🇩🇰 +45</option>
                    <option value="+20">🇪🇬 +20</option>
                    <option value="+503">🇸🇻 +503</option>
                    <option value="+372">🇪🇪 +372</option>
                    <option value="+358">🇫🇮 +358</option>
                    <option value="+33">🇫🇷 +33</option>
                    <option value="+995">🇬🇪 +995</option>
                    <option value="+49">🇩🇪 +49</option>
                    <option value="+233">🇬🇭 +233</option>
                    <option value="+30">🇬🇷 +30</option>
                    <option value="+502">🇬🇹 +502</option>
                    <option value="+852">🇭🇰 +852</option>
                    <option value="+36">🇭🇺 +36</option>
                    <option value="+354">🇮🇸 +354</option>
                    <option value="+91">🇮🇳 +91</option>
                    <option value="+62">🇮🇩 +62</option>
                    <option value="+98">🇮🇷 +98</option>
                    <option value="+964">🇮🇶 +964</option>
                    <option value="+353">🇮🇪 +353</option>
                    <option value="+972">🇮🇱 +972</option>
                    <option value="+39">🇮🇹 +39</option>
                    <option value="+81">🇯🇵 +81</option>
                    <option value="+962">🇯🇴 +962</option>
                    <option value="+254">🇰🇪 +254</option>
                    <option value="+965">🇰🇼 +965</option>
                    <option value="+961">🇱🇧 +961</option>
                    <option value="+370">🇱🇹 +370</option>
                    <option value="+352">🇱🇺 +352</option>
                    <option value="+853">🇲🇴 +853</option>
                    <option value="+60">🇲🇾 +60</option>
                    <option value="+356">🇲🇹 +356</option>
                    <option value="+52">🇲🇽 +52</option>
                    <option value="+31">🇳🇱 +31</option>
                    <option value="+64">🇳🇿 +64</option>
                    <option value="+234">🇳🇬 +234</option>
                    <option value="+47">🇳🇴 +47</option>
                    <option value="+968">🇴🇲 +968</option>
                    <option value="+92">🇵🇰 +92</option>
                    <option value="+507">🇵🇦 +507</option>
                    <option value="+51">🇵🇪 +51</option>
                    <option value="+63">🇵🇭 +63</option>
                    <option value="+48">🇵🇱 +48</option>
                    <option value="+351">🇵🇹 +351</option>
                    <option value="+974">🇶🇦 +974</option>
                    <option value="+40">🇷🇴 +40</option>
                    <option value="+7">🇷🇺 +7</option>
                    <option value="+966">🇸🇦 +966</option>
                    <option value="+381">🇷🇸 +381</option>
                    <option value="+65">🇸🇬 +65</option>
                    <option value="+421">🇸🇰 +421</option>
                    <option value="+386">🇸🇮 +386</option>
                    <option value="+27">🇿🇦 +27</option>
                    <option value="+82">🇰🇷 +82</option>
                    <option value="+34">🇪🇸 +34</option>
                    <option value="+94">🇱🇰 +94</option>
                    <option value="+46">🇸🇪 +46</option>
                    <option value="+41">🇨🇭 +41</option>
                    <option value="+886">🇹🇼 +886</option>
                    <option value="+66">🇹🇭 +66</option>
                    <option value="+90">🇹🇷 +90</option>
                    <option value="+380">🇺🇦 +380</option>
                    <option value="+971">🇦🇪 +971</option>
                    <option value="+44">🇬🇧 +44</option>
                    <option value="+1">🇺🇸 +1</option>
                    <option value="+598">🇺🇾 +598</option>
                    <option value="+998">🇺🇿 +998</option>
                    <option value="+84">🇻🇳 +84</option>
                    <option value="+967">🇾🇪 +967</option>
                  </select>
                  <input
                    type="tel"
                    name="phone"
                    required
                    placeholder="Mobile number"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group full-width">
                <label>
                  STREET ADDRESS <span className="required-star">*</span>
                </label>
                <textarea
                  name="address"
                  required
                  rows="3"
                  placeholder="House number, flat, floor, building name, street, sector, or landmark"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>
                  City <span className="required-star">*</span>
                </label>
                <input
                  type="text"
                  name="city"
                  required
                  placeholder="City"
                  value={formData.city}
                  onChange={handleChange}
                />
              </div>

              {/* Dynamic State Selection (Dropdown for India, Input for others) */}
              <div className="form-group">
                <label>
                  State / Province <span className="required-star">*</span>
                </label>
                {formData.country === "India" ? (
                  <select
                    name="state"
                    required
                    value={formData.state}
                    onChange={handleChange}
                    className="country-select"
                  >
                    <option value="">Select State / UT</option>
                    {INDIAN_STATES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    name="state"
                    required
                    placeholder="State / Province"
                    value={formData.state}
                    onChange={handleChange}
                  />
                )}
              </div>

              <div className="form-group">
                <label>
                  Postal Pincode <span className="required-star">*</span>
                </label>
                <input
                  type="text"
                  name="pincode"
                  required
                  placeholder="Postal code / Pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                />
              </div>

              {/* Comprehensive Country Selector Dropdown */}
              <div className="form-group">
                <label>
                  Country <span className="required-star">*</span>
                </label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="country-select"
                >
                  {ALL_COUNTRIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Save Address Option for New Addresses */}
              {selectedAddressId === null && (
                <div
                  className="form-group full-width"
                  style={{ marginTop: "8px" }}
                >
                  <label
                    className="checkbox-label"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      cursor: "pointer",
                      textTransform: "none",
                      fontSize: "0.85rem",
                      fontWeight: "600",
                      color: "#443e38",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={saveForFuture}
                      onChange={(e) => setSaveForFuture(e.target.checked)}
                      style={{
                        width: "16px",
                        height: "16px",
                        accentColor: "#b8860b",
                      }}
                    />
                    Save this address for future checkouts
                  </label>
                </div>
              )}
            </div>
          </div>

          <div className="checkout-card">
            <h2>
              2. Select Payment Method <span className="required-star">*</span>
            </h2>
            <div className="payment-options-list">
              <label
                className={`payment-option ${paymentMethod === "upi" ? "selected" : ""}`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "upi"}
                  onChange={() => setPaymentMethod("upi")}
                />
                <div className="payment-icon-badge">⚡</div>
                <div className="payment-label-info">
                  <strong>UPI / QR Code</strong>
                  <span>Google Pay, PhonePe, Paytm, BHIM UPI</span>
                </div>
              </label>

              <label
                className={`payment-option ${paymentMethod === "card" ? "selected" : ""}`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "card"}
                  onChange={() => setPaymentMethod("card")}
                />
                <div className="payment-icon-badge">💳</div>
                <div className="payment-label-info">
                  <strong>Credit / Debit Card</strong>
                  <span>Visa, MasterCard, RuPay, Maestro</span>
                </div>
              </label>

              <label
                className={`payment-option ${paymentMethod === "netbanking" ? "selected" : ""}`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "netbanking"}
                  onChange={() => setPaymentMethod("netbanking")}
                />
                <div className="payment-icon-badge">🏦</div>
                <div className="payment-label-info">
                  <strong>Net Banking</strong>
                  <span>All major Indian &amp; international banks</span>
                </div>
              </label>

              <label
                className={`payment-option ${paymentMethod === "wallet" ? "selected" : ""}`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "wallet"}
                  onChange={() => setPaymentMethod("wallet")}
                />
                <div className="payment-icon-badge">👛</div>
                <div className="payment-label-info">
                  <strong>Mobile Wallets</strong>
                  <span>Paytm, Mobikwik, Freecharge, JioMoney</span>
                </div>
              </label>

              <label
                className={`payment-option ${paymentMethod === "cod" ? "selected" : ""}`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "cod"}
                  onChange={() => setPaymentMethod("cod")}
                />
                <div className="payment-icon-badge">📦</div>
                <div className="payment-label-info">
                  <strong>Cash on Delivery (COD)</strong>
                  <span>Pay securely when your package arrives</span>
                </div>
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="btn-place-order"
            disabled={isSubmitting || cartItems.length === 0}
          >
            {isSubmitting
              ? "Processing Sacred Order..."
              : `Complete Order • ₹ ${grandTotal.toLocaleString()}`}
          </button>
        </form>

        {/* Right Column: Order Summary */}
        <div className="checkout-summary-section">
          <div className="checkout-card order-summary-card">
            <h2>
              Order Summary ({cartItems.reduce((a, c) => a + c.quantity, 0)})
            </h2>

            {cartItems.length === 0 ? (
              <p className="empty-summary-text">Your cart is empty.</p>
            ) : (
              <div className="summary-items-list">
                {cartItems.map((item) => (
                  <div key={item.id} className="summary-item-row">
                    <img src={item.image} alt={item.name} />
                    <div className="summary-item-details">
                      <h4>{item.name}</h4>
                      <span className="summary-item-price">
                        ₹ {item.price} × {item.quantity}
                      </span>
                    </div>
                    <div className="summary-qty-controls">
                      <button onClick={() => onUpdateQuantity(item.id, -1)}>
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button onClick={() => onUpdateQuantity(item.id, 1)}>
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="summary-calculations">
              <div className="calc-row">
                <span>Subtotal</span>
                <span>₹ {subtotal.toLocaleString()}</span>
              </div>
              <div className="calc-row">
                <span>Secure Energized Shipping</span>
                <span>₹ {shippingFee}</span>
              </div>
              <div className="calc-row total">
                <span>Grand Total</span>
                <span>₹ {grandTotal.toLocaleString()}</span>
              </div>
            </div>

            <div className="secure-badge-box">
              🔒 100% Secure &amp; Authenticated Vedic Remedies
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
