const express = require('express');
const router = express.Router();
const { getDirectMessages, sendDirectMessage } = require('../controllers/dmController');
const authMiddleware = require('../middleware/auth');// Apne project ka auth middleware path check kar lena

// All DM routes require authentication
router.use(authMiddleware);

router.get('/:userId', getDirectMessages);
router.post('/', sendDirectMessage);

module.exports = router;