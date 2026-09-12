const pool = require("../config/db");

// Track active timers so we can stop them
const activeTimers = new Map();

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log(`⚡ Client connected: ${socket.id}`);

    // --- 0. FETCH USER PROFILE / BALANCE ---
    socket.on("get_user_profile", async (data) => {
      const userId = parseInt(data.userId || 1, 10);
      try {
        const userRes = await pool.query(
          "SELECT wallet_balance FROM users WHERE id = $1",
          [userId],
        );
        if (userRes.rows.length > 0) {
          const balance = parseFloat(userRes.rows[0].wallet_balance || 0);
          socket.emit("user_profile", { walletBalance: balance });
        }
      } catch (err) {
        console.error("Error fetching user profile:", err);
      }
    });

    // --- 1. START SESSION ---
    socket.on("start_session", async (data) => {
      console.log("➡️ Received start_session request:", data);
      const userId = parseInt(data.userId || 1, 10);
      const consultantId = parseInt(data.consultantId || 1, 10);

      try {
        // Fetch User Balance & Consultant Rate
        const userRes = await pool.query(
          "SELECT wallet_balance FROM users WHERE id = $1",
          [userId],
        );
        const consultantRes = await pool.query(
          "SELECT per_minute_rate FROM consultants WHERE id = $1",
          [consultantId],
        );

        if (userRes.rows.length === 0 || consultantRes.rows.length === 0) {
          return socket.emit("session_error", {
            message: "User or Consultant not found in DB.",
          });
        }

        const balance = parseFloat(userRes.rows[0].wallet_balance || 0);
        const rate = parseFloat(consultantRes.rows[0].per_minute_rate || 0);

        console.log(`🔍 DB Check - User Balance: ₹${balance}, Rate: ₹${rate}`);

        if (balance < rate) {
          return socket.emit("session_error", {
            message: `Insufficient balance (DB balance: ₹${balance.toFixed(
              2,
            )}) to start session (₹${rate.toFixed(2)}/min).`,
          });
        }

        // Insert Session into Database
        const sessionRes = await pool.query(
          `INSERT INTO sessions (user_id, consultant_id, category_used, status) 
           VALUES ($1, $2, $3, 'ACTIVE') RETURNING id`,
          [userId, consultantId, data.categoryUsed || "General"],
        );
        const sessionId = sessionRes.rows[0].id;

        // Join room for target updates
        socket.join(`session_${sessionId}`);

        // Notify client session is live
        socket.emit("session_started", {
          sessionId,
          rate,
          initialBalance: balance,
        });

        // Start Ticker (10 seconds for dev, change to 60000 for 1 min)
        const TICKER_MS = 10000;

        const intervalId = setInterval(async () => {
          try {
            // Get fresh balance
            const freshUser = await pool.query(
              "SELECT wallet_balance FROM users WHERE id = $1",
              [userId],
            );
            let currentBal = parseFloat(freshUser.rows[0].wallet_balance || 0);

            if (currentBal >= rate) {
              const newBal = currentBal - rate;

              // Deduct from DB
              await pool.query(
                "UPDATE users SET wallet_balance = $1 WHERE id = $2",
                [newBal, userId],
              );
              await pool.query(
                "UPDATE sessions SET total_minutes = total_minutes + 1, total_amount_deducted = total_amount_deducted + $1 WHERE id = $2",
                [rate, sessionId],
              );

              // Emit balance update
              io.to(`session_${sessionId}`).emit("wallet_update", {
                remainingBalance: newBal,
                deductedAmount: rate,
              });
            } else {
              // Insufficient balance -> Terminate
              clearInterval(activeTimers.get(sessionId));
              activeTimers.delete(sessionId);
              await pool.query(
                "UPDATE sessions SET status = 'COMPLETED', end_time = CURRENT_TIMESTAMP WHERE id = $1",
                [sessionId],
              );

              io.to(`session_${sessionId}`).emit("force_disconnect", {
                reason: "Session ended due to insufficient wallet balance.",
              });
            }
          } catch (err) {
            console.error("Ticker error:", err);
          }
        }, TICKER_MS);

        activeTimers.set(sessionId, intervalId);
      } catch (err) {
        console.error("Error starting session:", err);
        socket.emit("session_error", {
          message: "Server error starting session.",
        });
      }
    });

    // --- 2. END SESSION ---
    socket.on("end_session", async (data) => {
      console.log("🛑 Received end_session request:", data);
      const { sessionId } = data;

      if (sessionId && activeTimers.has(sessionId)) {
        clearInterval(activeTimers.get(sessionId));
        activeTimers.delete(sessionId);
      }

      if (sessionId) {
        await pool.query(
          "UPDATE sessions SET status = 'COMPLETED', end_time = CURRENT_TIMESTAMP WHERE id = $1",
          [sessionId],
        );
        io.to(`session_${sessionId}`).emit("session_ended", {
          message: "Session ended by user.",
        });
      }
    });

    socket.on("disconnect", () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });
};
