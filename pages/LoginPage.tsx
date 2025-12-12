
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup, type User } from 'firebase/auth'; 
import { auth, db, GoogleAuthProvider, ref, get } from '../firebase'; 
import AnimatedPage from '../components/AnimatedPage';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, authLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      navigate('/about');
    }
  }, [user, authLoading, navigate]);

  const handlePostSignIn = async (user: User) => {
    if (user) {
      // Check if user data exists in the database
      const userRef = ref(db, `Users/${user.uid}`); 
      const snapshot = await get(userRef); 

      if (snapshot.exists()) {
        // User exists, redirect to About page as requested
        navigate('/about');
      } else {
        // New user, redirect to profile setup
        navigate('/profile-setup');
      }
    }
  };

  const handleGoogleSignIn = async () => {
    if (!GoogleAuthProvider) {
        setError("Google Sign-In is not currently available.");
        return;
    }
    const provider = new GoogleAuthProvider();
    try {
      setLoading(true);
      setError(null);
      const result = await signInWithPopup(auth, provider); 
      await handlePostSignIn(result.user);
      // Note: We intentionally do NOT set loading(false) here to prevent the form 
      // from flashing back into view before the redirect happens.
    } catch (err: any) {
      console.error(err);
      setError('Failed to sign in with Google. Please try again.');
      setLoading(false); // Only turn off loading on error
    }
  };

  // If we are checking auth status, show loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-primary">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If user is already logged in, we are redirecting (handled by useEffect), so show nothing or loading
  if (user) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 text-primary">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      );
  }

  return (
    <AnimatedPage>
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center bg-slate-900 p-4">
        <motion.div
          className="max-w-md w-full bg-slate-800 p-8 rounded-xl shadow-lg"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <h1 className="text-3xl font-bold text-slate-100 mb-2 text-center">Welcome</h1>
          <p className="text-slate-400 mb-8 text-center">Continue with Google to get started.</p>

          {error && <p className="text-red-500 text-center mb-4">{error}</p>}

          <motion.button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-slate-700 border border-slate-600 text-slate-200 font-semibold py-3 px-6 rounded-lg hover:bg-slate-600 transition-colors duration-300 shadow-sm disabled:opacity-60"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-slate-200"></div>
            ) : (
                <>
                    <svg className="w-6 h-6" viewBox="0 0 48 48">
                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                        <path fill="none" d="M0 0h48v48H0z"></path>
                    </svg>
                    <span>Continue with Google</span>
                </>
            )}
          </motion.button>
        </motion.div>
      </div>
    </AnimatedPage>
  );
};

export default LoginPage;