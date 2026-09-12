import { io } from "socket.io-client";

// Single socket instance across the whole React app
export const socket = io("http://localhost:5000", {
  transports: ["websocket", "polling"],
  autoConnect: true,
});
