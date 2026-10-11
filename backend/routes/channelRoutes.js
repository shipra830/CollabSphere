const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { createChannel, getWorkspaceChannels } = require('../controllers/channelController');

router.post('/', auth, createChannel);
router.get('/:workspaceId', auth, getWorkspaceChannels);

module.exports = router;