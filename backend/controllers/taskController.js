const Task = require('../models/Task');

// Get tasks for a Workspace or Channel
// Get tasks for a Workspace or Channel
exports.getTasks = async (req, res) => {
    try {
        const { workspaceId, channelId } = req.query;

        // Agar workspaceId nahi hai ya string "undefined" hai, toh crash hone ke bajaye empty array bhej do
        if (!workspaceId || workspaceId === 'undefined') {
            return res.status(200).json([]);
        }

        let filter = { workspace: workspaceId };
        if (channelId && channelId !== 'undefined') {
            filter.channel = channelId;
        }

        const tasks = await Task.find(filter)
            .populate('assignedTo', 'username email')
            .populate('createdBy', 'username email');

        res.status(200).json(tasks);
    } catch (error) {
        console.log("Task fetch error detail:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Create a new Task
exports.createTask = async (req, res) => {
    try {
        const { title, description, status, priority, workspaceId, channelId, assignedTo } = req.body;

        const task = new Task({
            title,
            description,
            status: status || 'Todo',
            priority: priority || 'Medium',
            workspace: workspaceId,
            channel: channelId,
            assignedTo,
            createdBy: req.user?._id || req.user
        });

        await task.save();

        // Emit real-time event to socket io for other windows in the same workspace
        const io = req.app.get('io');
        if (io) {
            io.to(workspaceId).emit('task_created', task);
            if (channelId) {
                io.to(channelId).emit('task_created', task);
            }
        }

        res.status(201).json({ message: 'Task created successfully!', task });
    } catch (error) {
        console.log("Create task error:", error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update Task Status
exports.updateTaskStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const updatedTask = await Task.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!updatedTask) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Emit real-time status update
        const io = req.app.get('io');
        if (io) {
            io.to(updatedTask.workspace.toString()).emit('task_updated', updatedTask);
        }

        res.status(200).json({ message: 'Task status updated!', updatedTask });
    } catch (error) {
        console.log("Update status error:", error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Delete a Task
exports.deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        const task = await Task.findByIdAndDelete(id);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Emit real-time delete event to socket io safely
        const io = req.app.get('io');
        if (io && task.workspace) {
            io.to(task.workspace.toString()).emit('task_deleted', id);
        }

        res.status(200).json({ message: 'Task deleted successfully!' });
    } catch (error) {
        console.log("Delete task error:", error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};