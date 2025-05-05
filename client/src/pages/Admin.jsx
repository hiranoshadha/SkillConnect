import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import AppShell from '../components/layout/AppShell';
import { useAuth } from '../hooks/useAuth';
import { api } from '../utils/api';
import { XIcon, PencilIcon, TrashIcon } from '@heroicons/react/outline';

const Admin = () => {
  const { currentUser, loading } = useAuth();
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [adminMessages, setAdminMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [showMessageModal, setShowMessageModal] = useState(false);

  console.log('Current User:', currentUser);

  //Fetch users and admin messages when component mounts
  useEffect(() => {
    if (currentUser && currentUser.role === 'ADMIN') {
      fetchUsers();
      fetchAdminMessages();
    }
  }, [currentUser]);

  const fetchUsers = async () => {
    try {
      const fetchedUsers = await api.getUsers();
      setUsers(fetchedUsers);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users. Please try again.');
    }
  };

  const fetchAdminMessages = async () => {
    setIsLoading(true);
    try {
      const messages = await api.getAdminMessages();
      setAdminMessages(messages);
    } catch (err) {
      console.error('Error fetching admin messages:', err);
      setError('Failed to load admin messages. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();
    
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) {
      alert('Please provide both a title and message content.');
      return;
    }
    
    try {
      const messageData = {
        admin: { userId: currentUser.userId },
        title: broadcastTitle,
        content: broadcastMessage
      };
      
      await api.createAdminMessage(messageData);
      
      // Reset form
      setBroadcastTitle('');
      setBroadcastMessage('');
      
      // Refresh messages
      fetchAdminMessages();
      
      alert('Broadcast message sent successfully!');
    } catch (err) {
      console.error('Error sending broadcast message:', err);
      alert('Failed to send broadcast message. Please try again.');
    }
  };

  const handleEditMessage = (message) => {
    setEditingMessage(message);
    setBroadcastTitle(message.title);
    setBroadcastMessage(message.content);
    setShowMessageModal(true);
  };

  const handleUpdateMessage = async (e) => {
    e.preventDefault();
    
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) {
      alert('Please provide both a title and message content.');
      return;
    }
    
    try {
      const messageData = {
        ...editingMessage,
        title: broadcastTitle,
        content: broadcastMessage
      };
      
      await api.updateAdminMessage(messageData);
      
      // Reset form and close modal
      setBroadcastTitle('');
      setBroadcastMessage('');
      setEditingMessage(null);
      setShowMessageModal(false);
      
      // Refresh messages
      fetchAdminMessages();
      
      alert('Message updated successfully!');
    } catch (err) {
      console.error('Error updating message:', err);
      alert('Failed to update message. Please try again.');
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    
    try {
      await api.deleteAdminMessage(messageId);
      
      // Refresh messages
      fetchAdminMessages();
      
      alert('Message deleted successfully!');
    } catch (err) {
      console.error('Error deleting message:', err);
      alert('Failed to delete message. Please try again.');
    }
  };

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Show loading state while authentication is being checked
  if (loading) {
    return (
      <AppShell>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </AppShell>
    );
  }
  
  // // Redirect if not admin
  // if (!currentUser || currentUser.role !== 'ADMIN') {
  //   return <Navigate to="/" />;
  // }

  return (
    <AppShell>
      <div className="space-y-8">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">Manage users and system settings</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 flex items-center">
              <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-3 mr-4">
                <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Total Users</h3>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{users.length}</p>
              </div>
            </div>
            
            {/* <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 flex items-center">
              <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-3 mr-4">
                <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Active Plans</h3>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">12</p>
              </div>
            </div> */}
            
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-6 flex items-center">
              <div className="rounded-full bg-purple-100 dark:bg-purple-900/30 p-3 mr-4">
                <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Broadcasts</h3>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{adminMessages.length}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Broadcast Message</h2>
          <form onSubmit={handleBroadcast}>
            <div className="mb-4">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title
              </label>
              <input
                type="text"
                id="title"
                value={broadcastTitle}
                onChange={(e) => setBroadcastTitle(e.target.value)}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                placeholder="Enter a title for your broadcast..."
              />
            </div>
            <div className="mb-4">
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Message
              </label>
              <textarea
                id="message"
                rows={3}
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                placeholder="Enter a message to broadcast to all users..."
              ></textarea>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!broadcastTitle.trim() || !broadcastMessage.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send Broadcast
              </button>
            </div>
          </form>
        </div>
        
        {/* Admin Messages Section */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Broadcast History</h2>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          ) : adminMessages.length === 0 ? (
            <div className="p-4 bg-gray-50 dark:bg-slate-700 rounded-lg text-center">
              <p className="text-gray-500 dark:text-gray-400">No broadcast messages yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {adminMessages.map(message => (
                <div key={message.messageId} className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">{message.title}</h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {new Date(message.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditMessage(message)}
                        className="p-1.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200 dark:bg-slate-600 dark:text-white dark:hover:bg-slate-500"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteMessage(message.messageId)}
                        className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors duration-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                      >
                                                <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {message.content}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">User Management</h2>
          
          <div className="mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
              placeholder="Search users by name or email..."
            />
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
              <thead className="bg-gray-50 dark:bg-slate-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Role
                  </th>
                  {/* <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th> */}
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                {filteredUsers.map(user => (
                  <tr key={user.userId}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-slate-600 flex items-center justify-center">
                          {user.profileImage ? (
                            <img src={user.profileImage} alt={user.name} className="h-10 w-10 rounded-full" />
                          ) : (
                            <span className="text-gray-500 dark:text-gray-400">{user.firstName?.charAt(0)}</span>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            @{user.username}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">{user.role}</div>
                        
                        
                        
                    </td>
                    {/* <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.active ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {user.active ? 'Active' : 'Inactive'}
                      </span>
                    </td> */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <button
                        onClick={async () => {
                          try {
                            // Toggle user active status
                            await api.updateUserProfile({
                              ...user,
                              active: !user.active
                            });
                            fetchUsers(); // Refresh user list
                          } catch (err) {
                            console.error('Error updating user status:', err);
                            alert('Failed to update user status. Please try again.');
                          }
                        }}
                        className={`px-3 py-1 rounded-md ${
                          user.active 
                            ? 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50' 
                            : 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50'
                        }`}
                      >
                        {user.active ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Edit Message Modal */}
      {showMessageModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white dark:bg-slate-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="absolute top-0 right-0 pt-4 pr-4">
                <button
                  onClick={() => {
                    setShowMessageModal(false);
                    setEditingMessage(null);
                    setBroadcastTitle('');
                    setBroadcastMessage('');
                  }}
                  className="text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-200 focus:outline-none"
                >
                  <XIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">Edit Broadcast Message</h3>
                
                <form onSubmit={handleUpdateMessage}>
                  <div className="mb-4">
                    <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      id="edit-title"
                      value={broadcastTitle}
                      onChange={(e) => setBroadcastTitle(e.target.value)}
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                      placeholder="Enter a title for your broadcast..."
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="edit-message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Message
                    </label>
                    <textarea
                      id="edit-message"
                      rows={3}
                      value={broadcastMessage}
                      onChange={(e) => setBroadcastMessage(e.target.value)}
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                      placeholder="Enter a message to broadcast to all users..."
                    ></textarea>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setShowMessageModal(false);
                        setEditingMessage(null);
                        setBroadcastTitle('');
                        setBroadcastMessage('');
                      }}
                      className="mr-3 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!broadcastTitle.trim() || !broadcastMessage.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Update Message
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
};

export default Admin;

