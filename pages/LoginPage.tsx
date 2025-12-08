import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { ref, get } from 'firebase/database';
import { auth, db } from '../firebase';
import AnimatedPage from '../components/AnimatedPage';
import { motion } from 'framer-motion';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = React.useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      setError(null);
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user data exists in the database
      const userRef = ref(db, `Users/${user.uid}`);
      const snapshot = await get(userRef);

      if (snapshot.exists()) {
        // User exists, redirect to home
        navigate('/');
      } else {
        // New user, redirect to profile setup
        navigate('/profile-setup');
      }
    } catch (err: any) {
      console.error(err);
      setError('Failed to sign in with Google. Please try again.');
    }
  };

  return (
    <AnimatedPage>
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center bg-gray-50 p-4">
        <motion.div
          className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <h1 className="text-3xl font-bold text-dark-text mb-4">Welcome Back</h1>
          <p className="text-light-text mb-8">Sign in to continue to your account.</p>

          <motion.button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-dark-text font-semibold py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors duration-300 shadow-sm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg className="w-6 h-6" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                <path fill="none" d="M0 0h48v48H0z"></path>
            </svg>
            <span>Continue with Google</span>
          </motion.button>

          {error && <p className="text-red-500 mt-4">{error}</p>}
        </motion.div>
      </div>
    </AnimatedPage>
  );
};

export default LoginPage;
