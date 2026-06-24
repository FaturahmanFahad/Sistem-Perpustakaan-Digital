import { useState, useEffect } from 'react';

export function useTheme() {
  // Read theme state from localStorage, defaulting to 'dark'
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme ? savedTheme : 'dark';
  });

  // Apply corresponding CSS class to the root document Element
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove existing themes
    root.classList.remove('light', 'dark');
    
    // Add active theme class
    root.classList.add(theme);
    
    // Persist to localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Toggle utility function
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  return { theme, toggleTheme };
}

export default useTheme;
