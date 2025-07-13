const Message = require('../models/Message');

// Save a new chat message
exports.createMessage = async (req, res) => {
  try {
    const { userName, msg, timestamp, room, id } = req.body;
    const message = new Message({ userName, msg, timestamp, room, _id: id });
    await message.save();
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save message', details: err.message });
  }
};

// Get all messages for a room
exports.getMessagesByRoom = async (req, res) => {
  try {
    const { room } = req.params;
    const messages = await Message.find({ room }).sort({ timestamp: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch messages', details: err.message });
  }
};
