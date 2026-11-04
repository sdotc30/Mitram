const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
require("dotenv").config();

const pool = require("./config/db");
const registerTickerSockets = require("./sockets/tickerSocket");

const directoryRoutes = require("./routes/directoryRoutes");
const astrologerRoutes = require("./routes/astrologers");
const productRoutes = require("./routes/products");

const app = express();
const server = http.createServer(app);

// Socket.io Config
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
  transports: ["websocket", "polling"],
});

io.on("connection", (socket) => {
  console.log(`[Socket] New client connected: ${socket.id}`);

  // --- Real-Time Consultation Chat & Voice Call System ---
  socket.on("join_session", ({ roomId, user }) => {
    socket.join(roomId);
    console.log(`[Socket] ${socket.id} joined consultation room: ${roomId}`);
    socket.to(roomId).emit("user_joined", { socketId: socket.id, user });
  });

  socket.on(
    "send_message",
    ({ roomId, senderId, senderName, senderRole, messageText }) => {
      const messagePayload = {
        id: Date.now(),
        roomId,
        senderId,
        senderName,
        senderRole,
        messageText,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      io.in(roomId).emit("receive_message", messagePayload);
    },
  );

  // WebRTC Signaling for Voice Calls
  socket.on("webrtc_offer", ({ roomId, offer }) => {
    socket
      .to(roomId)
      .emit("webrtc_offer", { offer, senderSocketId: socket.id });
  });

  socket.on("webrtc_answer", ({ roomId, answer }) => {
    socket
      .to(roomId)
      .emit("webrtc_answer", { answer, senderSocketId: socket.id });
  });

  socket.on("webrtc_ice_candidate", ({ roomId, candidate }) => {
    socket.to(roomId).emit("webrtc_ice_candidate", { candidate });
  });

  socket.on("end_session", ({ roomId }) => {
    io.in(roomId).emit("session_ended");
  });

  socket.on("disconnect", (reason) => {
    console.log(`[Socket] Client disconnected: ${socket.id} (${reason})`);
  });
});

registerTickerSockets(io);

// Middleware
app.use(cors());
app.use(express.json());

// --- Reviews API Endpoints ---

// POST Submit a new review for an astrologer
app.post("/api/astrologers/:id/reviews", async (req, res) => {
  try {
    const { id } = req.params;
    const { user_name, rating, comment } = req.body;
    const astroIdInt = parseInt(id, 10);

    if (isNaN(astroIdInt)) {
      return res.status(400).json({ error: "Invalid astrologer ID" });
    }

    if (!user_name || !rating || !comment) {
      return res.status(400).json({ error: "Missing required review fields" });
    }

    // Auto-create reviews table if it does not exist yet
    await pool.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        astrologer_id INT,
        user_name VARCHAR(255) NOT NULL,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT NOT NULL,
        helpful_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Insert new review
    const insertResult = await pool.query(
      `INSERT INTO reviews (astrologer_id, user_name, rating, comment, helpful_count, created_at)
       VALUES ($1, $2, $3, $4, 0, NOW())
       RETURNING id, astrologer_id, user_name, rating, comment, helpful_count, 
                 TO_CHAR(created_at, 'DD Mon YYYY') as created_at`,
      [astroIdInt, user_name, parseInt(rating, 10), comment],
    );

    // Update rating without wiping out lifetime consultation/reviews_count
    try {
      await pool.query(
        `UPDATE astrologers 
         SET rating = (SELECT ROUND(AVG(rating)::numeric, 1) FROM reviews WHERE astrologer_id = $1)
         WHERE id = $1`,
        [astroIdInt],
      );
    } catch (syncErr) {
      console.warn(
        "[Reviews] Note: Could not update average rating:",
        syncErr.message,
      );
    }

    console.log(
      `[Reviews] Saved review #${insertResult.rows[0].id} for astrologer ${astroIdInt}`,
    );
    res.status(201).json(insertResult.rows[0]);
  } catch (err) {
    console.error("Error creating review:", err);
    res
      .status(500)
      .json({ error: "Failed to save review", details: err.message });
  }
});

// GET Fetch all reviews for an astrologer
app.get("/api/astrologers/:id/reviews", async (req, res) => {
  try {
    const { id } = req.params;
    const astroIdInt = parseInt(id, 10);

    if (isNaN(astroIdInt)) {
      return res.status(400).json({ error: "Invalid astrologer ID" });
    }

    await pool.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        astrologer_id INT,
        user_name VARCHAR(255) NOT NULL,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT NOT NULL,
        helpful_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const result = await pool.query(
      `SELECT id, astrologer_id, user_name, rating, comment, helpful_count, 
              TO_CHAR(created_at, 'DD Mon YYYY') as created_at 
       FROM reviews 
       WHERE astrologer_id = $1 
       ORDER BY id DESC`,
      [astroIdInt],
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching reviews:", err);
    res
      .status(500)
      .json({ error: "Failed to fetch reviews", details: err.message });
  }
});

// POST Mark a review as helpful
app.post("/api/reviews/:id/helpful", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `UPDATE reviews 
       SET helpful_count = COALESCE(helpful_count, 0) + 1 
       WHERE id = $1 
       RETURNING *`,
      [id],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Review not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating helpful count:", err);
    res.status(500).json({ error: "Failed to update helpful count" });
  }
});

// API Routes Mounting
app.use("/api", directoryRoutes);
app.use("/api/astrologers", astrologerRoutes);
app.use("/api/products", productRoutes);

// --- Saved Addresses API Endpoints ---

// GET saved addresses for a user by email
app.get("/api/addresses", async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const result = await pool.query(
      "SELECT * FROM user_addresses WHERE user_email = $1 ORDER BY is_default DESC, id DESC",
      [email],
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching addresses:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST save a new address
app.post("/api/addresses", async (req, res) => {
  try {
    const {
      email,
      fullName,
      countryCode,
      phone,
      address,
      city,
      state,
      pincode,
      country,
    } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const result = await pool.query(
      `INSERT INTO user_addresses (user_email, full_name, country_code, phone, address, city, state, pincode, country)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [
        email,
        fullName,
        countryCode,
        phone,
        address,
        city,
        state,
        pincode,
        country,
      ],
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error saving address:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Health Check Route
app.get("/api/health", async (req, res) => {
  try {
    const dbTest = await pool.query("SELECT NOW()");
    res.json({
      status: "OK",
      message: "Mitram Backend Engine is operational",
      dbTime: dbTest.rows[0].now,
    });
  } catch (error) {
    console.error("Database connection error:", error);
    res
      .status(500)
      .json({ status: "ERROR", message: "Database connection failed" });
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Mitram Core Server running on port ${PORT}`);
});
