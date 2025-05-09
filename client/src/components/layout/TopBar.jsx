import React, { useState, useContext, useRef, useEffect } from 'react';
import { SearchIcon, MenuIcon, BellIcon, PlusIcon, SunIcon, MoonIcon, XIcon, PhotographIcon } from '@heroicons/react/outline';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { Link, useNavigate } from 'react-router-dom';
import { ThemeContext } from '../../contexts/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../utils/api';
import { createClient } from '@supabase/supabase-js';
import { SidebarContext } from '../../contexts/SidebarContext';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const TopBar = () => {
  const isMobile = !useMediaQuery('(min-width: 768px)');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { darkMode, toggleTheme } = useContext(ThemeContext);
  const { currentUser } = useAuth();
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [postTitle, setPostTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const { showSidebar, toggleSidebar } = useContext(SidebarContext);

  // Default avatar if no user or no profile image
  const defaultAvatar = "/assets/images/default-avatar.png";
  // Use user's profile image if available
  const profileImage = currentUser?.profileImage || defaultAvatar;

  const handleCreatePost = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // First upload media files if any
      const mediaUrls = await uploadFilesToSupabase();
      const [media1, media2, media3] = mediaUrls;

      const newPost = {
        description: postContent,
        user: {
          userId: currentUser.userId
        },
        media1: media1.url,
        media2: media2.url,
        media3: media3.url,
      };

      console.log(newPost)

      await api.createPost(newPost);

      // Reset form and close modal
      setPostTitle('');
      setPostContent('');
      setMediaFiles([]);
      setShowCreatePostModal(false);

      // Show success notification
      alert('Post created successfully!');
    } catch (err) {
      setError(err.message || 'Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Existing state variables...
  const [mediaFiles, setMediaFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const validateVideoLength = (file) => {
    return new Promise((resolve, reject) => {
      // Only check video files
      if (!file.type.startsWith('video/')) {
        resolve(true);
        return;
      }
  
      // Create a temporary video element to check duration
      const video = document.createElement('video');
      video.preload = 'metadata';
  
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        
        // Check if video is longer than 30 seconds
        if (video.duration > 30) {
          reject(new Error('Video must be 30 seconds or less'));
        } else {
          resolve(true);
        }
      };
  
      video.onerror = () => {
        reject(new Error('Could not load video metadata'));
      };
  
      video.src = URL.createObjectURL(file);
    });
  };

  // Handle file selection
  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);

    // Validate file count
    if (files.length + mediaFiles.length > 3) {
      alert('You can only upload a maximum of 3 media files');
      return;
    }

    // Validate file types
    const validFiles = files.filter(file =>
      file.type.startsWith('image/') || file.type.startsWith('video/')
    );

    if (validFiles.length !== files.length) {
      alert('Only images and videos are allowed');
    }

    // Process each file
  for (const file of validFiles) {
    try {
      // Check video duration if it's a video file
      if (file.type.startsWith('video/')) {
        await validateVideoLength(file);
      }
      
      // Add file to mediaFiles state
      const newMediaFile = {
        file,
        preview: URL.createObjectURL(file),
        type: file.type.startsWith('image/') ? 'image' : 'video',
        uploading: false,
        url: null
      };
      
      setMediaFiles(prevFiles => [...prevFiles, newMediaFile]);
    } catch (error) {
      alert(error.message);
      // Skip this file
    }
  }
  };

  // Remove a media file
  const removeMediaFile = (index) => {
    const updatedFiles = [...mediaFiles];

    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(updatedFiles[index].preview);

    updatedFiles.splice(index, 1);
    setMediaFiles(updatedFiles);
  };

  // Upload files to Supabase
  const uploadFilesToSupabase = async () => {
    const mediaUrls = [
      { url: '', type: '' },
      { url: '', type: '' },
      { url: '', type: '' }
    ];
    if (mediaFiles.length === 0) return mediaUrls;

    setIsUploading(true);
    

    if (!supabase) {
      console.error('Supabase client not initialized');
      throw new Error('Storage service unavailable');
    }

    try {
      for (let i = 0; i < mediaFiles.length; i++) {
        const mediaFile = mediaFiles[i];
        const file = mediaFile.file;

        // Create a unique file name
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `posts/${currentUser.userId}/${fileName}`;

        // Upload to Supabase
        const { data, error } = await supabase.storage
          .from('skillconnect')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) {
          console.error('Supabase upload error:', error);
          throw error;
        }

        // Get the public URL
        const { data: urlData } = supabase.storage
          .from('skillconnect')
          .getPublicUrl(filePath);

          mediaUrls[i] = {
            url: urlData.publicUrl,
            type: mediaFile.type
          };

        // Update progress
        setUploadProgress(((i + 1) / mediaFiles.length) * 100);
      }
      // if (mediaUrls.length < 3) {
      //   mediaUrls.push({
      //     url: '',
      //     type: ''
      //   });
      // }

      return mediaUrls;
    } catch (error) {
      console.error('Error uploading files:', error);
      throw error;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Clean up object URLs when component unmounts or modal closes
  useEffect(() => {
    return () => {
      mediaFiles.forEach(media => {
        if (media.preview) {
          URL.revokeObjectURL(media.preview);
        }
      });
    };
  }, [mediaFiles]);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle search input change
  const handleSearchChange = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim().length >= 2) {
      setIsSearching(true);
      setShowSearchResults(true);

      try {
        const results = await api.searchUsers(query);
        setSearchResults(results);
      } catch (error) {
        console.error('Error searching users:', error);
      } finally {
        setIsSearching(false);
      }
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  };

  // Navigate to user profile
  const navigateToProfile = (userId) => {
    setShowSearchResults(false);
    setSearchQuery('');
    navigate(`/user/${userId}`);
  };

  useEffect(() => {
    const fetchUnreadNotifications = async () => {
      if (currentUser) {
        try {
          const unreadNotifications = await api.getUnreadNotifications(currentUser.userId);
          setUnreadNotificationsCount(unreadNotifications.length);
        } catch (error) {
          console.error('Error fetching unread notifications:', error);
        }
      }
    };

    fetchUnreadNotifications();

    // Set up polling to check for new notifications every minute
    const intervalId = setInterval(fetchUnreadNotifications, 60000);

    return () => clearInterval(intervalId);
  }, [currentUser]);

  const mediaUploadSection = (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Add Photos/Videos (Max 3)
      </label>
      <div className="flex flex-wrap gap-3 mb-3">
        {mediaFiles.map((media, index) => (
          <div
            key={index}
            className="relative w-24 h-24 rounded-2xl overflow-hidden shadow-md bg-white/30 backdrop-blur-lg border border-gray-200 dark:border-slate-700"
          >
            {media.type === 'image' ? (
              <img
                src={media.preview}
                alt={`Preview ${index}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <video
                src={media.preview}
                className="w-full h-full object-cover"
                controls
              />
            )}
            <button
              type="button"
              onClick={() => removeMediaFile(index)}
              className="absolute top-1 right-1 bg-gradient-to-br from-pink-500 to-red-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center shadow-lg hover:scale-110 transition"
            >
              <XIcon className="h-4 w-4" />
            </button>
          </div>
        ))}
        {mediaFiles.length < 3 && (
          <button
            type="button"
            onClick={() => fileInputRef.current.click()}
            className="w-24 h-24 border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-2xl flex items-center justify-center bg-white/40 dark:bg-slate-800/40 hover:bg-blue-50 dark:hover:bg-blue-900/40 transition"
          >
            <PhotographIcon className="h-8 w-8 text-blue-400" />
          </button>
        )}
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*,video/*"
        multiple
        className="hidden"
      />
      {isUploading && (
        <div className="mt-2">
          <div className="w-full bg-blue-100 dark:bg-blue-900 rounded-full h-2.5">
            <div
              className="bg-gradient-to-r from-blue-400 to-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
            Uploading media... {Math.round(uploadProgress)}%
          </p>
        </div>
      )}
    </div>
  );


  return (
    <>
      {/* Glassmorphic TopBar */}
      <header className="backdrop-blur-md bg-white/70 dark:bg-slate-900/70 shadow-lg z-10 border-b border-slate-200 dark:border-slate-800">
        <div className="px-6 sm:px-10 lg:px-16">
          <div className="flex justify-between h-20 items-center">
            {/* Logo */}
            {/* <div className="flex items-center space-x-3">
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-xl bg-gradient-to-br from-blue-100 to-blue-300 dark:from-blue-900 dark:to-blue-700 text-blue-700 dark:text-blue-200 hover:scale-105 transition shadow"
                aria-label="Toggle sidebar"
              >
                <MenuIcon className="h-6 w-6" />
              </button>
              <img
                className="h-10 w-auto rounded-xl shadow"
                src="/assets/images/logo.svg"
                alt="SkillSync"
              />
            </div> */}
            {/* Search Bar */}
            <div className="flex-1 flex items-center justify-center sm:justify-center relative" ref={searchRef}>
              <div className="relative w-full max-w-lg">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <SearchIcon className="h-5 w-5 text-blue-400" />
                </div>
                <input
                  className="block w-full pl-12 pr-4 py-3 rounded-2xl text-base font-medium bg-white/70 dark:bg-slate-800/70 border border-blue-100 dark:border-slate-700 shadow focus:ring-2 focus:ring-blue-400 focus:border-blue-400 dark:focus:ring-blue-700 dark:focus:border-blue-700 placeholder-blue-300 dark:placeholder-blue-500 text-blue-900 dark:text-blue-100 transition"
                  placeholder="Search for users..."
                  type="search"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
                {/* Search Results Dropdown */}
                {showSearchResults && (
                  <div className="absolute top-full left-0 mt-2 w-full bg-white/90 dark:bg-slate-900/90 rounded-2xl shadow-xl z-50 max-h-96 overflow-y-auto border border-blue-100 dark:border-slate-700 backdrop-blur-md">
                    {isSearching ? (
                      <div className="p-6 text-center text-blue-400">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                        <p className="mt-3 font-semibold">Searching...</p>
                      </div>
                    ) : searchResults.length > 0 ? (
                      <ul>
                        {searchResults.map(user => (
                          <li
                            key={user.userId}
                            className="px-5 py-4 hover:bg-blue-50 dark:hover:bg-blue-900/30 cursor-pointer rounded-xl transition"
                            onClick={() => navigateToProfile(user.userId)}
                          >
                            <div className="flex items-center">
                              <img
                                src={user.profileImage || "/assets/images/default-avatar.png"}
                                alt={`${user.firstName} ${user.lastName}`}
                                className="h-12 w-12 rounded-full mr-4 object-cover border-2 border-blue-100 dark:border-blue-700"
                                onError={e => {
                                  e.target.onerror = null;
                                  e.target.src = "/assets/images/default-avatar.png";
                                }}
                              />
                              <div>
                                <p className="font-semibold text-blue-900 dark:text-blue-100">
                                  {user.firstName} {user.lastName}
                                </p>
                                <p className="text-sm text-blue-400 dark:text-blue-300">
                                  @{user.username}
                                </p>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : searchQuery.trim().length >= 2 ? (
                      <div className="p-6 text-center text-blue-400">
                        No users found matching "{searchQuery}"
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
            {/* Actions */}
            <div className="flex items-center space-x-4">
            <button
                onClick={toggleSidebar}
                className="p-2 rounded-xl bg-gradient-to-br from-blue-100 to-blue-300 dark:from-blue-900 dark:to-blue-700 text-blue-700 dark:text-blue-200 hover:scale-105 transition shadow"
                aria-label="Toggle sidebar"
              >
                <MenuIcon className="h-6 w-6" />
              </button>
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl bg-gradient-to-br from-yellow-100 to-yellow-300 dark:from-slate-700 dark:to-slate-800 text-yellow-600 dark:text-yellow-200 hover:scale-105 transition shadow"
                aria-label="Toggle dark mode"
              >
                {darkMode ? <SunIcon className="h-6 w-6" /> : <MoonIcon className="h-6 w-6" />}
              </button>
              {/* Notifications */}
              <Link to="/notifications">
                <button className="relative p-2 rounded-xl bg-gradient-to-br from-pink-100 to-pink-300 dark:from-pink-900 dark:to-pink-700 text-pink-700 dark:text-pink-200 hover:scale-105 transition shadow">
                  <BellIcon className="h-6 w-6" />
                  {unreadNotificationsCount > 0 && (
                    <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full shadow">
                      {unreadNotificationsCount > 99 ? '99+' : unreadNotificationsCount}
                    </span>
                  )}
                </button>
              </Link>
              {/* Create Post */}
              {!isMobile && (
                <button
                  onClick={() => setShowCreatePostModal(true)}
                  className="flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-2xl shadow-lg hover:scale-105 hover:from-blue-600 hover:to-indigo-700 transition-all duration-200"
                >
                  <PlusIcon className="h-5 w-5 mr-2" /> Create Post
                </button>
              )}
              {/* Profile Avatar */}
              <div className="relative group">
                <Link to="/profile">
                  <button className="flex rounded-full bg-blue-100 dark:bg-blue-900 shadow p-1.5">
                    <div className="h-9 w-9 rounded-full overflow-hidden flex items-center justify-center bg-white dark:bg-slate-700">
                      <img
                        className="h-full w-full object-cover"
                        src={profileImage}
                        alt={currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : "User avatar"}
                        onError={e => {
                          e.target.onerror = null;
                          e.target.src = defaultAvatar;
                        }}
                      />
                    </div>
                  </button>
                </Link>
                {/* Profile Dropdown (optional, can be improved further) */}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Create Post Modal */}
      {showCreatePostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="relative bg-white/90 dark:bg-slate-900/90 rounded-3xl shadow-2xl max-w-lg w-full mx-4 p-8 border border-blue-100 dark:border-slate-700 animate-fadeIn">
            <button
              onClick={() => setShowCreatePostModal(false)}
              className="absolute top-4 right-4 text-blue-400 hover:text-blue-600 dark:text-blue-300 dark:hover:text-blue-100 transition"
            >
              <XIcon className="h-7 w-7" />
            </button>
            <h3 className="text-2xl font-extrabold text-blue-900 dark:text-blue-100 mb-6">
              Create a New Post
            </h3>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                {error}
              </div>
            )}
            <form onSubmit={handleCreatePost}>
              <div className="mb-4">
                <label htmlFor="postTitle" className="block text-sm font-semibold text-blue-800 dark:text-blue-200 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  id="postTitle"
                  value={postTitle}
                  onChange={e => setPostTitle(e.target.value)}
                  className="w-full px-4 py-3 border border-blue-100 dark:border-slate-700 rounded-xl bg-white/60 dark:bg-slate-800/60 shadow focus:ring-2 focus:ring-blue-400 focus:border-blue-400 dark:focus:ring-blue-700 dark:focus:border-blue-700 text-blue-900 dark:text-blue-100"
                  placeholder="Enter a title for your post"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="postContent" className="block text-sm font-semibold text-blue-800 dark:text-blue-200 mb-1">
                  Content
                </label>
                <textarea
                  id="postContent"
                  value={postContent}
                  onChange={e => setPostContent(e.target.value)}
                  rows={5}
                  className="w-full px-4 py-3 border border-blue-100 dark:border-slate-700 rounded-xl bg-white/60 dark:bg-slate-800/60 shadow focus:ring-2 focus:ring-blue-400 focus:border-blue-400 dark:focus:ring-blue-700 dark:focus:border-blue-700 text-blue-900 dark:text-blue-100"
                  placeholder="What's on your mind?"
                  required
                />
              </div>
              {mediaUploadSection}
              <div className="mt-7 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowCreatePostModal(false)}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-gray-200 to-gray-300 dark:from-slate-700 dark:to-slate-800 text-blue-700 dark:text-blue-200 font-semibold hover:from-gray-300 hover:to-gray-400 dark:hover:from-slate-800 dark:hover:to-slate-900 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold shadow-lg hover:from-blue-600 hover:to-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Posting...' : 'Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <style>{`
        @keyframes fadeIn {
          0% { opacity: 0; transform: scale(0.97);}
          100% { opacity: 1; transform: scale(1);}
        }
        .animate-fadeIn {
          animation: fadeIn 0.25s cubic-bezier(.4,0,.2,1);
        }
      `}</style>
    </>
  );
};


export default TopBar;
