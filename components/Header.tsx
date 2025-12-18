
import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { signOut } from 'firebase/auth'; 
import { auth, db, ref, get } from '../firebase'; // Import db and ref, get for fetching profile pic
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../hooks/useTheme';

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, authLoading, isAdmin, isAdminLoading } = useAuth(); // Destructure isAdmin and isAdminLoading
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme(); 
  
  // State for header profile picture
  const [headerProfilePic, setHeaderProfilePic] = useState<string | null>(null);
  const [headerPicLoading, setHeaderPicLoading] = useState(true);

  // Fetch user's profile picture for the header
  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (user) {
      const fetchPic = async () => {
        setHeaderPicLoading(true);
        try {
          const userRef = ref(db, `Users/${user.uid}`); 
          const snapshot = await get(userRef); 
          if (snapshot.exists()) {
            const data = snapshot.val();
            setHeaderProfilePic(data.picBase64 || null);
          } else {
            setHeaderProfilePic(null); // No profile pic found
          }
        } catch (err) {
          console.error("Failed to fetch header profile pic:", err);
          setHeaderProfilePic(null);
        } finally {
          setHeaderPicLoading(false);
        }
      };
      fetchPic();
    } else {
      setHeaderProfilePic(null);
      setHeaderPicLoading(false);
    }
  }, [user, authLoading]);


  const handleLogout = async () => {
    try {
      await signOut(auth); 
      setIsOpen(false);
      navigate('/');
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  const closeMenu = () => setIsOpen(false);
  
  // Dynamically build the list of all links for the sidebar in the desired order
  const allLinks = [
    { to: '/', text: 'Home', icon: 'fas fa-home' },
    { to: '/about', text: 'About', icon: 'fas fa-info-circle' },
  ];

  if (user) {
    allLinks.push({ to: '/build-chat', text: 'Build Website & Chat', icon: 'fas fa-comments' });
    allLinks.push({ to: '/profile', text: 'Profile', icon: 'fas fa-user' });
  }

  allLinks.push({ to: '/docs', text: 'Docs', icon: 'fas fa-book' });
  allLinks.push({ to: '/support', text: 'Support', icon: 'fas fa-headset' });


  if (user && isAdmin) {
    allLinks.push({ to: '/admin', text: 'Admin Panel', icon: 'fas fa-user-shield' });
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-800 shadow-sm border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand Logo */}
          <div className="flex-shrink-0 flex items-center">
            <NavLink 
                to="/" 
                className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary tracking-tight" 
                onClick={closeMenu}
            >
              Build By Prohor
            </NavLink>
          </div>

          <div className="flex items-center gap-4"> {/* Added gap for spacing between new elements and menu */}
            {/* Login Button / Profile Picture in Toolbar */}
            {!authLoading && (
                user ? (
                    <NavLink to="/profile" onClick={closeMenu} aria-label="View Profile">
                        {headerPicLoading ? (
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                        ) : (
                            <img 
                                src={headerProfilePic || 'https://via.placeholder.com/150'} 
                                alt="Profile" 
                                className="w-9 h-9 rounded-full object-cover ring-2 ring-primary/30"
                                onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/150')} // Fallback image
                            />
                        )}
                    </NavLink>
                ) : (
                    <NavLink 
                        to="/login" 
                        onClick={closeMenu} 
                        className="text-primary hover:text-primary-dark transition-colors flex items-center gap-2 px-3 py-1 rounded-md text-sm font-bold"
                        aria-label="Login"
                    >
                        <i className="fas fa-sign-in-alt text-lg"></i>
                        <span>Login</span>
                    </NavLink>
                )
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-200 hover:text-primary focus:outline-none p-2"
              aria-label="Toggle menu"
            >
              <i className={`fas ${isOpen ? 'fa-times' : 'fa-bars'} text-2xl`}></i>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/60 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            {/* Sidebar */}
            <motion.div 
              className="fixed top-0 left-0 h-full w-72 bg-slate-800 shadow-xl z-50 flex flex-col"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              {/* Sidebar Header */}
              <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                  <h3 className="text-xl font-bold text-primary">Menu</h3>
                  <button onClick={closeMenu} className="text-gray-200 hover:text-primary" aria-label="Close menu">
                      <i className="fas fa-times text-2xl"></i>
                  </button>
              </div>
              
              {/* Navigation Links */}
              <div className="flex-grow p-4 space-y-2">
                {allLinks.map(link => (
                  <MobileNavLink key={link.to} to={link.to} icon={link.icon} onClick={closeMenu}>
                    {link.text}
                  </MobileNavLink>
                ))}
              </div>

              {/* Logout Button (Only if logged in) */}
              {!authLoading && user && (
                  <div className="p-4 border-t border-slate-700">
                      <button
                          onClick={handleLogout}
                          className="w-full text-left flex items-center gap-4 px-3 py-3 rounded-md text-base font-medium text-red-500 hover:bg-red-50 hover:bg-red-500/10 transition-colors"
                      >
                          <i className="fas fa-sign-out-alt w-6 text-center text-lg"></i>
                          <span>Logout</span>
                      </button>
                  </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};

interface MobileNavLinkProps {
    to: string;
    children: React.ReactNode;
    icon: string;
    onClick: () => void;
}

const MobileNavLink: React.FC<MobileNavLinkProps> = ({ to, children, icon, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      `flex items-center gap-4 px-3 py-3 rounded-md text-base font-bold transition-colors border-l-4 ${
        isActive
          ? 'border-primary text-primary bg-slate-700/50'
          : 'border-transparent text-slate-300 hover:text-white hover:bg-slate-700'
      }`
    }
  >
    <i className={`${icon} w-6 text-center text-lg`}></i>
    <span>{children}</span>
  </NavLink>
);

export default Header;
