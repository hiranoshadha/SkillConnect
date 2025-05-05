import React, { useState } from 'react';
import AppShell from '../components/layout/AppShell';
import PostCard from '../components/ui/PostCard';
import { dummyPosts } from '../data/dummyPosts';
import { dummyUsers } from '../data/dummyUsers';

const Discover = () => {
  const [activeTab, setActiveTab] = useState('trending');
  
  const tabs = [
    { id: 'trending', label: 'Trending' },
    { id: 'latest', label: 'Latest' },
    { id: 'following', label: 'Following' },
    { id: 'people', label: 'People to Follow' }
  ];
  
  return (
    <AppShell>
      <div className="space-y-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Discover</h1>
          
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
                </button>
              ))}
            </nav>
          </div>
        </div>
        
        {activeTab === 'people' ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">People you might be interested in</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dummyUsers.map(user => (
                <div key={user.id} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center space-x-4">
                    <img src={user.avatar} alt={user.name} className="h-16 w-16 rounded-full" />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.name}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.bio}</p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {user.skills.slice(0, 3).map((skill, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-between items-center">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      <span>{user.followers} followers</span>
                    </div>
                    <button className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-full hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 transition-colors duration-200">
                      Follow
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {dummyPosts.map(post => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default Discover;
