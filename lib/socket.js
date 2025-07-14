// src/lib/socket.js
import { io } from "socket.io-client";

const URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001"; // Point to the new server

export const socket = io(URL, {
  path: "/api/socket.io", // Matches the server’s path
  autoConnect: false,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});