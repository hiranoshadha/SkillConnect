import React, { useState, useEffect } from 'react';
import AppShell from '../components/layout/AppShell';
import { api } from '../utils/api';
import { useAuth } from '../hooks/useAuth';

const Announcements = () => {
  const { currentUser } = useAuth();
  const [adminMessages, setAdminMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAdminMessages();
  }, []);

  const fetchAdminMessages = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const messages = await api.getAdminMessages();
      setAdminMessages(messages);
    } catch (err) {
      console.error('Error fetching admin messages:', err);
      setError('Failed to load announcements. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Announcements</h1>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        ) : adminMessages.length === 0 ? (
          <div className="p-6 bg-gray-50 dark:bg-slate-700 rounded-lg text-center">
            <p className="text-gray-500 dark:text-gray-400">No announcements at this time.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {adminMessages.map(message => (
              <div key={message.messageId} className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
                <div className="bg-blue-50 dark:bg-blue-900/20 px-4 py-3 border-l-4 border-blue-500">
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">{message.title}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(message.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="p-4">
                  <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {message.content}
                  </div>
                  
                  {currentUser && currentUser.role === 'ADMIN' && (
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={() => window.location.href = '/admin'}
                        className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        Manage Announcements
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default Announcements;
