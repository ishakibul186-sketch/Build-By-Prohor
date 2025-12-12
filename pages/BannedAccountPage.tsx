
import React from 'react';
import { motion } from 'framer-motion';
import AnimatedPage from '../components/AnimatedPage';
import { useNavigate } from 'react-router-dom';

const BannedAccountPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    localStorage.removeItem('isBannedUser'); // Clear the persistent ban flag
    navigate('/'); // Navigate to home page
  };

  return (
    <AnimatedPage>
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-4">
        <motion.div
          className="max-w-md w-full bg-slate-800 p-8 rounded-xl shadow-lg text-center border border-slate-700"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <div className="text-red-500 mb-6 text-6xl">
            <i className="fas fa-ban"></i>
          </div>
          <h1 className="text-3xl font-bold text-slate-100 mb-4">Your Account Has Been Banned!</h1>
          <p className="text-slate-400 mb-2">
            Access to your account has been permanently revoked by the administration.
          </p>
          <p className="text-slate-400 text-sm mb-6">
            If you believe this is an error, please contact support for more information.
          </p>
          <button
            onClick={handleGoHome}
            className="mt-4 bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-primary-dark transition-colors duration-300 shadow-md"
          >
            Back to Home Page
          </button>
        </motion.div>
      </div>
    </AnimatedPage>
  );
};

export default BannedAccountPage;