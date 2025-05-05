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
        // Fetch user profile
        const userData = await api.getUserById(parseInt(userId));
        setUser(userData);
        
        // Fetch user posts
        const posts = await api.getUserPosts(parseInt(userId));
        setUserPosts(posts);
        
        // Check if current user is following this user
        if (currentUser) {
          try {
            const following = await api.isFollowing(currentUser.userId, parseInt(userId));
            setIsFollowing(following);
          } catch (followError) {
            console.error('Error checking follow status:', followError);
            // Default to not following if the check fails
            setIsFollowing(false);
          }
        }
        
        // Get follower and following counts
        try {
          const followers = await api.getFollowerCount(parseInt(userId));
          setFollowerCount(followers);
        } catch (countError) {
          console.error('Error fetching follower count:', countError);
          setFollowerCount(0);
        }
        
        try {
          const following = await api.getFollowingCount(parseInt(userId));
          setFollowingCount(following);
        } catch (countError) {
          console.error('Error fetching following count:', countError);
          setFollowingCount(0);
        }
      } catch (err) {
        setError(err.message || 'Failed to load user profile');
        console.error('Error fetching user profile:', err);
      } finally {
        setLoading(false);
      }
    };
    
    if (userId) {
      fetchUserData();
    }
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
    } catch (err) {
      console.error('Error following/unfollowing user:', err);
      alert('Failed to follow/unfollow user. Please try again.');
    }
  };
  
  if (loading) {
    return (
      <AppShell>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </AppShell>
    );
  }
  
  if (error || !user) {
    return (
      <AppShell>
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error || 'User not found'}
        </div>
      </AppShell>
    );
  }
  
  // Default values for missing user properties
  const defaultProfileImage = "/assets/images/default-avatar.png";
  
  return (
    <AppShell>
      <div className="space-y-8">
        <div className="relative">
          <div className="h-48 w-full mb-19 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-2xl"></div>
          <img 
            src={user.profileImage || defaultProfileImage} 
            alt={`${user.firstName || 'User'} ${user.lastName || ''}`}
            className="absolute bottom-0 left-6 transform translate-y-1/2 w-24 h-24 rounded-full border-4 border-white dark:border-slate-800 object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = defaultProfileImage;
            }}
          />
        </div>

        <div className="mt-16 px-6">
          <h1 className="text-2xl mt-12 font-bold text-gray-900 dark:text-white">
            {user.firstName} {user.lastName}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">@{user.username}</p>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            {user.bio || 'No bio available'}
          </p>
          
          {currentUser && currentUser.userId !== parseInt(userId) && (
            <div className="mt-4">
              <button 
                onClick={handleFollow}
                className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                  isFollowing 
                    ? 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isFollowing ? 'Unfollow' : 'Follow'}
              </button>
            </div>
          )}
          
          <div className="mt-6 flex space-x-4">
            <div className="text-center">
              <span className="block text-2xl font-bold text-gray-900 dark:text-white">
                {followerCount}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">Followers</span>
            </div>
            <div className="text-center">
              <span className="block text-2xl font-bold text-gray-900 dark:text-white">
              {followingCount}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">Following</span>
            </div>
            <div className="text-center">
              <span className="block text-2xl font-bold text-gray-900 dark:text-white">
                {userPosts.length || 0}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">Posts</span>
            </div>
          </div>
        </div>
        
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Posts</h2>
          
          {userPosts.length === 0 ? (
            <div className="p-6 bg-gray-50 dark:bg-slate-700 rounded-lg text-center">
              <p className="text-gray-500 dark:text-gray-400">This user hasn't created any posts yet.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {userPosts.map(post => (
                <div key={post.postId} className="relative">
                  <PostCard post={post} onPostUpdate={() => {}} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
};

export default UserProfile;

