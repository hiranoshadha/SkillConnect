import React from 'react';

const ProgressBar = ({ progress }) => {
  // Ensure progress is between 0 and 100
  const safeProgress = Math.min(Math.max(0, progress), 100);
  
  // Determine color based on progress
  let colorClass = 'bg-blue-500';
  if (safeProgress >= 100) {
    colorClass = 'bg-green-500';
  } else if (safeProgress >= 75) {
    colorClass = 'bg-blue-500';
  } else if (safeProgress >= 50) {
    colorClass = 'bg-yellow-500';
  } else if (safeProgress >= 25) {
    colorClass = 'bg-orange-500';
  } else {
    colorClass = 'bg-red-500';
  }
  
  return (
    <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
      <div 
        className={`h-2.5 rounded-full ${colorClass}`} 
        style={{ width: `${safeProgress}%` }}
      ></div>
    </div>
  );
};

export default ProgressBar;
