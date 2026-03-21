import React, { useState, useEffect } from 'react';

const Navbar = () => {
  // Theme toggle state
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  // Apply the dark mode class to the HTML element when the state changes
  useEffect(() => {
    const htmlElement = document.documentElement;
    if (isDarkMode) {
      htmlElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      htmlElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <nav className="sticky top-0 z-50 w-full h-16 bg-surface border-b border-divider flex items-center justify-between px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      
      {/* Left side: Mobile menu button (optional) & Search */}
      <div className="flex items-center flex-1">
        <button className="mr-4 lg:hidden text-secondary hover:text-primary focus:outline-none">
          {/* Hamburger Icon */}
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>

        {/* Search Bar */}
        <div className="hidden sm:flex items-center w-full max-w-md relative">
          <svg className="w-5 h-5 text-secondary absolute left-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
          <input 
            type="text" 
            placeholder="Search orders, tracking numbers..." 
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-main border border-divider text-primary focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-colors"
          />
        </div>
      </div>

      {/* Right side: Theme Toggle, Notifications, Profile */}
      <div className="flex items-center space-x-4 sm:space-x-6">
        
        {/* Dark/Light Mode Toggle Button */}
        <button 
          onClick={toggleTheme} 
          className="p-2 rounded-full text-secondary hover:text-primary hover:bg-main transition-colors focus:outline-none"
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDarkMode ? (
            /* Sun Icon for Dark Mode */
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
            </svg>
          ) : (
            /* Moon Icon for Light Mode */
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
            </svg>
          )}
        </button>

        {/* Notifications */}
        <button className="relative p-2 rounded-full text-secondary hover:text-primary hover:bg-main transition-colors focus:outline-none">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
          </svg>
          {/* Notification Dot */}
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-surface"></span>
        </button>

        {/* Profile Dropdown (Static for now) */}
        <div className="flex items-center cursor-pointer space-x-2 border-l border-divider pl-4 sm:pl-6">
          <img 
            className="w-8 h-8 rounded-full object-cover" 
            src="https://ui-avatars.com/api/?name=Admin+User&background=3B82F6&color=fff" 
            alt="User profile" 
          />
          <div className="hidden md:block text-sm">
            <p className="text-primary font-medium leading-none">Admin User</p>
            <p className="text-secondary text-xs mt-1">Dispatcher</p>
          </div>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;