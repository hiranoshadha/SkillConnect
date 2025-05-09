import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppShell from '../components/layout/AppShell';
import PostCard from '../components/ui/PostCard';
import { useAuth } from '../hooks/useAuth';
import { api } from '../utils/api';

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      setError(null);
      try {
        const userData = await api.getUserById(parseInt(userId));
        setUser(userData);

        const posts = await api.getUserPosts(parseInt(userId));
        setUserPosts(posts);

        if (currentUser) {
          try {
            const following = await api.isFollowing(currentUser.userId, parseInt(userId));
            setIsFollowing(following);
          } catch {
            setIsFollowing(false);
          }
        }

        try {
          setFollowerCount(await api.getFollowerCount(parseInt(userId)));
        } catch {
          setFollowerCount(0);
        }

        try {
          setFollowingCount(await api.getFollowingCount(parseInt(userId)));
        } catch {
          setFollowingCount(0);
        }
      } catch (err) {
        setError(err.message || 'Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetchUserData();
  }, [userId, currentUser]);

  const handleFollow = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    try {
      if (isFollowing) {
        await api.unfollowUser(currentUser.userId, parseInt(userId));
        setFollowerCount(prev => prev - 1);
      } else {
        await api.followUser(currentUser.userId, parseInt(userId));
        setFollowerCount(prev => prev + 1);
      }
      setIsFollowing(!isFollowing);
    } catch {
      alert('Failed to follow/unfollow user. Please try again.');
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

  if (error || !user) {
    return (
      <AppShell>
        <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-700 shadow">
          {error || 'User not found'}
        </div>
      </AppShell>
    );
  }

  const defaultProfileImage = "/assets/images/default-avatar.png";

  return (
    <AppShell>
      <div className="space-y-10">
        {/* Profile Header with Glassmorphism and Gradient */}
        <div className="relative">
          <div className="h-52 w-full rounded-3xl bg-gradient-to-r from-blue-400/90 via-indigo-500/80 to-pink-400/80 shadow-xl mb-16 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent pointer-events-none"></div>
          </div>
          <img
            src={user.profileImage || defaultProfileImage}
            alt={`${user.firstName || 'User'} ${user.lastName || ''}`}
            className="absolute bottom-0 left-8 transform translate-y-1/2 w-28 h-28 rounded-full border-4 border-white dark:border-slate-900 object-cover shadow-xl transition-transform duration-300 hover:scale-105"
            onError={e => {
              e.target.onerror = null;
              e.target.src = defaultProfileImage;
            }}
          />
        </div>

        {/* User Info Card */}
        <div className="relative z-10 -mt-10 px-8">
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg rounded-3xl shadow-xl p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-1">
                {user.firstName} {user.lastName}
              </h1>
              <p className="text-base text-gray-500 dark:text-gray-400 mb-2">@{user.username}</p>
              <p className="text-gray-700 dark:text-gray-300">{user.bio || 'No bio available'}</p>
              {currentUser && currentUser.userId !== parseInt(userId) && (
                <div className="mt-4">
                  <button
                    onClick={handleFollow}
                    className={`px-6 py-2 rounded-xl font-semibold shadow transition-all duration-200 focus:outline-none ${
                      isFollowing
                        ? 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600'
                        : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700'
                    }`}
                  >
                    {isFollowing ? 'Unfollow' : 'Follow'}
                  </button>
                </div>
              )}
            </div>
            {/* Social Stats */}
            <div className="flex space-x-8 justify-center">
              <div className="text-center">
                <span className="block text-2xl font-bold text-blue-700 dark:text-blue-300">{followerCount}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">Followers</span>
              </div>
              <div className="text-center">
                <span className="block text-2xl font-bold text-indigo-700 dark:text-indigo-300">{followingCount}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">Following</span>
              </div>
              <div className="text-center">
                <span className="block text-2xl font-bold text-pink-700 dark:text-pink-300">{userPosts.length || 0}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">Posts</span>
              </div>
            </div>
          </div>
        </div>

        {/* Posts Section */}
        <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Posts</h2>
          {userPosts.length === 0 ? (
            <div className="p-8 bg-gray-50 dark:bg-slate-800/60 rounded-2xl text-center shadow">
              <p className="text-gray-500 dark:text-gray-400 text-lg">This user hasn't created any posts yet.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {userPosts.map(post => (
                <div key={post.postId} className="relative">
                  <PostCard post={post} onPostUpdate={() => {}} />
                </div>
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

export default UserProfile;
