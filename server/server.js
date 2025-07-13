
const express = require('express');
const cors = require('cors');
const http = require('http');
const { v4: uuidv4 } = require('uuid');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
require('dotenv').config();

// Connect to MongoDB
connectDB();


const app = express();
const allowedOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
app.use(cors({
  origin: allowedOrigin,
  credentials: true
}));
app.use(express.json());


const messageRoutes = require('./routes/messages');
const userRoutes = require('./routes/users');
const userController = require('./controllers/userController');
const roomController = require('./controllers/roomController');
const Message = require('./models/Message');
app.use('/api/messages', messageRoutes);
app.use('/api/users', userRoutes);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigin,
    credentials: true
  }
});


const connectedUsers = new Map(); 
const userSockets = new Map(); 
const roomUsers = new Map(); 


const messageReactions = new Map();

io.on("connection", (socket) => {
  console.log("User Connected", socket.id);

  socket.on('join-room', async ({ userName, room }, ack) => {
    // Remove user from previous room if exists
    if (socket.userName && socket.room) {
      if (roomUsers.has(socket.room)) {
        roomUsers.get(socket.room).delete(socket.userName);
        if (roomUsers.get(socket.room).size === 0) roomUsers.delete(socket.room);
      }
    }
    socket.join(room);
    socket.userName = userName;
    socket.room = room;
    connectedUsers.set(userName, { socketId: socket.id, room });
    userSockets.set(socket.id, userName);
    if (!roomUsers.has(room)) roomUsers.set(room, new Set());
    roomUsers.get(room).add(userName);
    // Create or update user in DB
    await userController.createOrUpdateUser(userName, socket.id, room);
    // Add user to room in DB
    await roomController.addUserToRoom(room, userName);
    // Broadcast updated online users list to the room
    io.to(room).emit('user-status-update', {
      type: 'user-online',
      userName,
      onlineUsers: Array.from(roomUsers.get(room))
    });
    if (typeof ack === 'function') {
      ack({ success: true });
    }
  });

  socket.on('chat-message', async (data) => {
    console.log('Received chat message:', data);
    if (data.room) {
      if (!data.id) data.id = uuidv4();
      // Save to database
      try {
        await Message.create({
          userName: data.userName,
          msg: data.msg,
          timestamp: data.timestamp,
          room: data.room,
          _id: data.id
        });
      } catch (err) {
        console.error('Failed to save message:', err);
      }
      console.log('Broadcasting message to room:', data.room);
      console.log('Message data:', data);
      io.to(data.room).emit('chat-message', data);
    } else {
      console.log('Message rejected - no room specified');
    }
  });

  // Read receipts
  socket.on('message-read', ({ messageId, room, userName }) => {

    io.to(room).emit('message-read', { messageId, userName });
  });

  socket.on('typing', ({ userName, room }) => {
    socket.to(room).emit('typing', userName);
  });

  // Message reactions
  socket.on('message-reaction', ({ messageId, emoji, userName, room }) => {
    if (!messageId || !emoji || !userName || !room) return;
    if (!messageReactions.has(messageId)) messageReactions.set(messageId, {});
    const reactions = messageReactions.get(messageId);
    if (!reactions[emoji]) reactions[emoji] = [];

    if (reactions[emoji].includes(userName)) {
      reactions[emoji] = reactions[emoji].filter(u => u !== userName);
    } else {
      reactions[emoji].push(userName);
    }
    messageReactions.set(messageId, reactions);
   
    io.to(room).emit('message-reaction-update', { messageId, reactions });
  });

  socket.on("disconnect", async () => {
    console.log("User disconnected", socket.id);
    const userName = userSockets.get(socket.id);
    const room = socket.room;
    if (userName && room) {
      connectedUsers.delete(userName);
      userSockets.delete(socket.id);
      if (roomUsers.has(room)) {
        roomUsers.get(room).delete(userName);
        if (roomUsers.get(room).size === 0) roomUsers.delete(room);
      }
      // Remove user from DB
      await userController.removeUser(userName);
      // Remove user from room in DB
      await roomController.removeUserFromRoom(room, userName);
      if (room) {
        io.to(room).emit('user-status-update', {
          type: 'user-offline',
          userName,
          onlineUsers: roomUsers.has(room) ? Array.from(roomUsers.get(room)) : []
        });
      }
    }
  });
});

server.listen(process.env.PORT||3000,()=>{
  console.log(`Server running on Port:${process.env.PORT||3000}`);
});