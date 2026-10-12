import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import API_URL from '../api';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const socket = io(API_URL);

const formatDiscordTime = (timestamp) => {
    if (!timestamp) return '';
    const messageDate = new Date(timestamp);
    
    if (isNaN(messageDate.getTime())) {
        return timestamp;
    }
    
    const today = new Date();
    
    // Compare dates (ignoring time) to check if it's today or yesterday
    const isToday = messageDate.toDateString() === today.toDateString();
    
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const isYesterday = messageDate.toDateString() === yesterday.toDateString();
    
    // Correct local time formatting for IST
    const timeString = messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    
    if (isToday) {
        return timeString; // e.g. "05:40 PM"
    } else if (isYesterday) {
        return `Yesterday at ${timeString}`;
    } else {
        return messageDate.toLocaleDateString(); // e.g. "10/08/2026"
    }
};

export default function WorkspaceChat({ workspace, onBack }) {
  const wsId = workspace._id || workspace.id;

  const [activeTab, setActiveTab] = useState('chat');
  const [channels, setChannels] = useState([]);
  const [activeChannel, setActiveChannel] = useState(null);
  
  // --- DM States ---
  const [members, setMembers] = useState([]);
  const [activeDMUser, setActiveDMUser] = useState(null); // Agar koi member select hai toh DM mode on

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newChannelName, setNewChannelName] = useState('');

  // Fetch Messages (Channel messages or DM messages)
  useEffect(() => {
    const fetchMessages = async () => {
      const token = localStorage.getItem('token');
      try {
        if (activeDMUser) {
          // Fetch Direct Messages
         const response = await axios.get(`${API_URL}/api/dms/${activeDMUsr._id}`, {
  headers: { Authorization: `Bearer ${token}` }
});
          if (response.data) {
            const formattedDMs = response.data.map(msg => ({
              id: msg._id,
              sender: msg.sender?.username || 'User',
              content: msg.content || '',
              fileUrl: msg.fileUrl || '',
              time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }));
            setMessages(formattedDMs);
          }
        } else if (activeChannel && activeChannel._id) {
          // Fetch Channel Messages
        const response = await axios.get(`${API_URL}/api/messages/${activeChannel._id}`, {
  headers: { Authorization: `Bearer ${token}` }
});
          if (response.data) {
            const formattedMsgs = response.data.map(msg => ({
              id: msg._id,
              sender: msg.sender?.username || msg.sender || 'User',
              content: msg.content || msg.text || '',
              fileUrl: msg.fileUrl || '',
              time: msg.createdAt 
                ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : ''
            }));
            setMessages(formattedMsgs);
          }
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, [activeChannel, activeDMUser]);

  // Fetch Tasks from MongoDB
  useEffect(() => {
    const fetchDatabaseTasks = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/api/tasks?workspaceId=${wsId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data) {
          const formattedTasks = response.data.map(task => ({
            id: task._id,
            title: task.title,
            status: task.status || 'Pending'
          }));
          setTasks(formattedTasks);
        }
      } catch (error) {
        console.log('Error fetching tasks from database:', error);
      }
    };
    fetchDatabaseTasks();
  }, [wsId]);

  // Fetch Channels
  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/api/channels/${wsId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data && response.data.length > 0) {
          setChannels(response.data);
          setActiveChannel(response.data[0]);
        }
      } catch (error) {
        console.log('Error fetching channels:', error);
      }
    };
    fetchChannels();
  }, [wsId]);

  // Fetch Members
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/api/workspaces/${wsId}/members`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data) {
          setMembers(response.data);
        }
      } catch (error) {
        console.log('Error fetching members:', error);
      }
    };
    fetchMembers();
  }, [wsId]);

  // Socket.io Listeners
  useEffect(() => {
    if (activeChannel?._id && !activeDMUser) {
      socket.emit('join_channel', activeChannel._id);
    }

    socket.on('receive_message', (data) => {
      if (!activeDMUser) {
        setMessages((prev) => [...prev, {
          id: data._id || Date.now(),
          sender: data.sender ? data.sender.username : 'CollabSphere AI 🤖',
          content: data.content || data.text || '',
          fileUrl: data.fileUrl || '', 
          time: new Date(data.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      }
    });

    socket.on('task_created', (newTask) => {
      setTasks((prevTasks) => {
        const exists = prevTasks.some(t => t.id === newTask._id);
        if (exists) return prevTasks;
        return [...prevTasks, { id: newTask._id, title: newTask.title, status: newTask.status || 'Pending' }];
      });
    });

    socket.on('task_updated', (updatedTask) => {
      setTasks((prevTasks) => 
        prevTasks.map(t => t.id === updatedTask._id ? { ...t, status: updatedTask.status } : t)
      );
    });

    socket.on('task_deleted', (deletedTaskId) => {
      const targetId = deletedTaskId.taskId || deletedTaskId._id || deletedTaskId;
      setTasks((prevTasks) => prevTasks.filter(t => t.id !== targetId));
    });

    return () => {
      socket.off('receive_message');
      socket.off('task_created');
      socket.off('task_updated');
      socket.off('task_deleted');
    };
  }, [wsId, activeChannel?._id, activeDMUser]);

  // Handle Send Message (Channel message or DM)
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !selectedFile) return;

    try {
      const token = localStorage.getItem('token');

      if (activeDMUser) {
        // Send Direct Message
        const response = await axios.post(`${API_URL}/api/dms`, {
          recipientId: activeDMUser._id,
          content: newMessage
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data) {
          setMessages(prev => [...prev, {
            id: response.data._id,
            sender: response.data.sender?.username || 'User',
            content: response.data.content,
            fileUrl: '',
            time: new Date(response.data.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }]);
        }
      } else {
        // Send Channel Message
        const formData = new FormData();
        formData.append('channelID', activeChannel._id);
        formData.append('content', newMessage);
        if (selectedFile) {
          formData.append('file', selectedFile);
        }

        const response = await axios.post(`${API_URL}/api/messages`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.userMessage) {
          setMessages(prev => [...prev, {
            id: response.data.userMessage._id,
            sender: response.data.userMessage.sender?.username || 'User',
            content: response.data.userMessage.content,
            fileUrl: response.data.userMessage.fileUrl || '',
            time: new Date(response.data.userMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }]);
        }

        if (response.data.aiMessage) {
          setMessages(prev => [...prev, {
            id: response.data.aiMessage._id,
            sender: response.data.aiMessage.sender.username,
            content: response.data.aiMessage.content,
            fileUrl: '',
            time: new Date(response.data.aiMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }]);
        }
      }

      setNewMessage('');
      setSelectedFile(null);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/api/tasks`, {
        title: newTaskTitle,
        workspaceId: wsId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const newTask = response.data.task || response.data;
      setTasks([...tasks, { id: newTask._id || Date.now(), title: newTask.title, status: newTask.status || 'Pending' }]);
      setNewTaskTitle('');
    } catch (error) {
      console.log('Error adding task:', error);
    }
  };

  const handleCreateChannel = async (e) => {
    e.preventDefault();
    if (!newChannelName.trim()) return;
    const channelExists = channels.some(ch => ch.name.toLowerCase() === newChannelName.trim().toLowerCase());
    if (channelExists) {
      alert("Is naam ka channel pehle se bana hua hai!");
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/api/channels`, {
        name: newChannelName,
        workspaceId: wsId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const newChannel = response.data.channel || response.data;
      setChannels([...channels, newChannel]);
      setActiveChannel(newChannel);
      setActiveDMUser(null);
      setNewChannelName('');
      socket.emit('join_channel', newChannel._id);
    } catch (error) {
      console.log('Error creating channel:', error);
    }
  };

  const handleDeleteTask = async (id) => {
    if (!id) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(tasks.filter(t => t.id !== id));
    } catch (error) {
      console.log('Error deleting task:', error);
    }
  };

  const toggleTaskStatus = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const taskToToggle = tasks.find(t => t.id === id);
      const newStatus = taskToToggle.status === 'Pending' ? 'Completed' : 'Pending';
      await axios.patch(`${API_URL}/api/tasks/${id}/status`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(tasks.map(t => t.id === id ? { ...t, status: newStatus } : t));
    } catch (error) {
      console.log('Error updating task status:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Top Navbar */}
      <header className="flex justify-between items-center px-6 py-4 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center space-x-4">
          <button onClick={onBack} className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition">
            ← Back
          </button>
          <h1 className="text-xl font-bold text-indigo-400">
            {activeDMUser ? `💬 DM with ${activeDMUser.username}` : `# ${workspace.name}`}
          </h1>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-gray-900 p-1 rounded-lg border border-gray-700">
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${activeTab === 'chat' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            💬 Chat
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${activeTab === 'tasks' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            📋 Tasks
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex max-w-6xl w-full mx-auto p-6 gap-6">
        
        {/* Left Sidebar: Channels & Members List */}
        <div className="w-64 bg-gray-800 rounded-lg p-4 border border-gray-700 flex flex-col">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Channels</h2>
          
          <div className="flex-1 overflow-y-auto space-y-1 mb-4">
            {channels.map((chan) => (
              <button
                key={chan._id}
                onClick={() => {
                  setActiveChannel(chan);
                  setActiveDMUser(null);
                }}
                className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition ${!activeDMUser && activeChannel?._id === chan._id ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
              >
                # {chan.name}
              </button>
            ))}
          </div>

          <div className="mt-2">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Direct Messages</h3>
            <ul className="space-y-1 max-h-40 overflow-y-auto">
              {members.map((member) => (
                <li key={member._id}>
                  <button
                    onClick={() => {
                      setActiveDMUser(member);
                      setActiveChannel(null);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-md text-sm flex items-center space-x-2 transition ${activeDMUser?._id === member._id ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
                  >
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span className="truncate">{member.username}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Create Channel Form */}
          <form onSubmit={handleCreateChannel} className="space-y-2 pt-3 mt-3 border-t border-gray-700">
            <input
              type="text"
              value={newChannelName}
              onChange={(e) => setNewChannelName(e.target.value)}
              placeholder="New channel name..."
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
            />
            <button type="submit" className="w-full py-2 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg text-sm transition">
              + Add Channel
            </button>
          </form>
        </div>

        {/* Right Side: Chat & Tasks View Container */}
        <div className="flex-1 flex flex-col">
          {activeTab === 'chat' ? (
            /* --- CHAT VIEW --- */
            <>
              <div className="flex-1 bg-gray-800 rounded-lg p-4 border border-gray-700 overflow-y-auto space-y-4 mb-4 max-h-[60vh]">
                {messages.length === 0 ? (
                  <p className="text-gray-400 text-center py-10">Abhi koi message nahi hai. Baat shuru karein!</p>
                ) : (
                  messages.map((msg) => (
                    <div key={msg.id || Math.random()} className="p-3 bg-gray-700/50 rounded-lg border border-gray-600 flex justify-between items-start">
                      <div>
                        <span className="text-xs font-bold text-indigo-300 block mb-1">
                          {typeof msg.sender === 'object' ? msg.sender?.username : (msg.sender || 'User')}
                        </span>
                        {msg.content && (
  msg.content.includes('```') ? (
   <SyntaxHighlighter className="rounded-md text-xs my-2" language="javascript" style={vscDarkPlus}>
      {msg.content.replace(/```[a-z]*\n?/g, '').replace(/```/g, '')}
    </SyntaxHighlighter>
  ) : (
    <p className="text-gray-200 text-sm mb-2">{msg.content}</p>
  )
)}
                        {msg.fileUrl && (
                          <img 
                            src={`${API_URL}/uploads/${msg.fileUrl.replace(/\\/g, '/').split('/').pop()}`}
                            alt="attachment" 
                            className="max-w-[200px] max-h-[200px] rounded-lg mt-1 object-cover border border-gray-600" 
                          />
                        )}
                      </div>
                    <span className="text-[10px] text-gray-400 ml-4 mt-1">
    {formatDiscordTime(msg.createdAt || msg.time)}
</span>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                {!activeDMUser && (
                  <input 
                    type="file" 
                    onChange={(e) => setSelectedFile(e.target.files[0])} 
                    className="text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-700 file:text-white hover:file:bg-gray-600 cursor-pointer"
                  />
                )}
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={activeDMUser ? `Message ${activeDMUser.username}...` : `Message #${activeChannel?.name || workspace.name}...`}
                  className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                />
                <button type="submit" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition">
                  Send
                </button>
              </form>
            </>
          ) : (
            /* --- TASKS VIEW --- */
            <>
              <div className="flex-1 bg-gray-800 rounded-lg p-4 border border-gray-700 overflow-y-auto space-y-3 mb-4 max-h-[60vh]">
                {tasks.length === 0 ? (
                  <p className="text-gray-400 text-center">Koi task nahi hai. Naya task add karein!</p>
                ) : (
                  tasks.map((task) => (
                    <div key={task.id} className="p-3 bg-gray-700/50 rounded-lg border border-gray-600 flex justify-between items-center">
                      <span className={`text-sm ${task.status === 'Completed' ? 'line-through text-gray-400' : 'text-gray-200'}`}>
                        {task.title}
                      </span>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => toggleTaskStatus(task.id)}
                          className={`px-3 py-1 rounded-md text-xs font-semibold transition ${task.status === 'Completed' ? 'bg-green-600/20 text-green-400 border border-green-600/50' : 'bg-yellow-600/20 text-yellow-400 border border-yellow-600/50'}`}
                        >
                          {task.status}
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="px-2.5 py-1 bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-600/50 rounded-md text-xs font-semibold transition"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleAddTask} className="flex gap-2">
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Add a new task..."
                  className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                />
                <button type="submit" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition">
                  Add Task
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}