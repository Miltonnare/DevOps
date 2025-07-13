const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// POST /api/users/register - Register a new user
router.post('/register', userController.registerUser);

// POST /api/users/login - Login a user
router.post('/login', userController.loginUser);

module.exports = router; 