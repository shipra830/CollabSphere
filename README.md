# 🚀 CollabSphere

CollabSphere is a real-time full-stack web workspace application designed for seamless team collaboration, featuring multi-channel messaging, real-time communication, task management, and an integrated Google Gemini AI assistant.

---

## ✨ Features

- Real-Time Workspace Chat: Multi-channel messaging and direct messaging powered by Socket.IO.
- Task Management: Create, assign, update, and manage workspace tasks efficiently.
- AI Assistant Integration: Built-in AI query support powered by the Google Gemini API to help teams get instant insights.
- Secure Authentication: User registration and secure login using JSON Web Tokens and hashed passwords.
- Media Uploads: Seamless file and image sharing capabilities using Multer.

---

## 🛠️ Tech Stack

### Frontend
- React.js / Vite
- Tailwind CSS for modern UI design
- Axios for API requests
- Socket.IO-client for real-time events

### Backend
- Node.js & Express.js REST API
- MongoDB & Mongoose for database management
- Socket.IO for real-time WebSocket communication
- Google Gemini API for AI features

---
```text
## 📂 Project Structure

CollabSphere/
├── backend/
│   ├── controllers/   # Route logic & business logic
│   ├── middleware/    # Auth & file upload middlewares
│   ├── models/        # Mongoose database schemas
│   ├── routes/        # Express API endpoints
│   ├── uploads/       # Uploaded media assets
│   └── server.js      # App entry point
└── frontend/
    ├── public/        # Static assets & icons
    ├── src/
    │   ├── components/# Reusable UI components (Auth, Dashboard, Chat)
    │   ├── App.jsx    # Main component
    │   └── main.jsx   # React entry point
    └── package.json
```
---

## ⚙️ Getting Started & Installation

To run this project locally, follow these steps:

### 1. Clone the Repository
git clone https://github.com/shipra830/CollabSphere.git
cd CollabSphere

### 2. Setup Backend
cd backend
npm install

Create a .env file inside the backend/ directory and add your credentials:
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
GEMINI_API_KEY=your_google_gemini_api_key

Start the backend server:
npm run dev

### 3. Setup Frontend
Open a new terminal window and navigate to the frontend directory:
cd frontend
npm install
npm run dev

---

## 💡 Author
Shipra Pareek  
GitHub: @shipra830
