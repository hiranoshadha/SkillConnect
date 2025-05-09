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

      <div className="flex flex-wrap gap-2 mb-3">
        {mediaFiles.map((media, index) => (
          <div key={index} className="relative w-24 h-24 border rounded-md overflow-hidden">
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
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 w-5 h-5 flex items-center justify-center"
            >
              <XIcon className="h-3 w-3" />
            </button>
          </div>
        ))}

        {mediaFiles.length < 3 && (
          <button
            type="button"
            onClick={() => fileInputRef.current.click()}
            className="w-24 h-24 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md flex items-center justify-center text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
          >
            <PhotographIcon className="h-8 w-8" />
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
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Uploading media... {Math.round(uploadProgress)}%
          </p>
        </div>
      )}
    </div>
  );

  return (
    <>
      <header className="bg-white dark:bg-slate-800 shadow-sm z-10">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {isMobile && (
              <div className="flex items-center">
                <button
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-slate-700"
                >
                  <MenuIcon className="h-6 w-6" />
                </button>
              </div>
            )}

            <div className="flex-1 flex items-center justify-center sm:justify-start">
              {isMobile && (
                <div className="flex-shrink-0 flex items-center">
                  <img className="h-8 w-auto" src="/assets/images/logo.svg" alt="SkillSync" />
                </div>
              )}

              <div className="hidden sm:ml-6 sm:flex sm:items-center relative" ref={searchRef}>
                <div className="relative w-full md:w-80 lg:w-96">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:placeholder-gray-400 dark:text-white"
                    placeholder="Search for users..."
                    type="search"
                    value={searchQuery}
                    onChange={handleSearchChange}
                  />
                </div>

                {/* Search Results Dropdown */}
                {showSearchResults && (
                  <div className="absolute top-full left-0 mt-2 w-full bg-white dark:bg-slate-800 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                    {isSearching ? (
                      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                        <p className="mt-2">Searching...</p>
                      </div>
                    ) : searchResults.length > 0 ? (
                      <ul>
                        {searchResults.map(user => (
                          <li
                            key={user.userId}
                            className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer"
                            onClick={() => navigateToProfile(user.userId)}
                          >
                            <div className="flex items-center">
                              <img
                                src={user.profileImage || "/assets/images/default-avatar.png"}
                                alt={`${user.firstName} ${user.lastName}`}
                                className="h-10 w-10 rounded-full mr-3 object-cover"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = "/assets/images/default-avatar.png";
                                }}
                              />
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {user.firstName} {user.lastName}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  @{user.username}
                                </p>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : searchQuery.trim().length >= 2 ? (
                      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                        No users found matching "{searchQuery}"
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-4">

            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-slate-700 "
              aria-label="Toggle sidebar"
            >
              <MenuIcon className="h-6 w-6" />
            </button>

              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-slate-700"
                aria-label="Toggle dark mode"
              >
                {darkMode ? (
                  <SunIcon className="h-6 w-6" />
                ) : (
                  <MoonIcon className="h-6 w-6" />
                )}
              </button>

              <Link to="/notifications">
                <button className="relative p-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-slate-700">
                  <BellIcon className="h-6 w-6" />
                  {unreadNotificationsCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
                      {unreadNotificationsCount > 99 ? '99+' : unreadNotificationsCount}
                    </span>
                  )}
                </button>
              </Link>


              {!isMobile && (
                <button
                  onClick={() => setShowCreatePostModal(true)}
                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-[1.02]"
                >

                  <span className="mr-2">+</span> Create Post
                </button>
              )}

              <div className="relative">
                <Link to="/profile">
                  <button className="flex rounded-full bg-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700">
                  <div className="h-7 w-7 rounded-full overflow-hidden flex items-center justify-center bg-gray-100 dark:bg-slate-700">
                    <img
                      className="h-full w-full object-cover"
                      src={profileImage}
                      alt={currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : "User avatar"}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = defaultAvatar;
                      }}
                    />
                  </div>
                  </button>
                </Link>
                {currentUser && (
                  <div className="hidden group-hover:block absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-md shadow-lg py-1 z-10">
                    <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">
                      <p className="font-medium">{currentUser.firstName} {currentUser.lastName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">@{currentUser.username}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Create Post Modal */}
      {showCreatePostModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">​</span>

            <div className="inline-block align-bottom bg-white dark:bg-slate-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="absolute top-0 right-0 pt-4 pr-4">
                <button
                  onClick={() => setShowCreatePostModal(false)}
                  className="text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-200 focus:outline-none"
                >
                  <XIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">Create a New Post</h3>

                {error && (
                  <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                    {error}
                  </div>
                )}

                <form onSubmit={handleCreatePost}>
                  <div className="mb-4">
                    <label htmlFor="postTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      id="postTitle"
                      value={postTitle}
                      onChange={(e) => setPostTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                      placeholder="Enter a title for your post"
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="postContent" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Content
                    </label>
                    <textarea
                      id="postContent"
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                      rows={5}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                      placeholder="What's on your mind?"
                      required
                    />
                  </div>
                  {mediaUploadSection}
                  <div className="mt-5 sm:mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowCreatePostModal(false)}
                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Posting...' : 'Post'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );

};

export default TopBar;
