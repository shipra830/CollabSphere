const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: true, 
        trim: true 
    },
    description: { 
        type: String, 
        trim: true 
    },
    status: { 
        type: String, 
        enum: ['Todo', 'In Progress', 'Done'], 
        default: 'Todo' 
    },
    workspace: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Workspace', 
        required: true 
    },
    assignedTo: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    },
    createdBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Task', taskSchema);