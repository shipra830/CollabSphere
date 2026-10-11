const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { createTask, getTasks, updateTaskStatus, deleteTask } = require('../controllers/taskController');
router.post('/', auth, createTask);
router.get('/', auth, getTasks);
router.patch('/:id/status', auth, updateTaskStatus);
router.delete('/:id', auth, deleteTask);

module.exports = router;