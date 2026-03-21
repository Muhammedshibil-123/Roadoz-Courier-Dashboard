import React, { useState } from 'react';
import { MdNotificationsNone, MdSearch, MdDarkMode } from 'react-icons/md';
import { FaBars } from 'react-icons/fa';
import logo from '../assets/images/logo.png';

const Navbar = () => {
  const [balance] = useState(689);
  const [isOnline, setIsOnline] = useState(false);

  return (
    <nav className="
      w-full h-16 flex-shrink-0
      bg-[#0d1b2a] border-b border-[#1e293b]
      flex items-center justify-between
      px-4 sm:px-6
    ">

      {/* Left: Logo + hamburger */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <img
            src={logo}
            alt="Roadoz"
            className="w-8 h-8 object-contain flex-shrink-0"
          />
          <span className="text-[#f5b800] font-bold text-sm tracking-widest uppercase hidden sm:block">
            Roadoz
          </span>
        </div>
        <button className="text-gray-400 hover:text-white transition-colors p-1 rounded">
          <FaBars className="text-base" />
        </button>
      </div>

      {/* Right: Actions + icons */}
      <div className="flex items-center gap-2 sm:gap-3">

        {/* Import orders */}
        <button className="
          bg-[#f5b800] hover:bg-[#d4a000] active:scale-95
          text-[#0d1b2a] font-semibold text-sm
          px-4 py-1.5 rounded-md transition-all whitespace-nowrap
        ">
          Import orders
        </button>

        {/* Online toggle */}
        <button
          onClick={() => setIsOnline((v) => !v)}
          className={`
            relative w-11 h-6 rounded-full transition-colors duration-300 flex-shrink-0
            ${isOnline ? 'bg-[#f5b800]' : 'bg-gray-600'}
          `}
          title={isOnline ? 'Online' : 'Offline'}
        >
          <span
            className={`
              absolute top-0.5 w-5 h-5 bg-white rounded-full shadow
              transition-transform duration-300
              ${isOnline ? 'translate-x-5' : 'translate-x-0.5'}
            `}
          />
        </button>

        {/* Balance chip */}
        <div className="flex items-center gap-2 border border-[#f5b800]/40 rounded-md px-3 py-1.5 flex-shrink-0">
          <span className="text-white text-sm font-medium">₹ {balance}</span>
          <button
            className="
              w-5 h-5 bg-[#f5b800] hover:bg-[#d4a000]
              rounded-full text-[#0d1b2a] font-bold text-sm
              flex items-center justify-center leading-none transition-colors
            "
            title="Add balance"
          >
            +
          </button>
        </div>

        {/* Icons */}
        <div className="flex items-center">
          <button className="p-2 text-gray-400 hover:text-white transition-colors rounded hover:bg-white/5">
            <MdNotificationsNone className="text-xl" />
          </button>
          <button className="p-2 text-gray-400 hover:text-white transition-colors rounded hover:bg-white/5">
            <MdSearch className="text-xl" />
          </button>
          <button className="p-2 text-gray-400 hover:text-white transition-colors rounded hover:bg-white/5">
            <MdDarkMode className="text-xl" />
          </button>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;