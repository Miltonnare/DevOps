const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  userName: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  socketId: { type: String },
  room: { type: String },
});

module.exports = mongoose.model('User', UserSchema);
