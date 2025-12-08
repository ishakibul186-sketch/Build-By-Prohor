import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/'); // Redirect to home after logout
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  const navLinkClasses = ({ isActive }: { isActive: boolean }): string =>
    `block px-3 py-2 rounded-md text-base md:text-sm font-medium transition-colors duration-300 ${
      isActive
        ? 'bg-primary text-white'
        : 'text-dark-text hover:bg-primary/10 hover:text-primary'
    }`;

  return (
    <header className="bg-white/80 backdrop-blur-md shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <NavLink to="/" className="text-2xl font-bold text-primary">
              Build By Prohor
            </NavLink>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <NavLink to="/" className={navLinkClasses}>
                Home
              </NavLink>
              <NavLink to="/about" className={navLinkClasses}>
                About
              </NavLink>
              {!loading && (
                <>
                  {user ? (
                    <>
                      <NavLink to="/profile" className={navLinkClasses}>
                        Profile
                      </NavLink>
                      <button onClick={handleLogout} className="px-3 py-2 rounded-md text-sm font-medium text-dark-text hover:bg-red-500/10 hover:text-red-600 transition-colors">
                        Logout
                      </button>
                    </>
                  ) : (
                    <NavLink to="/login" className={navLinkClasses}>
                      Login
                    </NavLink>
                  )}
                </>
              )}
            </div>
          </div>
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-dark-text hover:text-white hover:bg-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {!isMenuOpen ? (
                <i className="fas fa-bars fa-fw"></i>
              ) : (
                <i className="fas fa-times fa-fw"></i>
              )}
            </button>
          </div>
        </div>
      </div>
      {isMenuOpen && (
        <div className="md:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <NavLink to="/" className={navLinkClasses} onClick={() => setIsMenuOpen(false)}>
              Home
            </NavLink>
            <NavLink to="/about" className={navLinkClasses} onClick={() => setIsMenuOpen(false)}>
              About
            </NavLink>
            {!loading && (
              <>
                {user ? (
                  <>
                    <NavLink to="/profile" className={navLinkClasses} onClick={() => setIsMenuOpen(false)}>
                      Profile
                    </NavLink>
                    <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-dark-text hover:bg-red-500/10 hover:text-red-600 transition-colors">
                      Logout
                    </button>
                  </>
                ) : (
                  <NavLink to="/login" className={navLinkClasses} onClick={() => setIsMenuOpen(false)}>
                    Login
                  </NavLink>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;