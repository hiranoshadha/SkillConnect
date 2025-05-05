import React, { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon, TrashIcon, PencilIcon, ShareIcon } from '@heroicons/react/outline';
import ProgressBar from './ProgressBar';
import { api } from '../../utils/api';

const PlanItem = ({ plan, onUpdate, onDelete }) => {
  const [expanded, setExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: plan.title,
    description: plan.description || '',
  });
  const [newItemTitle, setNewItemTitle] = useState('');
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [shareContent, setShareContent] = useState('');
  
  const handleEdit = () => {
    setIsEditing(true);
  };
  
  const handleCancelEdit = () => {
    setEditData({
      title: plan.title,
      description: plan.description || '',
    });
    setIsEditing(false);
  };
  
  const handleSaveEdit = async () => {
    try {
      const updatedPlan = {
        ...plan,
        title: editData.title,
        description: editData.description,
      };
      
      await api.updateLearningPlan(plan.planId, updatedPlan);
      setIsEditing(false);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error updating learning plan:', error);
      alert('Failed to update learning plan. Please try again.');
    }
  };
  
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this learning plan?')) return;
    
    try {
      await api.deleteLearningPlan(plan.planId);
      if (onDelete) onDelete();
    } catch (error) {
      console.error('Error deleting learning plan:', error);
      alert('Failed to delete learning plan. Please try again.');
    }
  };
  
  const handleAddItem = async () => {
    if (!newItemTitle.trim()) return;
    
    try {
      const newItem = {
        title: newItemTitle,
        learningPlan: { planId: plan.planId },
        complete: false
      };
      
      await api.createLearningPlanItem(newItem);
      setNewItemTitle('');
      setIsAddingItem(false);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error adding item to learning plan:', error);
      alert('Failed to add item. Please try again.');
    }
  };
  
  const handleToggleItemComplete = async (itemId, isComplete) => {
    try {
      // Create a local copy of the plan for optimistic updates
      const updatedItems = plan.items.map(item => {
        if (item.itemId === itemId) {
          return { ...item, complete: !isComplete };
        }
        return item;
      });
      
      // Calculate the new progress percentage
      const totalItems = updatedItems.length;
      const completedItems = updatedItems.filter(item => item.complete).length;
      const newProgress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
      
      // Optimistically update the UI with new progress
      if (onUpdate) {
        onUpdate({
          ...plan,
          items: updatedItems,
          status: newProgress // Update the progress status
        }, false);
      }
      
      // Then perform the actual API call
      if (!isComplete) {
        await api.markItemAsCompleted(itemId);
      } else {
        const itemToUpdate = plan.items.find(item => item.itemId === itemId);
        if (itemToUpdate) {
          await api.updateLearningPlanItem({
            ...itemToUpdate,
            complete: false
          });
        }
      }
    } catch (error) {
      console.error('Error updating item completion status:', error);
      alert('Failed to update item status. Please try again.');
      
      // If there was an error, revert the optimistic update by refreshing the data
      if (onUpdate) onUpdate(null, true);
    }
  };
  
  
  
  const handleDeleteItem = async (itemId) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      // Optimistically update UI before API call
      const updatedItems = plan.items.filter(item => item.itemId !== itemId);
      const totalItems = updatedItems.length;
      const completedItems = updatedItems.filter(item => item.complete).length;
      const newProgress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
      
      if (onUpdate) {
        onUpdate({
          ...plan,
          items: updatedItems,
          status: newProgress
        }, false);
      }
      
      await api.deleteLearningPlanItem(itemId);
      
      // After successful deletion, do a full refresh to ensure consistency
      if (onUpdate) onUpdate(null, true);
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete item. Please try again.');
      if (onUpdate) onUpdate(null, true);
    }
  };

  const handleSharePlan = () => {
    // Calculate progress statistics
    const completedItems = plan.items.filter(item => item.complete);
    const pendingItems = plan.items.filter(item => !item.complete);
    const totalItems = plan.items.length;
    const progressPercentage = Math.round(plan.status);
    
    // Format the completed and pending items as bullet points
    const completedItemsList = completedItems.length > 0 
      ? completedItems.map(item => `✅ ${item.title}`).join('\n') 
      : 'No completed items yet';
      
    const pendingItemsList = pendingItems.length > 0 
      ? pendingItems.map(item => `⏳ ${item.title}`).join('\n') 
      : 'All items completed!';
    
    // Create a visually appealing progress bar with emojis
    const progressBarLength = 10;
    const filledBlocks = Math.round((progressPercentage / 100) * progressBarLength);
    const emptyBlocks = progressBarLength - filledBlocks;
    const progressBar = '🟦'.repeat(filledBlocks) + '⬜'.repeat(emptyBlocks);
    
    // Generate a motivational message based on progress
    let motivationalMessage = '';
    if (progressPercentage === 0) {
      motivationalMessage = "Just getting started on my learning journey! 🌱";
    } else if (progressPercentage < 25) {
      motivationalMessage = "Taking my first steps toward mastery! 🚶";
    } else if (progressPercentage < 50) {
      motivationalMessage = "Making steady progress on my learning goals! 🌟";
    } else if (progressPercentage < 75) {
      motivationalMessage = "More than halfway there! The momentum is building! 🚀";
    } else if (progressPercentage < 100) {
      motivationalMessage = "Almost there! The finish line is in sight! 🏁";
    } else {
      motivationalMessage = "Mission accomplished! Knowledge acquired! 🎓";
    }
    
    // Format the start and end dates if available
    const startDateFormatted = plan.startDate ? new Date(plan.startDate).toLocaleDateString() : 'Not specified';
    const endDateFormatted = plan.endDate ? new Date(plan.endDate).toLocaleDateString() : 'Ongoing';
    
    // Create the share content with a visually structured format
    const defaultContent = 
      `📚 𝗟𝗘𝗔𝗥𝗡𝗜𝗡𝗚 𝗣𝗟𝗔𝗡 𝗨𝗣𝗗𝗔𝗧𝗘 📚\n\n` +
      `🔷 ${plan.title.toUpperCase()} 🔷\n\n` +
      `${plan.description || 'No description provided.'}\n\n` +
      `📊 𝗣𝗥𝗢𝗚𝗥𝗘𝗦𝗦: ${progressPercentage}% 📊\n` +
      `${progressBar}\n\n` +
      `${motivationalMessage}\n\n` +
      `⏱️ 𝗧𝗶𝗺𝗲𝗹𝗶𝗻𝗲: ${startDateFormatted} to ${endDateFormatted}\n\n` +
      `✨ 𝗖𝗢𝗠𝗣𝗟𝗘𝗧𝗘𝗗 𝗧𝗔𝗦𝗞𝗦 (${completedItems.length}/${totalItems}) ✨\n` +
      `${completedItemsList}\n\n` +
      `🔜 𝗨𝗣 𝗡𝗘𝗫𝗧 🔜\n` +
      `${pendingItemsList}\n\n` +
      `#SkillConnect #LearningJourney #${plan.title.replace(/\s+/g, '')}`;

    
    setShareContent(defaultContent);
    setIsSharing(true);
  };
  
  
  const handleShareSubmit = async () => {
    try {
      const postData = {
        title: `Learning Plan: ${plan.title}`,
        description: shareContent,
        user: { userId: plan.user.userId }
      };
      
      await api.createPost(postData);
      setIsSharing(false);
      alert('Your learning plan has been shared successfully!');
    } catch (error) {
      console.error('Error sharing learning plan:', error);
      alert('Failed to share learning plan. Please try again.');
    }
  };
  
  return (
    <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden transition-all duration-300">
      {isEditing ? (
        <div className="p-4">
          <h3 className="font-medium text-gray-900 dark:text-white mb-2">Edit Learning Plan</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="planTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Title
              </label>
              <input
                type="text"
                id="planTitle"
                value={editData.title}
                onChange={(e) => setEditData({...editData, title: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                required
              />
            </div>
            
            <div>
              <label htmlFor="planDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                id="planDescription"
                value={editData.description}
                onChange={(e) => setEditData({...editData, description: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <button 
                onClick={handleCancelEdit}
                className="px-3 py-1 text-sm bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveEdit}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div 
            className="p-4 flex items-center justify-between cursor-pointer"
            onClick={() => setExpanded(!expanded)}
          >
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 dark:text-white">{plan.title}</h3>
              <div className="mt-1 flex items-center">
                <ProgressBar progress={plan.status} />
                <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">{Math.round(plan.status)}% complete</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">{plan.items?.length || 0} items</span>
              {expanded ? (
                <ChevronUpIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              ) : (
                <ChevronDownIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              )}
            </div>
          </div>
          
          {expanded && (
            <div className="border-t border-gray-200 dark:border-slate-700 p-4">
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">{plan.description || 'No description provided.'}</p>
              
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Items</h4>
              {plan.items && plan.items.length > 0 ? (
                <ul className="space-y-2 mb-4">
                  {plan.items.map((item) => (
                    <li key={item.itemId} className="flex items-center justify-between group">
                      <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={item.complete}
                        onChange={() => handleToggleItemComplete(item.itemId, item.complete)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                        <span 
                          className={`ml-2 text-sm ${
                            item.complete 
                              ? 'line-through text-gray-500 dark:text-gray-400' 
                              : 'text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {item.title}
                        </span>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteItem(item.itemId);
                        }}
                        className="p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">No items added yet.</p>
              )}
              
              {isAddingItem ? (
                <div className="mb-4">
                  <div className="flex items-center">
                    <input
                      type="text"
                      value={newItemTitle}
                      onChange={(e) => setNewItemTitle(e.target.value)}
                      placeholder="Enter item title"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    />
                    <button
                      onClick={handleAddItem}
                      className="px-3 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 transition-colors duration-200"
                    >
                      Add
                    </button>
                  </div>
                  <button
                    onClick={() => setIsAddingItem(false)}
                    className="mt-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsAddingItem(true);
                  }}
                  className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 mb-4"
                >
                  + Add New Item
                </button>
              )}
              
              <div className="mt-4 flex justify-end space-x-2">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSharePlan();
                  }}
                  className="p-1.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors duration-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50"
                >
                  <ShareIcon className="h-4 w-4" />
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit();
                  }}
                  className="p-1.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete();
                  }}
                  className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors duration-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Share Plan Modal */}
      {isSharing && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white dark:bg-slate-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">Share Learning Plan</h3>
                
                <div className="mb-4">
                  <label htmlFor="shareContent" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Post Content
                  </label>
                  <textarea
                    id="shareContent"
                    value={shareContent}
                    onChange={(e) => setShareContent(e.target.value)}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  />
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsSharing(false)}
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
    </div>
  );
};

export default PlanItem;
