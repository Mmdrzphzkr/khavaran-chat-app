// lib/server.js
const { Server } = require("socket.io");
const http = require("http");
const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Allow Next.js client
    methods: ["GET", "POST"],
  },
  path: "/api/socket.io", // Match the client’s path
});

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  // Private chat events
  socket.on("send-message", (msg) => {
    console.log("Message received:", msg);
    io.to(msg.chatId).emit("receive-message", msg); // Broadcast to chat room
  });

  socket.on("join-chat", (chatId) => {
    socket.join(chatId); // Join the private chat room
    console.log(`Socket ${socket.id} joined chat ${chatId}`);
  });

  // --- Group Chat Events ---
  socket.on("join-group", (groupId) => {
    socket.join(groupId); // Join the group chat room
    console.log(`Socket ${socket.id} joined group ${groupId}`);
  });

  socket.on("send-group-message", (msg) => {
    console.log("Group message received:", msg);
    // Broadcast to the specific group room
    io.to(msg.groupId).emit("receive-group-message", msg);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

server.listen(3001, () => {
  console.log(
    "Socket.IO server running on http://localhost:3001/api/socket.io"
  );
});
