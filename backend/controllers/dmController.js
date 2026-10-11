const DirectMessage = require('../models/DirectMessage');

// Get direct messages between logged-in user and another user
exports.getDirectMessages = async (req, res) => {
    try {
        const { userId } = req.params; // The other user's ID
        const currentUserId = req.user._id;

        const messages = await DirectMessage.find({
            $or: [
                { sender: currentUserId, recipient: userId },
                { sender: userId, recipient: currentUserId }
            ]
        })
        .populate('sender', 'username email')
        .populate('recipient', 'username email')
        .sort({ createdAt: 1 });

        res.status(200).json(messages);
    } catch (error) {
        console.error('Get DM Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Send a direct message
exports.sendDirectMessage = async (req, res) => {
    try {
        const { recipientId, content } = req.body;
        const senderId = req.user._id;

        if (!content) {
            return res.status(400).json({ message: 'Message content is required' });
        }

        const newDM = new DirectMessage({
            sender: senderId,
            recipient: recipientId,
            content
        });

        await newDM.save();

        const populatedDM = await DirectMessage.findById(newDM._id)
            .populate('sender', 'username email')
            .populate('recipient', 'username email');

        res.status(201).json(populatedDM);
    } catch (error) {
        console.error('Send DM Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};