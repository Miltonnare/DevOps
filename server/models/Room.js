const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  users: [{ type: String }], // store userNames
});

module.exports = mongoose.model('Room', RoomSchema);
