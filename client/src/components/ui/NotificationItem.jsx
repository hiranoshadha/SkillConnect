import React from 'react';
import { CheckIcon, TrashIcon } from '@heroicons/react/outline';
import { formatDistanceToNow } from 'date-fns';

const NotificationItem = ({ notification, onMarkAsRead, onDelete }) => {
  // Format the timestamp
  const formatTimestamp = (timestamp) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (err) {
      return 'some time ago';
    }
  };

  return (
    <div 
      className={`p-4 flex items-start ${!notification.isRead ? 'bg-blue-50 dark:bg-blue-900/30' : ''}`}
    >
      <div className="flex-shrink-0 mr-4">
        <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
          {/* Icon based on notification type could be added here */}
          <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900 dark:text-white">
          {notification.content}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {formatTimestamp(notification.createdAt)}
        </p>
      </div>
      <div className="ml-4 flex-shrink-0 flex space-x-2">
        {!notification.isRead && (
          <button
            onClick={() => onMarkAsRead(notification.notificationId)}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            title="Mark as read"
          >
            <CheckIcon className="h-5 w-5" />
          </button>
        )}
        <button
          onClick={() => onDelete(notification.notificationId)}
          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
          title="Delete notification"
        >
          <TrashIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default NotificationItem;
