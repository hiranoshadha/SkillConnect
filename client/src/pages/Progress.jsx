import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import AppShell from '../components/layout/AppShell';
import ProgressBar from '../components/ui/ProgressBar';
import { useAuth } from '../hooks/useAuth';
import { api } from '../utils/api';
import { 
  PlusIcon, FilterIcon, AcademicCapIcon, BookOpenIcon, 
  ClipboardCheckIcon, BadgeCheckIcon, XIcon, ShareIcon 
} from '@heroicons/react/outline';

const Progress = () => {
  const { currentUser, loading } = useAuth();
  const [learningUpdates, setLearningUpdates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareContent, setShareContent] = useState('');
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  const [newUpdateData, setNewUpdateData] = useState({
    title: '',
    description: '',
    type: '',
    category: '',
    learningMethod: '',
    level: 'Beginner',
    status: 'Not Started',
    completionPercentage: 0
  });
  
  const [filterOptions, setFilterOptions] = useState({
    status: '',
    category: '',
    type: '',
    level: ''
  });
  
  const statusOptions = [
    'Not Started',
    'In Progress',
    'Ongoing',
    'Almost Complete',
    'Completed'
  ];
  
  const levelOptions = [
    'Beginner',
    'Intermediate',
    'Advanced',
    'Expert'
  ];
  
  const templateOptions = [
    { 
      id: 'TUTORIAL', 
      title: 'Complete Online Tutorial', 
      icon: <BookOpenIcon className="h-8 w-8 text-blue-500" />,
      description: 'Track your progress through online video tutorials'
    },
    { 
      id: 'CERTIFICATE', 
      title: 'Complete Certification Course', 
      icon: <AcademicCapIcon className="h-8 w-8 text-green-500" />,
      description: 'Work towards earning a professional certification'
    },
    { 
      id: 'EXAM', 
      title: 'Pass Certification Exam', 
      icon: <ClipboardCheckIcon className="h-8 w-8 text-purple-500" />,
      description: 'Prepare for and pass a certification examination'
    },
    { 
      id: 'PROJECT', 
      title: 'Complete Practice Project', 
      icon: <BadgeCheckIcon className="h-8 w-8 text-orange-500" />,
      description: 'Build a hands-on project to demonstrate your skills'
    }
  ];
  
  // Fetch learning updates when component mounts or user changes
  useEffect(() => {
    if (currentUser) {
      fetchLearningUpdates();
    }
  }, [currentUser]);
  
  const fetchLearningUpdates = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const updates = await api.getLearningUpdates(currentUser.userId);
      setLearningUpdates(updates);
    } catch (err) {
      console.error('Error fetching learning updates:', err);
      setError('Failed to load learning updates. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCreateUpdate = async (e) => {
    e.preventDefault();
    
    try {
      const updateData = {
        ...newUpdateData,
        user: { userId: currentUser.userId }
      };
      
      await api.createLearningUpdate(updateData);
      
      // Reset form and close modal
      setNewUpdateData({
        title: '',
        description: '',
        type: '',
        category: '',
        learningMethod: '',
        level: 'Beginner',
        status: 'Not Started',
        completionPercentage: 0
      });
      setShowCreateModal(false);
      
      // Refresh learning updates
      fetchLearningUpdates();
    } catch (err) {
      console.error('Error creating learning update:', err);
      alert('Failed to create learning update. Please try again.');
    }
  };
  
  const handleCreateFromTemplate = async (templateId) => {
    try {
      await api.createLearningUpdateFromTemplate(templateId, currentUser.userId);
      setShowTemplateModal(false);
      fetchLearningUpdates();
    } catch (err) {
      console.error('Error creating from template:', err);
      alert('Failed to create from template. Please try again.');
    }
  };
  
  const handleUpdateStatus = async (updateId, newStatus) => {
    try {
      // Get default completion percentage based on status
      let completionPercentage;
      switch (newStatus) {
        case 'Not Started':
          completionPercentage = 0;
          break;
        case 'In Progress':
          completionPercentage = 25;
          break;
        case 'Ongoing':
          completionPercentage = 50;
          break;
        case 'Almost Complete':
          completionPercentage = 75;
          break;
        case 'Completed':
          completionPercentage = 100;
          break;
        default:
          completionPercentage = 0;
      }
      
      await api.updateLearningUpdateStatus(updateId, newStatus, completionPercentage);
      
      // Update local state for immediate UI update
      setLearningUpdates(prevUpdates => 
        prevUpdates.map(update => 
          update.updateId === updateId 
            ? { ...update, status: newStatus, completionPercentage } 
            : update
        )
      );
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status. Please try again.');
    }
  };
  
  const handleDeleteUpdate = async (updateId) => {
    if (!confirm('Are you sure you want to delete this learning update?')) return;
    
    try {
      await api.deleteLearningUpdate(updateId);
      
      // Update local state
      setLearningUpdates(prevUpdates => 
        prevUpdates.filter(update => update.updateId !== updateId)
      );
    } catch (err) {
      console.error('Error deleting update:', err);
      alert('Failed to delete update. Please try again.');
    }
  };
  
  const applyFilters = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      let updates;
      
      if (filterOptions.status) {
        updates = await api.getLearningUpdatesByStatus(currentUser.userId, filterOptions.status);
      } else if (filterOptions.category) {
        updates = await api.getLearningUpdatesByCategory(currentUser.userId, filterOptions.category);
      } else if (filterOptions.type) {
        updates = await api.getLearningUpdatesByType(currentUser.userId, filterOptions.type);
      } else if (filterOptions.level) {
        // Assuming you've added this endpoint
        updates = await api.getLearningUpdatesByLevel(currentUser.userId, filterOptions.level);
      } else {
        updates = await api.getLearningUpdates(currentUser.userId);
      }
      
      setLearningUpdates(updates);
      setShowFilterModal(false);
    } catch (err) {
      console.error('Error applying filters:', err);
      setError('Failed to apply filters. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShareAchievement = (achievement) => {
    setSelectedAchievement(achievement);
    
    // Generate emoji based on achievement type
    let achievementEmoji = '🏆';
    if (achievement.type === 'Tutorial') achievementEmoji = '📚';
    else if (achievement.type === 'Exam') achievementEmoji = '📝';
    else if (achievement.type === 'Project') achievementEmoji = '🛠️';
    else if (achievement.type === 'Certificate') achievementEmoji = '🎓';
    
    // Create a visually appealing progress bar with emojis
    const progressBarLength = 10;
    const filledBlocks = Math.round((achievement.completionPercentage / 100) * progressBarLength);
    const emptyBlocks = progressBarLength - filledBlocks;
    const progressBar = '🟩'.repeat(filledBlocks) + '⬜'.repeat(emptyBlocks);
    
    // Generate a celebratory message
    let celebrationMessage = '';
    if (achievement.completionPercentage === 100) {
      celebrationMessage = "I've completed this learning goal! 🎉";
    } else {
      celebrationMessage = `I'm making great progress on this learning goal! ${achievement.completionPercentage}% complete 🚀`;
    }
    
    // Format the date
    const achievementDate = achievement.updatedAt 
      ? new Date(achievement.updatedAt).toLocaleDateString() 
      : new Date().toLocaleDateString();
    
    // Create the share content
    const content = 
      `${achievementEmoji} 𝗔𝗖𝗛𝗜𝗘𝗩𝗘𝗠𝗘𝗡𝗧 𝗨𝗡𝗟𝗢𝗖𝗞𝗘𝗗 ${achievementEmoji}\n\n` +
      `🌟 ${achievement.title.toUpperCase()} 🌟\n\n` +
      `${achievement.description || 'I\'m leveling up my skills!'}\n\n` +
      `📊 𝗣𝗥𝗢𝗚𝗥𝗘𝗦𝗦: ${achievement.completionPercentage}% 📊\n` +
      `${progressBar}\n\n` +
      `${celebrationMessage}\n\n` +
      `📋 𝗗𝗘𝗧𝗔𝗜𝗟𝗦 📋\n` +
      `𝗧𝘆𝗽𝗲: ${achievement.type || 'Learning'}\n` +
      `𝗖𝗮𝘁𝗲𝗴𝗼𝗿𝘆: ${achievement.category || 'Skill Development'}\n` +
      `𝗟𝗲𝘃𝗲𝗹: ${achievement.level || 'N/A'}\n` +
      `𝗗𝗮𝘁𝗲: ${achievementDate}\n\n` +
      `#SkillConnect #Achievement #${(achievement.category || 'Learning').replace(/\s+/g, '')}`;
    
    setShareContent(content);
    setShowShareModal(true);
  };
  
  const handleShareSubmit = async () => {
    if (!selectedAchievement) return;
    
    try {
      const postData = {
        title: `Achievement: ${selectedAchievement.title}`,
        description: shareContent,
        user: { userId: currentUser.userId }
      };
      
      await api.createPost(postData);
      setShowShareModal(false);
      alert('Your achievement has been shared successfully!');
    } catch (error) {
      console.error('Error sharing achievement:', error);
      alert('Failed to share achievement. Please try again.');
    }
  };
  
  const resetFilters = () => {
    setFilterOptions({
      status: '',
      category: '',
      type: '',
      level: ''
    });
    fetchLearningUpdates();
    setShowFilterModal(false);
  };
  
  // Calculate overall progress
  const calculateOverallProgress = () => {
    if (learningUpdates.length === 0) return 0;
    
    const totalPercentage = learningUpdates.reduce(
      (sum, update) => sum + (update.completionPercentage || 0), 
      0
    );
    
    return Math.round(totalPercentage / learningUpdates.length);
  };
  
  // Group updates by status for better visualization
  const groupUpdatesByStatus = () => {
    const grouped = {};
    
    statusOptions.forEach(status => {
      grouped[status] = learningUpdates.filter(update => update.status === status);
    });
    
    return grouped;
  };
  
  // Show loading state while authentication is being checked
  if (loading) {
    return (
      <AppShell>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </AppShell>
    );
  }
  
  // Redirect to login if not authenticated
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  const groupedUpdates = groupUpdatesByStatus();
  const overallProgress = calculateOverallProgress();
  
  return (
    <AppShell>
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Learning Progress</h1>
            <p className="text-gray-600 dark:text-gray-300">Track your journey and celebrate your achievements</p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-2">
            <button
              onClick={() => setShowFilterModal(true)}
              className="px-3 py-2 flex items-center bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors duration-200 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600"
            >
              <FilterIcon className="h-5 w-5 mr-1" />
              Filter
            </button>
            <button
              onClick={() => setShowTemplateModal(true)}
              className="px-3 py-2 flex items-center bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors duration-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
            >
              <PlusIcon className="h-5 w-5 mr-1" />
              From Template
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Add Progress
            </button>
          </div>
        </div>
        
        {/* Overall Progress Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Overall Progress</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Across all learning activities</p>
            </div>
            <div className="mt-2 md:mt-0">
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{overallProgress}%</span>
            </div>
          </div>
          
          <ProgressBar progress={overallProgress} />
          
          <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-2">
            {statusOptions.map(status => {
              const count = groupedUpdates[status]?.length || 0;
              return (
                <div key={status} className="text-center p-2 rounded-lg bg-gray-50 dark:bg-slate-700/50">
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">{status}</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">{count}</div>
                </div>
              );
            })}
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        ) : learningUpdates.length === 0 ? (
          <div className="p-6 bg-gray-50 dark:bg-slate-700 rounded-lg text-center">
            <p className="text-gray-500 dark:text-gray-400">You haven't added any learning progress yet.</p>
            <div className="mt-4 flex justify-center space-x-4">
              <button
                onClick={() => setShowTemplateModal(true)}
                className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors duration-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
              >
                Use Template
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Add Custom Progress
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Display updates grouped by status */}
            {statusOptions.map(status => {
              const updates = groupedUpdates[status];
              if (!updates || updates.length === 0) return null;
              
              return (
                <div key={status} className="bg-white dark:bg-slate-800 rounded-2xl shadow-md p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{status}</h2>
                  
                  <div className="space-y-4">
                    {updates.map(update => (
                      <div key={update.updateId} className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-4">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">{update.title}</h3>
                            <div className="flex items-center mt-1">
                              <span className="text-sm text-gray-500 dark:text-gray-400 mr-3">{update.type}</span>
                              {update.category && (
                                <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                  {update.category}
                                </span>
                              )}
                              {update.level && (
                                <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                                  {update.level}
                                </span>
                              )}
                            </div>
                          </div>
                          <span className="mt-2 md:mt-0 text-sm font-medium text-blue-600 dark:text-blue-400">
                            {update.completionPercentage}%
                          </span>
                        </div>
                        
                        {update.description && (
                          <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">{update.description}</p>
                        )}
                        
                        <ProgressBar progress={update.completionPercentage} />
                        
                        <div className="mt-3 flex flex-wrap justify-between items-center">
                          <div className="flex flex-wrap gap-2 mt-2">
                            {statusOptions.map(statusOption => (
                              <button
                                key={statusOption}
                                onClick={() => handleUpdateStatus(update.updateId, statusOption)}
                                className={`px-2 py-1 text-xs rounded-md ${
                                  update.status === statusOption
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 text-gray-800 dark:bg-slate-600 dark:text-gray-200'
                                }`}
                              >
                                {statusOption}
                              </button>
                            ))}
                          </div>
                          
                          <button
                            onClick={() => handleDeleteUpdate(update.updateId)}
                            className="mt-2 p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <XIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Create Progress Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white dark:bg-slate-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="absolute top-0 right-0 pt-4 pr-4">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-200 focus:outline-none"
                >
                  <XIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">Add Learning Progress</h3>
                
                <form onSubmit={handleCreateUpdate}>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Title
                      </label>
                      <input
                        type="text"
                        id="title"
                        value={newUpdateData.title}
                        onChange={(e) => setNewUpdateData({...newUpdateData, title: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                        placeholder="e.g., Complete React Course"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Description
                      </label>
                      <textarea
                        id="description"
                        value={newUpdateData.description}
                        onChange={(e) => setNewUpdateData({...newUpdateData, description: e.target.value})}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                        placeholder="Describe your learning goal..."
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Type
                        </label>
                        <input
                          type="text"
                          id="type"
                          value={newUpdateData.type}
                          onChange={(e) => setNewUpdateData({...newUpdateData, type: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                          placeholder="e.g., Course, Book, Project"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Category
                        </label>
                        <input
                          type="text"
                          id="category"
                          value={newUpdateData.category}
                          onChange={(e) => setNewUpdateData({...newUpdateData, category: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                          placeholder="e.g., Web Development"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="learningMethod" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Learning Method
                        </label>
                        <input
                          type="text"
                          id="learningMethod"
                          value={newUpdateData.learningMethod}
                          onChange={(e) => setNewUpdateData({...newUpdateData, learningMethod: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                          placeholder="e.g., Video, Book, Hands-on"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="level" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Level
                        </label>
                        <select
                          id="level"
                          value={newUpdateData.level}
                          onChange={(e) => setNewUpdateData({...newUpdateData, level: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                        >
                          {levelOptions.map(level => (
                            <option key={level} value={level}>{level}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Status
                      </label>
                      <select
                        id="status"
                        value={newUpdateData.status}
                        onChange={(e) => {
                          const status = e.target.value;
                          let completionPercentage = 0;
                          
                          // Set default percentage based on status
                          switch (status) {
                            case 'Not Started':
                              completionPercentage = 0;
                              break;
                            case 'In Progress':
                              completionPercentage = 25;
                              break;
                            case 'Ongoing':
                              completionPercentage = 50;
                              break;
                            case 'Almost Complete':
                              completionPercentage = 75;
                              break;
                            case 'Completed':
                              completionPercentage = 100;
                              break;
                          }
                          
                          setNewUpdateData({
                            ...newUpdateData, 
                            status, 
                            completionPercentage
                          });
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                      >
                        {statusOptions.map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="completionPercentage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Completion Percentage: {newUpdateData.completionPercentage}%
                      </label>
                      <input
                        type="range"
                        id="completionPercentage"
                        min="0"
                        max="100"
                        step="5"
                        value={newUpdateData.completionPercentage}
                        onChange={(e) => setNewUpdateData({
                          ...newUpdateData, 
                          completionPercentage: parseInt(e.target.value)
                        })}
                        className="w-full"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-5 sm:mt-6 flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                    >
                      Add Progress
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Template Selection Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white dark:bg-slate-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="absolute top-0 right-0 pt-4 pr-4">
                <button
                  onClick={() => setShowTemplateModal(false)}
                  className="text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-200 focus:outline-none"
                >
                  <XIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">Choose a Template</h3>
                
                <div className="grid grid-cols-1 gap-4">
                  {templateOptions.map(template => (
                    <div 
                      key={template.id}
                      onClick={() => handleCreateFromTemplate(template.id)}
                      className="p-4 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer transition-colors duration-200"
                    >
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          {template.icon}
                        </div>
                        <div className="ml-4">
                          <h4 className="text-base font-medium text-gray-900 dark:text-white">{template.title}</h4>
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{template.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white dark:bg-slate-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="absolute top-0 right-0 pt-4 pr-4">
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-200 focus:outline-none"
                >
                  <XIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">Filter Learning Progress</h3>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="filterStatus" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Status
                    </label>
                    <select
                      id="filterStatus"
                      value={filterOptions.status}
                      onChange={(e) => setFilterOptions({...filterOptions, status: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                      >
                        <option value="">All Statuses</option>
                        {statusOptions.map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="filterCategory" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Category
                      </label>
                      <input
                        type="text"
                        id="filterCategory"
                        value={filterOptions.category}
                        onChange={(e) => setFilterOptions({...filterOptions, category: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                        placeholder="Enter category to filter"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="filterType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Type
                      </label>
                      <input
                        type="text"
                        id="filterType"
                        value={filterOptions.type}
                        onChange={(e) => setFilterOptions({...filterOptions, type: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                        placeholder="Enter type to filter"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="filterLevel" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Level
                      </label>
                      <select
                        id="filterLevel"
                        value={filterOptions.level}
                        onChange={(e) => setFilterOptions({...filterOptions, level: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                      >
                        <option value="">All Levels</option>
                        {levelOptions.map(level => (
                          <option key={level} value={level}>{level}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="flex justify-end space-x-3 mt-6">
                      <button
                        type="button"
                        onClick={resetFilters}
                        className="px-3 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600"
                      >
                        Reset
                      </button>
                      <button
                        type="button"
                        onClick={applyFilters}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                      >
                        Apply Filters
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Achievements Section */}
        <div className="max-w-5xl mx-auto mt-8">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Recent Achievements</h2>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-0.5 h-full mx-auto bg-gray-200 dark:bg-slate-700"></div>
              </div>
              
              <div className="relative space-y-8">
                {learningUpdates
                  .filter(update => update.status === 'Completed')
                  .slice(0, 3)
                  .map((achievement, index) => (
                  <div key={achievement.updateId} className="relative">
                    <div className="flex items-center">
                      <div className={`h-9 w-9 rounded-full flex items-center justify-center ring-8 ring-white dark:ring-slate-800 ${index === 0 ? 'bg-blue-500' : 'bg-gray-100 dark:bg-slate-700'}`}>
                        <span className="text-lg">
                          {achievement.type === 'Certification' ? '🏆' : 
                           achievement.type === 'Tutorial' ? '📚' : 
                           achievement.type === 'Exam' ? '📝' : '🎯'}
                        </span>
                      </div>
                      <div className="ml-4 min-w-0 flex-1">
                        <h3 className="text-base font-medium text-gray-900 dark:text-white">
                          {achievement.title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(achievement.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <button 
                          onClick={() => handleShareAchievement(achievement)}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-800">
                          Share
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {learningUpdates.filter(update => update.status === 'Completed').length === 0 && (
                  <div className="text-center py-4">
                    <p className="text-gray-500 dark:text-gray-400">Complete learning items to see your achievements here!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* Share Achievement Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white dark:bg-slate-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">Share Achievement</h3>
                
                <div className="mb-4">
                  <label htmlFor="shareContent" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Post Content
                  </label>
                  <textarea
                    id="shareContent"
                    value={shareContent}
                    onChange={(e) => setShareContent(e.target.value)}
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  />
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowShareModal(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600"
                  >
                    Cancel
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleShareSubmit}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    Share
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      </AppShell>
    );
  };
  
  export default Progress;
  


