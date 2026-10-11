const Channel = require('../models/Channel');

// Create a new Channel in a Workspace
exports.createChannel = async (req, res) => {
    try {
        const { name, workspaceId } = req.body;

        const channel = new Channel({
            name,
            workspace: workspaceId,
            createdBy: req.user // Auth middleware se mili hui logged-in user ki ID
        });

        await channel.save();
        res.status(201).json({ message: 'Channel created successfully!', channel });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get all channels for a specific workspace
exports.getWorkspaceChannels = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const channels = await Channel.find({ workspace: workspaceId }).populate('createdBy', 'username email');
        res.status(200).json(channels);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};