const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { createWorkspace, getUserWorkspaces, getWorkspaceMembers } = require('../controllers/workspaceController');

// @route   POST /api/workspaces
// @desc    Create a workspace
router.post('/', auth, createWorkspace);

// @route   GET /api/workspaces
// @desc    Get user's workspaces
router.get('/', auth, getUserWorkspaces);



// Route to get members of a workspace
router.get('/:id/members', auth, getWorkspaceMembers);

module.exports = router;