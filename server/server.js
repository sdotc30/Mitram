const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
require("dotenv").config();

const pool = require("./config/db");
const registerTickerSockets = require("./sockets/tickerSocket");

const app = express();
const server = http.createServer(app);

// Socket.io Config with CORS and explicit transport support
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
  transports: ["websocket", "polling"],
});

// Debug connection logger
io.on("connection", (socket) => {
  console.log(`[Socket] New client connected: ${socket.id}`);
  socket.on("disconnect", (reason) => {
    console.log(`[Socket] Client disconnected: ${socket.id} (${reason})`);
  });
});

// Attach billing ticker engine
registerTickerSockets(io);

// Middleware
app.use(cors());
app.use(express.json());

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
