const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.json({ limit: "50mb" }));
app.use(cors());

// Routes
const studentRouter = require("./routes/student.route");
app.use("/student", studentRouter);

// PORT from .env (fallback to 5000)
const PORT = process.env.PORT || 5000;

// MongoDB connection
const URI = process.env.MONGO_URI;
if (!URI) {
  console.error("❌ MONGO_URI is not defined in .env");
  process.exit(1); // Stop app if no DB URI
}

mongoose
  .connect(URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log(" MongoDB connected...");

    // Start server only after DB connects
    const server = app.listen(PORT, () =>
      console.log(` Server running on port ${PORT}`)
    );

    // Setup Socket.IO
    const { Server } = require("socket.io");
    const io = new Server(server, {
      cors: { origin: "*" },
    });

    // Track online users (socket.id -> username)
    let onlineUsers = {};
    // Store messages temporarily (could use DB later)
    let messages = [];

    io.on("connection", (socket) => {
      console.log(" A user connected:", socket.id);

      // User joins with their username
      socket.on("join", (username) => {
        onlineUsers[socket.id] = username;
        console.log(`${username} joined`);
        io.emit("onlineUsers", Object.values(onlineUsers)); // send updated list
        socket.emit("loadMessages", messages); // send chat history
      });

      // Handle sending messages
      socket.on("sendMsg", (msgObj) => {
        const newMsg = { ...msgObj, id: Date.now(), read: false };
        messages.push(newMsg);
        console.log("New message:", newMsg);

        // Broadcast to everyone INCLUDING sender (fix double text issue)
        io.emit("broadcastMsg", newMsg);
      });

      // Handle read receipts
      socket.on("readMsg", (msgId) => {
        console.log("Message read:", msgId);

        // Update message in memory
        messages = messages.map((m) =>
          m.id === msgId ? { ...m, read: true } : m
        );

        // Notify all clients
        io.emit("messageRead", msgId);
      });

      // Handle disconnect
      socket.on("disconnect", () => {
        const username = onlineUsers[socket.id];
        console.log(`${username || "A user"} disconnected`);
        delete onlineUsers[socket.id];
        io.emit("onlineUsers", Object.values(onlineUsers));
      });
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
  });


