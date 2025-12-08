import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ref, set } from 'firebase/database';
import { db } from '../firebase';
import AnimatedPage from '../components/AnimatedPage';
import { motion } from 'framer-motion';

const ProfileSetupPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.displayName || '');
  const [bio, setBio] = useState('');
  const [number, setNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError("You are not logged in.");
      return;
    }
    if (!name || !bio || !number) {
        setError("Please fill out all fields.");
        return;
    }

    setLoading(true);
    setError(null);

    const userData = {
      name,
      bio,
      number,
      email: user.email,
      picBase64: '', // Initialize with no picture
      lastChange: 0, // Initialize to 0 to allow the first edit immediately
      deviceInfo: navigator.userAgent,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    try {
      await set(ref(db, `Users/${user.uid}`), userData);
      navigate('/');
    } catch (err) {
      console.error("Failed to save profile:", err);
      setError("Failed to save profile. Please try again.");
      setLoading(false);
    }
  };

  return (
    <AnimatedPage>
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center bg-gray-50 p-4">
        <motion.div
          className="max-w-lg w-full bg-white p-8 rounded-xl shadow-lg"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <h1 className="text-3xl font-bold text-dark-text mb-2">Complete Your Profile</h1>
          <p className="text-light-text mb-8">Just a few more details to get started.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-dark-text">Full Name</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                required
              />
            </div>
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-dark-text">Bio</label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="mt-1 block w-full px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                placeholder="Tell us a little about yourself"
                required
              />
            </div>
            <div>
              <label htmlFor="number" className="block text-sm font-medium text-dark-text">Phone Number</label>
              <input
                type="tel"
                id="number"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                className="mt-1 block w-full px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                required
              />
            </div>
            
            {error && <p className="text-red-500 text-sm">{error}</p>}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-gray-400"
              >
                {loading ? 'Saving...' : 'Save and Continue'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatedPage>
  );
};

export default ProfileSetupPage;