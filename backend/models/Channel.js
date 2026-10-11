const mongoose = require('mongoose');

const channelSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true, 
        trim: true 
    },
    workspace: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Workspace', 
        required: true 
    },
    createdBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    }
}, {
    timestamps: true
});

// Workspace aur channel name ka combination unique rakhne ke liye
channelSchema.index({ workspace: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Channel', channelSchema);