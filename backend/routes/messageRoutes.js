const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload'); // Multer middleware import kiya
const { getChannelMessages, createMessage } = require('../controllers/messageController');

// Get messages for a channel
router.get('/:channelId', auth, getChannelMessages);

// Send a new message (with optional file/image upload)
router.post('/', auth, upload.single('file'), createMessage);

module.exports = router;