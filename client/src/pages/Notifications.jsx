import React, { useState, useEffect } from 'react';
import { BellIcon, CheckIcon, TrashIcon } from '@heroicons/react/outline';
import AppShell from '../components/layout/AppShell';
import { api } from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';
import NotificationItem from '../components/ui/NotificationItem';

const Notifications = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();
  
  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'unread', label: 'Unread' }
  ];

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!currentUser) return;
    
    setIsLoading(true);
    try {
      let data;
      if (activeTab === 'unread') {
        data = await api.getUnreadNotifications(currentUser.userId);
      } else {
        data = await api.getNotifications(currentUser.userId);
      }
      setNotifications(data);
      
      // Get unread count for the badge
      const unreadData = await api.getUnreadNotifications(currentUser.userId);
      setUnreadCount(unreadData.length);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch and when tab changes
  useEffect(() => {
    fetchNotifications();
  }, [currentUser, activeTab]);

  // Mark a notification as read
  const handleMarkAsRead = async (notificationId) => {
    try {
      await api.markNotificationAsRead(notificationId);
      // Update the notification in the UI
      setNotifications(notifications.map(notification => 
        notification.notificationId === notificationId 
          ? { ...notification, isRead: true } 
          : notification
      ));
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  // Mark all notifications as read
  const handleMarkAllAsRead = async () => {
    if (!currentUser) return;
    
    try {
      await api.markAllNotificationsAsRead(currentUser.userId);
      // Update all notifications in the UI
      setNotifications(notifications.map(notification => ({ ...notification, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  // Delete a notification
  const handleDeleteNotification = async (notificationId) => {
    try {
      await api.deleteNotification(notificationId);
      // Remove the notification from the UI
      setNotifications(notifications.filter(
        notification => notification.notificationId !== notificationId
      ));
      // Update unread count if needed
      const deletedNotification = notifications.find(n => n.notificationId === notificationId);
      if (deletedNotification && !deletedNotification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  // Delete all notifications
  const handleDeleteAllNotifications = async () => {
    if (!currentUser || !window.confirm('Are you sure you want to delete all notifications?')) return;
    
    try {
      await api.deleteAllNotifications(currentUser.userId);
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.error('Error deleting all notifications:', err);
    }
  };

  // Format the timestamp
  const formatTimestamp = (timestamp) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (err) {
      return 'some time ago';
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
            <div className="flex space-x-2">
              <button 
                onClick={handleMarkAllAsRead}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200 dark:text-blue-400 dark:bg-blue-900/30 dark:hover:bg-blue-800/40"
                disabled={unreadCount === 0}
              >
                <CheckIcon className="h-4 w-4 mr-1" />
                Mark all as read
              </button>
              <button 
                onClick={handleDeleteAllNotifications}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md text-red-600 bg-red-100 hover:bg-red-200 dark:text-red-400 dark:bg-red-900/30 dark:hover:bg-red-800/40"
                disabled={notifications.length === 0}
              >
                <TrashIcon className="h-4 w-4 mr-1" />
                Delete all
              </button>
            </div>
          </div>

          <div className="border-b border-gray-200 dark:border-slate-700">
            <nav className="-mb-px flex space-x-8">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm
                    ${activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'}
                  `}
                >
                  {tab.label}
                  {tab.id === 'unread' && unreadCount > 0 && (
                    <span className="ml-2 bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-0.5 rounded-full text-xs">
                      {unreadCount}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md overflow-hidden">
          {isLoading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-500 dark:text-gray-400">Loading notifications...</p>
            </div>
          ) : error ? (
            <div className="p-6 text-center text-red-500">
              <p>{error}</p>
            </div>
          ) : notifications.length > 0 ? (
            <div className="divide-y divide-gray-200 dark:divide-slate-700">
              {notifications.map(notification => (
                <NotificationItem 
                  key={notification.notificationId} 
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                  onDelete={handleDeleteNotification}
                />
              ))}
            </div>
          ) : (
            <div className="p-6 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No notifications</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">You're all caught up!</p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
};

export default Notifications;
