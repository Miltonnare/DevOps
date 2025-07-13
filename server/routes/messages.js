const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');

// POST /api/messages - Save a new message
router.post('/', messageController.createMessage);

// GET /api/messages/:room - Get all messages for a room
router.get('/:room', messageController.getMessagesByRoom);

module.exports = router;
