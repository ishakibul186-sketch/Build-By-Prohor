
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark'; // Still define types but effectively only use 'dark'

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void; // Keep for API consistency, but it will be a no-op
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Always initialize theme to 'dark'
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    const root = window.document.documentElement;
    // Always add 'dark' class
    root.classList.add('dark');
    // Ensure light class is never present if it somehow got there
    root.classList.remove('light');
    localStorage.setItem('theme', 'dark'); // Persist dark mode preference
  }, [theme]); // Depend on theme, though it's effectively constant

  // The toggleTheme function will now be a no-op as the theme is fixed to 'dark'
  const toggleTheme = () => {
    // No operation, theme is fixed to dark
    console.warn("Theme toggle attempted, but theme is fixed to 'dark' mode.");
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};