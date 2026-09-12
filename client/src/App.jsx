import React, { useState, useEffect, useRef } from "react";
import { socket } from "./socket";
import {
  Wallet,
  Clock,
  AlertTriangle,
  PhoneOff,
  Send,
  Sparkles,
  ShieldCheck,
  Star,
  Award,
  MessageCircle,
  Lock,
} from "lucide-react";

export default function App() {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [sessionId, setSessionId] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0.0);
  const [sessionActive, setSessionActive] = useState(false);

  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const timerRef = useRef(null);

  const [warningMsg, setWarningMsg] = useState("");
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState("");
  const chatBottomRef = useRef(null);

  // Auto-scroll chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Socket Event Listeners
  useEffect(() => {
    function onConnect() {
      console.log("✅ Socket Connected! ID:", socket.id);
      setIsConnected(true);
      // Fetch actual wallet balance from DB on connect
      socket.emit("get_user_profile", { userId: 1 });
    }

    function onDisconnect() {
      console.log("❌ Socket Disconnected");
      setIsConnected(false);
    }

    function onUserProfile(data) {
      console.log("👤 User Profile Loaded:", data);
      setWalletBalance(parseFloat(data.walletBalance));
    }

    function onSessionStarted(data) {
      console.log("🚀 Session Started:", data);
      setSessionId(data.sessionId);
      setWalletBalance(parseFloat(data.initialBalance));
      setSessionActive(true);
      setSecondsElapsed(0);
      setWarningMsg("");

      setMessages([
        {
          id: 1,
          sender: "system",
          text: `Consultation Live. Rate: ₹${data.rate}/min.`,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
        {
          id: 2,
          sender: "expert",
          text: "Namaste! I am Pandit Rajesh Sharma. Ask your question or share your birth details.",
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);

      // Start front-end timer
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    }

    function onWalletUpdate(data) {
      console.log("💰 Wallet Updated:", data);
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
      console.log("🛑 Forced Disconnect:", data);
      stopSessionUI();
      setWarningMsg(data.reason);
    }

    function onSessionEnded(data) {
      console.log("🏁 Session Ended:", data);
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
      alert(`Session Error: ${data.message}`);
    }

    // Attach Listeners
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("user_profile", onUserProfile);
    socket.on("session_started", onSessionStarted);
    socket.on("wallet_update", onWalletUpdate);
    socket.on("force_disconnect", onForceDisconnect);
    socket.on("session_ended", onSessionEnded);
    socket.on("session_error", onError);

    // If socket is already connected when component mounts
    if (socket.connected) {
      onConnect();
    }

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
  }, []);

  const stopSessionUI = () => {
    setSessionActive(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  // Button Action: Start
  const handleStartSession = () => {
    console.log("🔴 CLICKED: Start Session Button");
    if (!socket.connected) {
      alert("Socket is NOT connected to server at http://localhost:5000");
      return;
    }
    socket.emit("start_session", {
      userId: 1,
      consultantId: 1,
      categoryUsed: "Astrology",
    });
  };

  // Button Action: End
  const handleEndSession = () => {
    console.log("🔴 CLICKED: End Session Button");
    if (sessionId) {
      socket.emit("end_session", { sessionId });
    } else {
      stopSessionUI();
    }
  };

  // Send Message Action
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

  return (
    <div style={styles.appContainer}>
      <header style={styles.navBar}>
        <div style={styles.navLeft}>
          <div style={styles.logoIcon}>
            <Sparkles size={20} color="#F59E0B" />
          </div>
          <div>
            <div style={styles.brandName}>Mitram</div>
            <div style={styles.brandSub}>Vedic Advice</div>
          </div>
        </div>

        <div style={styles.timerPill(sessionActive)}>
          <Clock size={16} color={sessionActive ? "#F59E0B" : "#64748B"} />
          <span style={styles.timerPillText}>{formatTime(secondsElapsed)}</span>
        </div>

        <div style={styles.navRight}>
          <div style={styles.walletWidget}>
            <Wallet size={16} color="#10B981" />
            <span>₹{walletBalance.toFixed(2)}</span>
          </div>
          <div style={styles.statusBadge(isConnected)}>
            {isConnected ? "Connected" : "Disconnected"}
          </div>
        </div>
      </header>

      <main style={styles.mainGrid}>
        <aside style={styles.consultantCard}>
          <div style={styles.avatarHeader}>
            <div style={styles.avatarRing}>
              <div style={styles.avatarInner}>P</div>
            </div>
            <div style={styles.badgeRow}>
              <span style={styles.badgePill}>
                <Star size={12} color="#F59E0B" fill="#F59E0B" /> 4.9
              </span>
            </div>
          </div>

          <h2 style={styles.consultantTitle}>Pandit Rajesh Sharma</h2>
          <p style={styles.consultantSub}>Vedic Astrology Specialist</p>

          <div style={styles.rateCard}>
            <div>
              <div style={styles.rateLabel}>Per Minute Rate</div>
              <div style={styles.rateValue}>₹15.00 / min</div>
            </div>
            <ShieldCheck size={24} color="#10B981" />
          </div>

          {!sessionActive ? (
            <button onClick={handleStartSession} style={styles.btnStart}>
              <MessageCircle size={18} /> Start Session Now
            </button>
          ) : (
            <button onClick={handleEndSession} style={styles.btnEnd}>
              <PhoneOff size={18} /> End Consultation
            </button>
          )}

          <div style={styles.securityBox}>
            <Lock size={12} color="#64748B" /> 256-bit Encrypted Private Session
          </div>
        </aside>

        <section style={styles.chatSection}>
          {warningMsg && (
            <div style={styles.warningAlert}>
              <AlertTriangle size={18} /> {warningMsg}
            </div>
          )}

          <div style={styles.chatStream}>
            {!sessionActive && messages.length === 0 && (
              <div style={styles.emptyState}>
                <Sparkles
                  size={48}
                  color="#6366F1"
                  style={{ marginBottom: "16px" }}
                />
                <h3>Ready to connect</h3>
                <p>Click "Start Session Now" on the left to begin.</p>
              </div>
            )}

            {messages.map((m) => {
              if (m.sender === "system") {
                return (
                  <div key={m.id} style={styles.systemMessage}>
                    <span>{m.text}</span>
                    <small style={styles.timeTag}>{m.time}</small>
                  </div>
                );
              }

              const isUser = m.sender === "user";
              return (
                <div
                  key={m.id}
                  style={isUser ? styles.userRow : styles.expertRow}
                >
                  <div style={isUser ? styles.userBubble : styles.expertBubble}>
                    <div>{m.text}</div>
                    <div style={styles.timeTag}>{m.time}</div>
                  </div>
                </div>
              );
            })}
            <div ref={chatBottomRef} />
          </div>

          <form onSubmit={handleSendMessage} style={styles.inputBar}>
            <input
              type="text"
              placeholder={
                sessionActive
                  ? "Type your message..."
                  : "Start session to enable chat..."
              }
              disabled={!sessionActive}
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              style={styles.textInput}
            />
            <button
              type="submit"
              disabled={!sessionActive || !inputMsg.trim()}
              style={styles.sendButton(sessionActive && inputMsg.trim())}
            >
              <Send size={18} />
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}

const styles = {
  appContainer: {
    backgroundColor: "#090D16",
    color: "#F8FAFC",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    fontFamily: "sans-serif",
  },
  navBar: {
    display: "flex",
    justifySpaceBetween: "space-between",
    alignItems: "center",
    padding: "16px 32px",
    backgroundColor: "#0F172A",
    borderBottom: "1px solid #1E293B",
  },
  navLeft: { display: "flex", alignItems: "center", gap: "12px" },
  logoIcon: {
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    backgroundColor: "#1E1B4B",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  brandName: { fontSize: "18px", fontWeight: "bold" },
  brandSub: { fontSize: "11px", color: "#94A3B8" },
  timerPill: (active) => ({
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: active ? "rgba(245, 158, 11, 0.1)" : "#1E293B",
    padding: "6px 16px",
    borderRadius: "20px",
  }),
  timerPillText: {
    fontSize: "14px",
    fontWeight: "bold",
    fontFamily: "monospace",
  },
  navRight: { display: "flex", alignItems: "center", gap: "16px" },
  walletWidget: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "#1E293B",
    padding: "8px 16px",
    borderRadius: "12px",
    color: "#10B981",
    fontWeight: "bold",
  },
  statusBadge: (online) => ({
    fontSize: "12px",
    padding: "4px 10px",
    borderRadius: "8px",
    backgroundColor: online
      ? "rgba(16, 185, 129, 0.1)"
      : "rgba(239, 68, 68, 0.1)",
    color: online ? "#10B981" : "#EF4444",
  }),
  mainGrid: {
    display: "grid",
    gridTemplateColumns: "320px 1fr",
    gap: "24px",
    padding: "24px 32px",
    maxWidth: "1400px",
    margin: "0 auto",
    width: "100%",
    flex: 1,
  },
  consultantCard: {
    backgroundColor: "#0F172A",
    borderRadius: "16px",
    padding: "24px",
    border: "1px solid #1E293B",
    height: "fit-content",
  },
  avatarHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "16px",
  },
  avatarRing: {
    width: "64px",
    height: "64px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #6366F1, #F59E0B)",
    padding: "2px",
  },
  avatarInner: {
    width: "100%",
    height: "100%",
    borderRadius: "50%",
    backgroundColor: "#1E1B4B",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    fontWeight: "bold",
  },
  badgeRow: { display: "flex", gap: "6px" },
  badgePill: {
    fontSize: "11px",
    backgroundColor: "#1E293B",
    padding: "4px 8px",
    borderRadius: "6px",
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  consultantTitle: {
    fontSize: "18px",
    fontWeight: "bold",
    margin: "0 0 4px 0",
  },
  consultantSub: { fontSize: "12px", color: "#94A3B8", margin: "0 0 20px 0" },
  rateCard: {
    backgroundColor: "#1E1B4B",
    borderRadius: "12px",
    padding: "16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  rateLabel: { fontSize: "11px", color: "#A5B4FC" },
  rateValue: { fontSize: "18px", fontWeight: "bold", color: "#F59E0B" },
  btnStart: {
    width: "100%",
    padding: "14px",
    borderRadius: "10px",
    backgroundColor: "#4F46E5",
    color: "#FFF",
    border: "none",
    fontWeight: "bold",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },
  btnEnd: {
    width: "100%",
    padding: "14px",
    borderRadius: "10px",
    backgroundColor: "#DC2626",
    color: "#FFF",
    border: "none",
    fontWeight: "bold",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },
  securityBox: {
    marginTop: "16px",
    fontSize: "11px",
    color: "#64748B",
    textAlign: "center",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
  },
  chatSection: {
    backgroundColor: "#0F172A",
    borderRadius: "16px",
    border: "1px solid #1E293B",
    display: "flex",
    flexDirection: "column",
    height: "calc(100vh - 140px)",
  },
  warningAlert: {
    backgroundColor: "#7F1D1D",
    color: "#FCA5A5",
    padding: "12px 20px",
    fontSize: "13px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  chatStream: {
    flex: 1,
    padding: "24px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  emptyState: { margin: "auto", textAlign: "center", color: "#64748B" },
  systemMessage: {
    alignSelf: "center",
    backgroundColor: "#1E293B",
    color: "#94A3B8",
    fontSize: "12px",
    padding: "6px 16px",
    borderRadius: "20px",
    border: "1px solid #334155",
  },
  userRow: { display: "flex", justifyContent: "flex-end" },
  expertRow: { display: "flex", justifyContent: "flex-start" },
  userBubble: {
    backgroundColor: "#4F46E5",
    color: "#FFF",
    padding: "12px 16px",
    borderRadius: "16px 16px 2px 16px",
    maxWidth: "65%",
    fontSize: "14px",
  },
  expertBubble: {
    backgroundColor: "#1E293B",
    color: "#F8FAFC",
    padding: "12px 16px",
    borderRadius: "16px 16px 16px 2px",
    maxWidth: "65%",
    fontSize: "14px",
    border: "1px solid #334155",
  },
  timeTag: {
    fontSize: "10px",
    opacity: 0.6,
    marginTop: "4px",
    textAlign: "right",
  },
  inputBar: {
    display: "flex",
    gap: "12px",
    padding: "16px 24px",
    backgroundColor: "#1E293B",
    borderTop: "1px solid #334155",
    borderRadius: "0 0 16px 16px",
  },
  textInput: {
    flex: 1,
    backgroundColor: "#0F172A",
    border: "1px solid #334155",
    borderRadius: "10px",
    padding: "12px 16px",
    color: "#F8FAFC",
    outline: "none",
  },
  sendButton: (active) => ({
    backgroundColor: active ? "#4F46E5" : "#334155",
    color: active ? "#FFF" : "#64748B",
    border: "none",
    borderRadius: "10px",
    padding: "0 20px",
    cursor: active ? "pointer" : "not-allowed",
  }),
};
