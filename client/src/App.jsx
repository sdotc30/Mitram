import React, { useState, useEffect, useRef } from "react";
import { socket } from "./socket";
import "./App.css";
import {
  Wallet,
  Clock,
  AlertTriangle,
  PhoneOff,
  Send,
  Sparkles,
  ShieldCheck,
  Star,
  MessageCircle,
  Lock,
  ArrowRight,
  Heart,
  UserCheck,
  Calendar,
  Video,
  X,
} from "lucide-react";

export default function App() {
  // Navigation State: 'landing' | 'session'
  const [currentView, setCurrentView] = useState("landing");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedConsultant, setSelectedConsultant] = useState(null);

  // Directory Data States
  const [consultants, setConsultants] = useState([]);
  const [loadingConsultants, setLoadingConsultants] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Socket & Session States
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [sessionId, setSessionId] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0.0);
  const [sessionActive, setSessionActive] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  // Timer & Chat
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const timerRef = useRef(null);
  const [warningMsg, setWarningMsg] = useState("");
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState("");
  const chatBottomRef = useRef(null);

  // Categories matching your design layout
  const categoryCards = [
    {
      slug: "normal",
      name: "Normal Consultation",
      tagline:
        "A safe space to talk, seek advice and get clarity on life's everyday questions.",
      btnText: "Start a Conversation",
      icon: <MessageCircle size={24} color="#D97706" />,
    },
    {
      slug: "vedic",
      name: "Vedic Consultation",
      tagline:
        "Discover timeless wisdom from Vedic knowledge to find balance, purpose and direction.",
      btnText: "Explore Vedic Guidance",
      icon: (
        <span
          style={{ fontSize: "24px", fontWeight: "bold", color: "#D97706" }}
        >
          ॐ
        </span>
      ),
    },
    {
      slug: "astro",
      name: "Astro Consultation",
      tagline:
        "Get personalised astrological insights to understand your strengths, challenges and what lies ahead.",
      btnText: "View Astro Services",
      icon: <Sparkles size={24} color="#D97706" />,
    },
    {
      slug: "listening",
      name: "No-Judgement Zone",
      tagline:
        "Express yourself without fear. Compassionate listeners ready to support you unconditionally.",
      btnText: "Enter Safe Space",
      icon: <Heart size={24} color="#D97706" />,
    },
  ];

  // Auto-scroll chat window
  useEffect(() => {
    if (currentView === "session") {
      chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, currentView]);

  // Socket setup
  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
      socket.emit("get_user_profile", { userId: 1 });
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onUserProfile(data) {
      setWalletBalance(parseFloat(data.walletBalance));
    }

    function onSessionStarted(data) {
      setIsStarting(false);
      setSessionId(data.sessionId);
      setWalletBalance(parseFloat(data.initialBalance));
      setSessionActive(true);
      setSecondsElapsed(0);
      setWarningMsg("");
      setCurrentView("session");
      setIsModalOpen(false);

      setMessages([
        {
          id: 1,
          sender: "system",
          text: `Consultation Live with ${selectedConsultant?.name || "Expert"}. Rate: ₹${data.rate}/min.`,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
        {
          id: 2,
          sender: "expert",
          text: `Namaste! I am ${selectedConsultant?.name || "your consultant"}. How can I guide you today?`,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);

      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    }

    function onWalletUpdate(data) {
      setWalletBalance(parseFloat(data.remainingBalance));
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          sender: "system",
          text: `Deducted ₹${data.deductedAmount}. Remaining: ₹${parseFloat(data.remainingBalance).toFixed(2)}`,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    }

    function onForceDisconnect(data) {
      stopSessionUI();
      setWarningMsg(data.reason);
    }

    function onSessionEnded() {
      stopSessionUI();
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          sender: "system",
          text: "Session completed successfully.",
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    }

    function onError(data) {
      setIsStarting(false);
      alert(`Session Error: ${data.message}`);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("user_profile", onUserProfile);
    socket.on("session_started", onSessionStarted);
    socket.on("wallet_update", onWalletUpdate);
    socket.on("force_disconnect", onForceDisconnect);
    socket.on("session_ended", onSessionEnded);
    socket.on("session_error", onError);

    if (socket.connected) onConnect();

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("user_profile", onUserProfile);
      socket.off("session_started", onSessionStarted);
      socket.off("wallet_update", onWalletUpdate);
      socket.off("force_disconnect", onForceDisconnect);
      socket.off("session_ended", onSessionEnded);
      socket.off("session_error", onError);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [selectedConsultant]);

  // Fetch consultants filtered by category
  const openCategoryModal = async (cat) => {
    setSelectedCategory(cat);
    setIsModalOpen(true);
    setLoadingConsultants(true);

    try {
      const res = await fetch(
        `http://localhost:5000/api/consultants?category=${cat.slug}`,
      );
      const data = await res.json();
      setConsultants(data);
    } catch (err) {
      console.error("Failed to load consultants:", err);
    } finally {
      setLoadingConsultants(false);
    }
  };

  const handleStartConsultation = (consultant) => {
    if (isStarting || sessionActive) return;
    setSelectedConsultant(consultant);
    setIsStarting(true);

    socket.emit("start_session", {
      userId: 1,
      consultantId: consultant.id,
      categoryUsed: selectedCategory?.name || "General",
    });
  };

  const stopSessionUI = () => {
    setSessionActive(false);
    setIsStarting(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleEndSession = () => {
    if (sessionId) {
      socket.emit("end_session", { sessionId });
    } else {
      stopSessionUI();
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMsg.trim() || !sessionActive) return;

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        sender: "user",
        text: inputMsg,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);
    setInputMsg("");
  };

  const formatTime = (totalSec) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // --- UI RENDER: ACTIVE CONSULTATION SESSION ---
  if (currentView === "session") {
    return (
      <div className="app-container">
        <header className="nav-bar">
          <div className="nav-left" onClick={() => setCurrentView("landing")}>
            <div className="logo-icon">
              <Sparkles size={20} color="#F59E0B" />
            </div>
            <div>
              <div className="brand-name">Mitram</div>
              <div className="brand-sub">Guidance Platform</div>
            </div>
          </div>

          <div className={`timer-pill ${sessionActive ? "active" : ""}`}>
            <Clock size={16} color={sessionActive ? "#F59E0B" : "#64748B"} />
            <span className="timer-pill-text">
              {formatTime(secondsElapsed)}
            </span>
          </div>

          <div className="nav-right">
            <div className="wallet-widget">
              <Wallet size={16} color="#10B981" />
              <span>₹{walletBalance.toFixed(2)}</span>
            </div>
            <button
              onClick={() => setCurrentView("landing")}
              className="btn-nav-back"
            >
              Exit Room
            </button>
          </div>
        </header>

        <main className="main-grid">
          <aside className="consultant-card-sidebar">
            <div className="avatar-header">
              <div className="avatar-ring">
                <div className="avatar-inner">
                  {selectedConsultant?.name ? selectedConsultant.name[0] : "P"}
                </div>
              </div>
              <span className="badge-pill">
                <Star size={12} color="#F59E0B" fill="#F59E0B" />{" "}
                {selectedConsultant?.rating || "4.9"}
              </span>
            </div>

            <h2 className="consultant-title">
              {selectedConsultant?.name || "Pandit Rajesh Sharma"}
            </h2>
            <p className="consultant-sub">
              {selectedConsultant?.bio || "Vedic Astrology Specialist"}
            </p>

            <div className="rate-card">
              <div>
                <div className="rate-label">Per Minute Rate</div>
                <div className="rate-value">
                  ₹
                  {parseFloat(
                    selectedConsultant?.per_minute_rate || 15,
                  ).toFixed(2)}{" "}
                  / min
                </div>
              </div>
              <ShieldCheck size={24} color="#10B981" />
            </div>

            {sessionActive && (
              <button onClick={handleEndSession} className="btn-end">
                <PhoneOff size={18} /> End Consultation
              </button>
            )}

            <div className="security-box">
              <Lock size={12} color="#64748B" /> 256-bit Encrypted Private
              Session
            </div>
          </aside>

          <section className="chat-section">
            {warningMsg && (
              <div className="warning-alert">
                <AlertTriangle size={18} /> {warningMsg}
              </div>
            )}

            <div className="chat-stream">
              {messages.map((m) => {
                if (m.sender === "system") {
                  return (
                    <div key={m.id} className="system-message">
                      <span>{m.text}</span>
                      <small className="time-tag">{m.time}</small>
                    </div>
                  );
                }

                const isUser = m.sender === "user";
                return (
                  <div
                    key={m.id}
                    className={isUser ? "user-row" : "expert-row"}
                  >
                    <div className={isUser ? "user-bubble" : "expert-bubble"}>
                      <div>{m.text}</div>
                      <div className="time-tag">{m.time}</div>
                    </div>
                  </div>
                );
              })}
              <div ref={chatBottomRef} />
            </div>

            <form onSubmit={handleSendMessage} className="input-bar">
              <input
                type="text"
                placeholder={
                  sessionActive
                    ? "Type your message..."
                    : "Session completed..."
                }
                disabled={!sessionActive}
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                className="text-input"
              />
              <button
                type="submit"
                disabled={!sessionActive || !inputMsg.trim()}
                className={`send-button ${sessionActive && inputMsg.trim() ? "active" : ""}`}
              >
                <Send size={18} />
              </button>
            </form>
          </section>
        </main>
      </div>
    );
  }

  // --- UI RENDER: LANDING PAGE ---
  return (
    <div className="landing-container">
      {/* Navbar */}
      <nav className="landing-nav">
        <div className="nav-left">
          <div className="landing-logo-icon">
            <Sparkles size={20} color="#D97706" />
          </div>
          <span className="landing-brand">mitram</span>
        </div>
        <div className="nav-links">
          <a href="#home" className="nav-link">
            Home
          </a>
          <a href="#consultations" className="nav-link">
            Consultations
          </a>
          <a href="#howitworks" className="nav-link">
            How it Works
          </a>
        </div>
        <div className="nav-right">
          <div className="landing-wallet">
            <Wallet size={16} color="#D97706" />
            <span>₹{walletBalance.toFixed(2)}</span>
          </div>
          <button
            className="btn-primary"
            onClick={() => openCategoryModal(categoryCards[0])}
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-sub-header">
          CLARITY • WISDOM • A BRIGHTER TOMORROW
        </div>
        <h1 className="hero-title">
          Guidance for Every Chapter
          <br />
          of Your Life
        </h1>
        <p className="hero-desc">
          Whether it's a simple conversation, deep Vedic wisdom or astrological
          insights — Mitram is here for you.
        </p>
        <button
          className="btn-hero"
          onClick={() => openCategoryModal(categoryCards[0])}
        >
          Book a Consultation <ArrowRight size={18} />
        </button>
      </section>

      {/* Consultations Grid Section */}
      <section id="consultations" className="section-container">
        <div className="section-tag">— OUR CONSULTATIONS —</div>
        <h2 className="section-heading">Different Paths. A Brighter You.</h2>
        <p className="section-sub">
          Explore consultations tailored to your needs, all in one place.
        </p>

        <div className="category-grid">
          {categoryCards.map((cat, idx) => (
            <div key={idx} className="category-card">
              <div className="category-icon-circle">{cat.icon}</div>
              <h3 className="category-card-title">{cat.name}</h3>
              <p className="category-card-desc">{cat.tagline}</p>
              <button
                className="btn-card-action"
                onClick={() => openCategoryModal(cat)}
              >
                {cat.btnText} <ArrowRight size={14} />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Stepper Section */}
      <section id="howitworks" className="section-container-alt">
        <div className="section-tag">— HOW IT WORKS —</div>
        <h2 className="section-heading">Simple. Seamless. Meaningful.</h2>

        <div className="stepper-grid">
          <div className="step-item">
            <div className="step-icon">
              <UserCheck size={24} color="#78350F" />
            </div>
            <h4>1. Choose a Category</h4>
            <p className="step-desc">
              Select the guidance space that fits your current needs.
            </p>
          </div>
          <ArrowRight size={20} color="#CBD5E1" style={{ marginTop: "24px" }} />
          <div className="step-item">
            <div className="step-icon">
              <Calendar size={24} color="#78350F" />
            </div>
            <h4>2. Select an Expert</h4>
            <p className="step-desc">
              Compare per-minute rates, ratings, and bios.
            </p>
          </div>
          <ArrowRight size={20} color="#CBD5E1" style={{ marginTop: "24px" }} />
          <div className="step-item">
            <div className="step-icon">
              <Video size={24} color="#78350F" />
            </div>
            <h4>3. Connect Live</h4>
            <p className="step-desc">
              Start your instant private room with real-time billing.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div>© 2026 Mitram. All rights reserved.</div>
        <div>Clarity today. A brighter tomorrow.</div>
      </footer>

      {/* CONSULTANTS MODAL */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <div>
                <h3 className="modal-title">{selectedCategory?.name}</h3>
                <p className="modal-sub">
                  Select a consultant to connect instantly
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="btn-close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              {loadingConsultants ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "40px",
                    color: "#78716C",
                  }}
                >
                  Loading consultants...
                </div>
              ) : consultants.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "40px",
                    color: "#78716C",
                  }}
                >
                  No active consultants available in this category.
                </div>
              ) : (
                consultants.map((item) => (
                  <div key={item.id} className="modal-consultant-card">
                    <div>
                      <div className="consultant-card-name">{item.name}</div>
                      <div className="consultant-card-bio">{item.bio}</div>
                      <div className="consultant-card-rating">
                        <Star size={14} color="#F59E0B" fill="#F59E0B" />{" "}
                        {item.rating} Rating
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div className="modal-rate-text">
                        ₹{parseFloat(item.per_minute_rate).toFixed(2)}/min
                      </div>
                      <button
                        className="btn-connect-now"
                        onClick={() => handleStartConsultation(item)}
                        disabled={isStarting}
                      >
                        {isStarting ? "Connecting..." : "Connect Now"}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
