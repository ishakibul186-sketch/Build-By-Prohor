
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

interface NotificationBannerProps {
  onClose: () => void;
}

const NotificationBanner: React.FC<NotificationBannerProps> = ({ onClose }) => {
  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -100, opacity: 0 }}
      transition={{ duration: 0.5, type: 'spring', stiffness: 100 }}
      className="bg-gradient-to-r from-primary to-secondary text-white p-4 w-full flex items-center justify-between shadow-lg"
      role="alert"
    >
      <div className="flex-grow text-center sm:text-left">
        <p>
          Please{' '}
          <Link to="/login" className="font-bold underline hover:text-yellow-200 transition-colors">
            login
          </Link>{' '}
          to explore all features and take a tour of your project.
        </p>
      </div>
      <button
        onClick={onClose}
        className="p-1 rounded-full hover:bg-white/20 transition-colors"
        aria-label="Dismiss notification"
      >
        <i className="fas fa-times fa-fw"></i>
      </button>
    </motion.div>
  );
};

export default NotificationBanner;
