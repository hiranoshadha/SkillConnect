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

  useEffect(() => {
    if (currentUser) {
      fetchFeed();
    }
    // eslint-disable-next-line
  }, [currentUser]);

  const fetchFeed = async () => {
    if (!currentUser) return;
    setIsLoadingPosts(true);
    setError(null);
    try {
      const feedPosts = await api.loadFeed(currentUser.userId);
      setPosts(feedPosts);
    } catch (err) {
      setError('Failed to load posts. Please try again.');
    } finally {
      setIsLoadingPosts(false);
    }
  };

  // Updated handlePostUpdate to only update the specific post
  const handlePostUpdate = async (postId) => {
    try {
      // Fetch the updated post data
      const updatedPost = await api.getPostById(postId);
      // Fetch comments for the post
      const comments = await api.getComments(postId);
      updatedPost.comments = comments;
      
      // Update only the specific post in the state
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.postId === postId ? updatedPost : post
        )
      );
    } catch (error) {
      console.error('Error updating post data:', error);
    }
  };

  if (loading) {
    return (
      <AppShell>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-b-4 border-blue-400 border-opacity-60"></div>
        </div>
      </AppShell>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  const navigateToLearningPlan = () => {
    navigate('/plan');
  };

  const firstName = currentUser.firstName ? currentUser.firstName.split(' ')[0] : 'there';

  return (
    <AppShell>
      <div className="space-y-10">
        {/* Welcome Card */}
        <div className="relative overflow-hidden rounded-3xl shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border border-blue-100 dark:border-slate-800 p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Animated Gradient Circle */}
          <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-gradient-to-br from-blue-400/30 via-indigo-400/20 to-pink-400/10 blur-2xl z-0"></div>
          <div className="relative z-10 flex-1">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-2">
              Welcome back,&nbsp;
              <span className="bg-gradient-to-r from-blue-500 via-indigo-500 to-pink-400 bg-clip-text text-transparent animate-gradient">
                {firstName}!
              </span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Ready to continue your learning journey?
            </p>
            <div className="mt-6 flex space-x-4">
              <button
                onClick={navigateToLearningPlan}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-2xl shadow-lg hover:from-blue-600 hover:to-indigo-700 hover:scale-105 transition-all duration-200"
              >
                Continue Learning
              </button>
            </div>
          </div>
          {/* Decorative SVG or Illustration */}
          <div className="hidden sm:block relative z-10">
            <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
              <circle cx="60" cy="60" r="54" stroke="url(#paint0)" strokeWidth="12" />
              <defs>
                <linearGradient id="paint0" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#3B82F6" />
                  <stop offset="1" stopColor="#A78BFA" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Feed Card */}
        <div className="relative overflow-hidden rounded-3xl shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border border-blue-100 dark:border-slate-800 p-8">
          {/* Animated Gradient Circle */}
          <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-gradient-to-br from-pink-400/20 via-indigo-400/10 to-blue-400/10 blur-2xl z-0"></div>
          <h2 className="relative z-10 text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Your Feed
          </h2>
          {isLoadingPosts ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-blue-400 border-opacity-60"></div>
            </div>
          ) : error ? (
            <div className="relative z-10 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 shadow">
              {error}
            </div>
          ) : posts.length === 0 ? (
            <div className="relative z-10 p-8 bg-gray-50 dark:bg-slate-800/60 rounded-xl text-center shadow">
              <p className="text-gray-500 dark:text-gray-400 text-lg mb-1">No posts in your feed yet.</p>
              <p className="text-gray-500 dark:text-gray-400">Follow other users or create your first post!</p>
            </div>
          ) : (
            <div className="relative z-10 space-y-7">
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
      <style>{`
        @keyframes gradient {
          0%,100% { background-position: 0% 50% }
          50% { background-position: 100% 50% }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease-in-out infinite;
        }
      `}</style>
    </AppShell>
  );
};

export default Home;
