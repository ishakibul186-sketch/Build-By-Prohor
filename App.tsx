
import React, { ReactNode, useEffect, useState } from 'react';
import { HashRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import LoginPage from './pages/LoginPage';
import ProfileSetupPage from './pages/ProfileSetupPage';
import ProfilePage from './pages/ProfilePage';
import BannedAccountPage from './pages/BannedAccountPage';
import BuildChatPage from './pages/BuildChatPage';
import ChatConversationPage from './pages/ChatConversationPage';
import SupportPage from './pages/support/SupportPage';
import { useAuth } from './hooks/useAuth';
import { AnimatePresence } from 'framer-motion';

// Admin Page Imports
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import UserManagementPage from './pages/admin/UserManagementPage';
import OrderManagementPage from './pages/admin/OrderManagementPage';
import SupportCenterPage from './pages/admin/SupportCenterPage';
import AdminChatConversationPage from './pages/admin/AdminChatConversationPage';


// Protected Route Component
const ProtectedRoute: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, authLoading } = useAuth(); 

  if (authLoading) { 
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-primary">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

// Admin Route Component
const AdminRoute: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user, authLoading, isAdmin, isAdminLoading } = useAuth();

    if (authLoading || isAdminLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900 text-primary">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!user || !isAdmin) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  const location = useLocation();
  const { authLoading, isAdminLoading, isBanned, isBannedLoading } = useAuth();

  if (authLoading || isAdminLoading || isBannedLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-primary">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const isUserGloballyBanned = isBanned || (localStorage.getItem('isBannedUser') === 'true');

  if (isUserGloballyBanned && location.pathname !== '/banned') {
    return <Navigate to="/banned" replace />;
  }
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/support" element={<SupportPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/banned" element={<BannedAccountPage />} />
        
        {/* Protected User Routes */}
        <Route path="/profile-setup" element={<ProtectedRoute><ProfileSetupPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/build-chat" element={<ProtectedRoute><BuildChatPage /></ProtectedRoute>} />
        <Route path="/build-chat/:chatId" element={<ProtectedRoute><ChatConversationPage /></ProtectedRoute>} />

        {/* Protected Admin Routes */}
        <Route path="/admin" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
        <Route path="/admin/user-management" element={<AdminRoute><UserManagementPage /></AdminRoute>} />
        <Route path="/admin/order-management" element={<AdminRoute><OrderManagementPage /></AdminRoute>} />
        <Route path="/admin/order-management/:userId/:chatId" element={<AdminRoute><AdminChatConversationPage /></AdminRoute>} />
        <Route path="/admin/support-center" element={<AdminRoute><SupportCenterPage /></AdminRoute>} />
      </Routes>
    </AnimatePresence>
  );
};

const AppContent: React.FC = () => {
  const location = useLocation();
  // Hide footer and main padding on chat list and conversation pages for a full-screen experience.
  const isChatRelatedPage = location.pathname.startsWith('/build-chat') || location.pathname.startsWith('/admin/order-management/');

  return (
    <div className="flex flex-col min-h-screen font-sans">
      <Header />
      <main className={`flex-grow ${!isChatRelatedPage ? 'pt-16' : ''}`}>
        <AppRoutes />
      </main>
      {!isChatRelatedPage && (
        <footer className="bg-dark-text text-white p-4 text-center">
            <p>&copy; 2024 Build By Prohor. All Rights Reserved.</p>
        </footer>
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
};

export default App;
