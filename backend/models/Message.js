const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    channel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Channel',
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        trim: true,
        default: '' // Text optional ho sakta hai agar user sirf image/file bhej raha ho
    },
    fileUrl: {
        type: String, // Uploaded file ya image ka path/URL store karne ke liye
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Message', messageSchema);