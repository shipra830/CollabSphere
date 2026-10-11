const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const Message = require('./models/Message');
const messageRoutes = require('./routes/messageRoutes');
const path = require('path');
const dmRoutes = require('./routes/dmRoutes');

// Load env vars
dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Connect to MongoDB Directly
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected Successfully!'))
    .catch((err) => console.log('MongoDB Connection Error:', err));

// Create HTTP server and integrate Socket.io
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Socket.io Connection Logic with Database Save
io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('join_channel', (channelId) => {
        socket.join(channelId);
        console.log(`User joined channel: ${channelId}`);
    });

    socket.on('send_message', async (data) => {
        try {
            // Database me message save karo
            const message = new Message({
                channel: data.channelId || data.channel,
                sender: data.senderId || data.sender,
                content: data.content || '',
                fileUrl: data.fileUrl || ''
            });

            await message.save();

            // Sender details populate karo frontend ke liye
            const populatedMessage = await message.populate('sender', 'username email');

            // Channel ke sabhi users ko real-time bhejo
            io.to(data.channelId || data.channel).emit('receive_message', populatedMessage);

        } catch (error) {
            console.log('Error saving message:', error);
        }
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});

// Define Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/workspaces', require('./routes/workspaceRoutes'));
app.use('/api/channels', require('./routes/channelRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/dms', dmRoutes);

// Root Route
app.get('/', (req, res) => {
    res.send('CollabSphere Backend API is running...');
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});