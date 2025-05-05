import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import AppShell from '../components/layout/AppShell';
import PlanItem from '../components/ui/PlanItem';
import { useAuth } from '../hooks/useAuth';
import { api } from '../utils/api';
import { XIcon } from '@heroicons/react/outline';

const LearningPlan = () => {
  const { currentUser, loading } = useAuth();
  const [learningPlans, setLearningPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlanData, setNewPlanData] = useState({
    title: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    items: []
  });
  const [newItemTitle, setNewItemTitle] = useState('');
  
  // Fetch learning plans when component mounts or user changes
  useEffect(() => {
    if (currentUser) {
      fetchLearningPlans();
    }
  }, [currentUser]);
  
  const fetchLearningPlans = async (forceRefresh = true) => {
    if (forceRefresh) {
      setIsLoading(true);
      setError(null);
    }
    
    try {
      const plans = await api.getLearningPlans(currentUser.userId);
      setLearningPlans(plans);
    } catch (err) {
      console.error('Error fetching learning plans:', err);
      setError('Failed to load learning plans. Please try again.');
    } finally {
      if (forceRefresh) {
        setIsLoading(false);
      }
    }
  };

  const handlePlanUpdate = (updatedPlan, shouldRefresh = true) => {
    if (updatedPlan) {
      // Update just the specific plan in the state without fetching from the server
      setLearningPlans(prevPlans => 
        prevPlans.map(plan => 
          plan.planId === updatedPlan.planId ? updatedPlan : plan
        )
      );
    }
    
    // Only fetch from the server if shouldRefresh is true
    if (shouldRefresh) {
      fetchLearningPlans();
    }
  };
  
  const handleCreatePlan = async (e) => {
    e.preventDefault();
    
    try {
      // Make sure the data structure matches what the backend expects
      const planData = {
        title: newPlanData.title,
        description: newPlanData.description,
        startDate: newPlanData.startDate,
        endDate: newPlanData.endDate,
        user: { userId: currentUser.userId },
        items: newPlanData.items.map(item => ({
          title: item.title,
          complete: item.isComplete || false,
          learningPlan: null  // This will be set by the backend
        }))
      };
      
      await api.createLearningPlan(planData);
      
      // Reset form and close modal
      setNewPlanData({
        title: '',
        description: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        items: []
      });
      setShowCreateModal(false);
      
      // Refresh learning plans
      fetchLearningPlans();
    } catch (err) {
      console.error('Error creating learning plan:', err);
      alert('Failed to create learning plan. Please try again.');
    }
  };
  
  
  const handleAddItemToNewPlan = () => {
    if (!newItemTitle.trim()) return;
    
    setNewPlanData({
      ...newPlanData,
      items: [
        ...newPlanData.items,
        {
          title: newItemTitle,
          isComplete: false
        }
      ]
    });
    
    setNewItemTitle('');
  };
  
  const handleRemoveItemFromNewPlan = (index) => {
    const updatedItems = [...newPlanData.items];
    updatedItems.splice(index, 1);
    
    setNewPlanData({
      ...newPlanData,
      items: updatedItems
    });
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
  
  return (
    <AppShell>
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Learning Plans</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Create New Plan
          </button>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        ) : learningPlans.length === 0 ? (
          <div className="p-6 bg-gray-50 dark:bg-slate-700 rounded-lg text-center">
            <p className="text-gray-500 dark:text-gray-400">You haven't created any learning plans yet.</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Create Your First Plan
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {learningPlans.map(plan => (
              <PlanItem 
                key={plan.planId} 
                plan={{...plan, user: { userId: currentUser.userId }}} 
                onUpdate={handlePlanUpdate}
                onDelete={fetchLearningPlans}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Create Plan Modal */}
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
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">Create New Learning Plan</h3>
                
                <form onSubmit={handleCreatePlan}>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="planTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Title
                      </label>
                      <input
                        type="text"
                        id="planTitle"
                        value={newPlanData.title}
                        onChange={(e) => setNewPlanData({...newPlanData, title: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                        placeholder="e.g., Learn JavaScript"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="planDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Description
                      </label>
                      <textarea
                        id="planDescription"
                        value={newPlanData.description}
                        onChange={(e) => setNewPlanData({...newPlanData, description: e.target.value})}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                        placeholder="Describe your learning plan..."
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Start Date
                        </label>
                        <input
                          type="date"
                          id="startDate"
                          value={newPlanData.startDate}
                          onChange={(e) => setNewPlanData({...newPlanData, startDate: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          End Date
                        </label>
                        <input
                          type="date"
                          id="endDate"
                          value={newPlanData.endDate}
                          onChange={(e) => setNewPlanData({...newPlanData, endDate: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Items
                      </label>
                      
                      {newPlanData.items.length > 0 ? (
                        <ul className="mb-3 space-y-2">
                          {newPlanData.items.map((item, index) => (
                            <li key={index} className="flex items-center justify-between bg-gray-50 dark:bg-slate-700 p-2 rounded-md">
                              <span className="text-sm text-gray-700 dark:text-gray-300">{item.title}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveItemFromNewPlan(index)}
                                className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                              >
                                <XIcon className="h-4 w-4" />
                              </button>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">No items added yet.</p>
                      )}
                      
                      <div className="flex items-center">
                        <input
                          type="text"
                          value={newItemTitle}
                          onChange={(e) => setNewItemTitle(e.target.value)}
                          placeholder="Enter item title"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                        />
                        <button
                          type="button"
                          onClick={handleAddItemToNewPlan}
                          className="px-3 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 transition-colors duration-200"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-5 sm:mt-6 flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                    >
                      Create Plan
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
};

export default LearningPlan;
