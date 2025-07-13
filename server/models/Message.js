const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  userName: { type: String, required: true },
  msg: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  room: { type: String, required: true },
  reactions: { type: Map, of: [String], default: {} },
});

module.exports = mongoose.model('Message', MessageSchema);
