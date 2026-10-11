const Workspace = require('../models/Workspace');

// Create a new Workspace
exports.createWorkspace = async (req, res) => {
    try {
        const { name, description } = req.body;

        const workspace = new Workspace({
            name,
            description,
            owner: req.user, // Auth middleware se mili userId
            members: [req.user] // Owner automatically pehla member hoga
        });

        await workspace.save();
        res.status(201).json({ message: 'Workspace created successfully!', workspace });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get all workspaces for the logged-in user
exports.getUserWorkspaces = async (req, res) => {
    try {
        const workspaces = await Workspace.find({ members: req.user }).populate('owner', 'username email');
        res.status(200).json(workspaces);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get members of a specific workspace
exports.getWorkspaceMembers = async (req, res) => {
    try {
        const workspace = await Workspace.findById(req.params.id).populate('members', 'username email');
        if (!workspace) {
            return res.status(404).json({ message: 'Workspace not found' });
        }
        res.status(200).json(workspace.members);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};