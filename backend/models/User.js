const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: true, 
        trim: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true, 
        lowercase: true,
        trim: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    avatar: { 
        type: String, 
        default: '' 
    }
}, {
    timestamps: true // Yeh automatically bata deta hai ki user kab bana (createdAt, updatedAt)
});

module.exports = mongoose.model('User', userSchema);