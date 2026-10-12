import React, { useState, useEffect } from 'react';
import axios from 'axios';
import WorkspaceChat from './WorkspaceChat';
import API_URL from '../api'; // <-- Yeh line yahan add karni hai

export default function Dashboard({ onLogout }) {
  const [workspaces, setWorkspaces] = useState([]);
  const [workspaceName, setWorkspaceName] = useState('');
  const [activeWorkspace, setActiveWorkspace] = useState(null);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('token');

  // Backend se workspaces fetch karne ke liye
  useEffect(() => {
    const fetchWorkspaces = async () => {
      if (!token) {
        onLogout(); // Agar token hi nahi hai toh logout/login page par bhej do
        return;
      }

      try {
       const res = await axios.get(`${API_URL}/api/workspaces`, {
  headers: { Authorization: `Bearer ${token}` }
});
        setWorkspaces(res.data);
      } catch (err) {
        console.error('Error fetching workspaces:', err);
        if (err.response && err.response.status === 401) {
          // Token expire ya invalid ho gaya ho toh logout karwa do
          onLogout();
        }
      }
    };
    fetchWorkspaces();
  }, [token, onLogout]);

  // Naya workspace backend par create karne ke liye
  const handleCreateWorkspace = async (e) => {
    e.preventDefault();
    if (!workspaceName.trim()) return;

    try {
      setLoading(true);
      const res = await axios.post(
  `${API_URL}/api/workspaces`,
  { name: workspaceName, description: 'CollabSphere Team Workspace' },
  { headers: { Authorization: `Bearer ${token}` } }
);

      setWorkspaces([...workspaces, res.data]);
      setWorkspaceName('');
    } catch (err) {
      console.error('Error creating workspace:', err);
      if (err.response && err.response.status === 401) {
        onLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  if (activeWorkspace) {
    return <WorkspaceChat workspace={activeWorkspace} onBack={() => setActiveWorkspace(null)} />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <header className="flex justify-between items-center mb-8 border-b border-gray-700 pb-4">
        <h1 className="text-2xl font-bold tracking-wide">CollabSphere Workspace</h1>
        <button
          onClick={onLogout}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-semibold transition duration-200"
        >
          Logout
        </button>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-lg h-fit">
          <h2 className="text-xl font-semibold mb-4">Create Workspace</h2>
          <form onSubmit={handleCreateWorkspace} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Workspace Name</label>
              <input
                type="text"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                placeholder="e.g., Development Team"
                required
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition duration-200"
            >
              {loading ? 'Creating...' : 'Create Workspace'}
            </button>
          </form>
        </div>

        <div className="md:col-span-2 bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Your Workspaces</h2>
          {workspaces.length === 0 ? (
            <p className="text-gray-400">Abhi koi workspace nahi hai. Naya workspace banakar shuru karein! 🚀</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {workspaces.map((ws) => (
                <div
                  key={ws._id || ws.id}
                  onClick={() => setActiveWorkspace(ws)}
                  className="p-4 bg-gray-700 rounded-lg border border-gray-600 hover:border-indigo-500 transition cursor-pointer"
                >
                  <h3 className="text-lg font-bold text-indigo-300">{ws.name}</h3>
                  <p className="text-sm text-gray-400 mt-1">Click to open chat & channels</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}