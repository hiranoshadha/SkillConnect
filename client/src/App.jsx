import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../src/hooks/useAuth';
import { ThemeProvider } from '../src/contexts/ThemeContext';
import Login from '../src/pages/auth/Login';
import Register from '../src/pages/auth/Register';
import Home from '../src/pages/Home';
import Discover from '../src/pages/Discover';
import Profile from '../src/pages/Profile';
import LearningPlan from '../src/pages/LearningPlan';
import Progress from '../src/pages/Progress';
import Notifications from '../src/pages/Notifications';
import Admin from '../src/pages/Admin';
import UserProfile from './pages/UserProfile';
import OauthRedirect from './utils/OauthRedirect.jsx';
import Announcements from './pages/Announcements';

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
      
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Register />} />
          <Route path="/home" element={<Home />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/plan" element={<LearningPlan />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/user/:userId" element={<UserProfile />} />
          <Route path="/oauth2/success" element={<OauthRedirect />} />
          <Route path="/announcements" element={<Announcements />} />
        </Routes>
       
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
