const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');

// Register Route -> POST /api/auth/register
router.post('/register', register);

// Login Route -> POST /api/auth/login
router.post('/login', login);

module.exports = router;