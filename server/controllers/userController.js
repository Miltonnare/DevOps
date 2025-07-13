const User = require('../models/User');
const bcrypt = require('bcrypt');

// Create or update a user when they join a room
exports.createOrUpdateUser = async (userName, socketId, room) => {
  try {
    let user = await User.findOne({ userName });
    if (user) {
      user.socketId = socketId;
      user.room = room;
      await user.save();
    } else {
      user = new User({ userName, socketId, room });
      await user.save();
    }
    return user;
  } catch (err) {
    console.error('User DB error:', err);
    return null;
  }
};

// Remove user from DB on disconnect
exports.removeUser = async (userName) => {
  try {
    await User.deleteOne({ userName });
  } catch (err) {
    console.error('User DB error:', err);
  }
};

// Register a new user
exports.registerUser = async (req, res) => {
  try {
    const { userName, password } = req.body;
    if (!userName || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    const existingUser = await User.findOne({ userName });
    if (existingUser) {
      return res.status(409).json({ error: 'Username already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ userName, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed', details: err.message });
  }
};

// Login a user
exports.loginUser = async (req, res) => {
  try {
    const { userName, password } = req.body;
    if (!userName || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    const user = await User.findOne({ userName });
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    res.status(200).json({ message: 'Login successful', userName: user.userName });
  } catch (err) {
    res.status(500).json({ error: 'Login failed', details: err.message });
  }
};
