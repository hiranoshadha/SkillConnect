import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import AppShell from '../components/layout/AppShell';
import PostCard from '../components/ui/PostCard';
import { useAuth } from '../hooks/useAuth';
import { api } from '../utils/api';

const Home = () => {
  const { currentUser, loading } = useAuth();
  const [posts, setPosts] = useState([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch posts when component mounts or user changes
  useEffect(() => {
    if (currentUser) {
      fetchFeed();
    }
  }, [currentUser]);

  const fetchFeed = async () => {
    if (!currentUser) return;
    
    setIsLoadingPosts(true);
    setError(null);
    
    try {
      const feedPosts = await api.loadFeed(currentUser.userId);
      setPosts(feedPosts);
    } catch (err) {
      console.error('Error loading feed:', err);
      setError('Failed to load posts. Please try again.');
    } finally {
      setIsLoadingPosts(false);
    }
  };

  // Handle post updates (likes, comments, etc.)
  const handlePostUpdate = async (postId) => {
    // Refresh the entire feed for simplicity
    // In a more optimized version, you could just update the specific post
    fetchFeed();
  };

  // If still loading, show a loading indicator
  if (loading) {
    return (
      <AppShell>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </AppShell>
    );
  }

  // If not logged in, redirect to login page
  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  const navigateToLearningPlan = () => {
    navigate('/plan');
  };
  
  // Get user's first name for personalized greeting
  const firstName = currentUser.firstName ? currentUser.firstName.split(' ')[0] : 'there';

  return (
    <AppShell>
      <div className="space-y-8">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Welcome back, {firstName}!</h1>
          <p className="text-gray-600 dark:text-gray-300">Ready to continue your learning journey?</p>
          <div className="mt-4 flex space-x-4">
          <button 
              onClick={navigateToLearningPlan}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Continue Learning
            </button>
            {/* <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600">
              Explore New Skills
            </button> */}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Your Feed</h2>
          
          {isLoadingPosts ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          ) : posts.length === 0 ? (
            <div className="p-6 bg-gray-50 dark:bg-slate-700 rounded-lg text-center">
              <p className="text-gray-500 dark:text-gray-400">No posts in your feed yet.</p>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Follow other users or create your first post!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {posts.map(post => (
                <PostCard 
                  key={post.postId} 
                  post={post} 
                  onPostUpdate={handlePostUpdate} 
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
};

export default Home;
