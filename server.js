const http = require("http");
const express = require("express");
const { Server } = require("socket.io");

console.log("server.js started");

const app = express();

// Serve files from the public folder
app.use(express.static("public"));

// Basic HTTP health-check endpoint
app.get("/health", (req, res) => {
    res.json({ status: "OK" });
});

// Create the underlying Node.js HTTP server
const server = http.createServer(app);

// Attach Socket.io to the HTTP server
const io = new Server(server);

// Handle every new Socket.io connection
io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("joinRoom", (data, callback) => {

    const respond = typeof callback === "function"
        ? callback
        : () => {};

    if (!data || typeof data !== "object") {
        respond({
            success: false,
            message: "Invalid join request."
        });
        return;
    }

    let { username, room } = data;

    if (
        typeof username !== "string" ||
        typeof room !== "string" ||
        !username.trim() ||
        !room.trim()
    ) {
        respond({
            success: false,
            message: "Username and room are required."
        });
        return;
    }

    username = username.trim();
    room = room.trim();

    if (username.length > 30) {
        respond({
            success: false,
            message: "Username must be 30 characters or less."
        });
        return;
    }

    if (room.length > 30) {
        respond({
            success: false,
            message: "Room name must be 30 characters or less."
        });
        return;
    }

    if (socket.room) {
        socket.leave(socket.room);

        io.to(socket.room).emit("systemMessage", {
            message: `${socket.username} left the room`
        });
    }

    socket.join(room);

    socket.username = username;
    socket.room = room;

    console.log(`${username} joined ${room}`);

    respond({
        success: true,
        message: `Joined room "${room}"`
    });

    io.to(room).emit("systemMessage", {
        message: `${username} joined the room`
    });
});

    // Client sends a chat message
    socket.on("sendMessage", (message) => {

        // User must be in a room
        if (!socket.room) {
            socket.emit("errorMessage", {
                message: "Join a room before sending messages."
            });
            return;
        }

        // Validate message type
        if (typeof message !== "string") {
            socket.emit("errorMessage", {
                message: "Message must be text."
            });
            return;
        }

        message = message.trim();

        // Reject empty messages
        if (!message) {
            socket.emit("errorMessage", {
                message: "Message cannot be empty."
            });
            return;
        }

        // Limit message size
        if (message.length > 500) {
            socket.emit("errorMessage", {
                message: "Message cannot exceed 500 characters."
            });
            return;
        }

        // Send message only to the current room
        io.to(socket.room).emit("newMessage", {
            username: socket.username,
            message: message
        });
    });

    // Handle disconnect
    socket.on("disconnect", (reason) => {

        console.log(
            `${socket.username || "Unknown user"} disconnected:`,
            reason
        );

        // Notify remaining users in the room
        if (socket.room && socket.username) {
            io.to(socket.room).emit("systemMessage", {
                message: `${socket.username} disconnected`
            });
        }
    });
});

// Start the server
if (require.main === module) {
    server.listen(3000, () => {
        console.log("Server running on port 3000");
    });
}

module.exports = { app, server, io };