const Room = require('../models/Room');

// Add user to a room (create room if not exists)
exports.addUserToRoom = async (roomName, userName) => {
  try {
    let room = await Room.findOne({ name: roomName });
    if (!room) {
      room = new Room({ name: roomName, users: [userName] });
    } else if (!room.users.includes(userName)) {
      room.users.push(userName);
    }
    await room.save();
    return room;
  } catch (err) {
    console.error('Room DB error:', err);
    return null;
  }
};

// Remove user from a room
exports.removeUserFromRoom = async (roomName, userName) => {
  try {
    const room = await Room.findOne({ name: roomName });
    if (room) {
      room.users = room.users.filter(u => u !== userName);
      await room.save();
      // Optionally, delete room if empty
      if (room.users.length === 0) await Room.deleteOne({ name: roomName });
    }
  } catch (err) {
    console.error('Room DB error:', err);
  }
};

// Get all users in a room
exports.getUsersInRoom = async (roomName) => {
  try {
    const room = await Room.findOne({ name: roomName });
    return room ? room.users : [];
  } catch (err) {
    console.error('Room DB error:', err);
    return [];
  }
};
