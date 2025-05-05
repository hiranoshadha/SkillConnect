// import React from 'react';
// import { dummyUsers } from '../../data/dummyUsers';

// const RightSidebar = () => {
//   return (
//     <div className="hidden lg:block w-80 bg-white dark:bg-slate-800 shadow-lg overflow-y-auto">
//       <div className="p-4 border-b border-gray-200 dark:border-slate-700">
//         <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Notifications</h2>
//       </div>
      
//       <div className="p-4 space-y-4">
//         <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-xl border-l-4 border-blue-500">
//           <p className="text-sm text-gray-800 dark:text-gray-200">
//             <span className="font-medium">System:</span> Welcome to SkillSync! Complete your profile to get started.
//           </p>
//           <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Just now</p>
//         </div>
        
//         <div className="p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors duration-150">
//           <div className="flex items-start">
//             <img src="/assets/images/default-avatar.png" alt="User avatar" className="h-10 w-10 rounded-full mr-3" />
//             <div>
//               <p className="text-sm text-gray-800 dark:text-gray-200">
//                 <span className="font-medium">Alex Chen</span> commented on your post about React Hooks
//               </p>
//               <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">2 hours ago</p>
//             </div>
//           </div>
//         </div>
//       </div>
      
//       <div className="p-4 border-t border-b border-gray-200 dark:border-slate-700">
//         <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Suggested Connections</h2>
//       </div>
      
//       <div className="p-4 space-y-4">
//         {dummyUsers.slice(0, 3).map(user => (
//           <div key={user.id} className="flex items-center justify-between">
//             <div className="flex items-center">
//               <img src={user.avatar} alt={user.name} className="h-10 w-10 rounded-full mr-3" />
//               <div>
//                 <p className="text-sm font-medium text-gray-800 dark:text-white">{user.name}</p>
//                 <p className="text-xs text-gray-500 dark:text-gray-400">{user.skills.slice(0, 2).join(', ')}</p>
//               </div>
//             </div>
//             <button className="text-xs font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
//               Follow
//             </button>
//           </div>
//         ))}
        
//         <button className="w-full text-center text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium">
//           View More
//         </button>
//       </div>
//     </div>
//   );
// };

// export default RightSidebar;
