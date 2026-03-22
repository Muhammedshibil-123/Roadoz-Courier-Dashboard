import React, { useState, useEffect } from "react";
// 1. Import MdLightMode for the icon swap
import { MdNotificationsNone, MdSearch, MdDarkMode, MdLightMode } from "react-icons/md";
import { FaBars } from "react-icons/fa";
import logo from "../assets/images/logo.png";

import { useNavigate } from "react-router-dom";
import api from "../lib/axios";

const Navbar = ({ sidebarOpen, setSidebarOpen }) => {
    const [balance, setBalance] = useState(0);
    const [isOnline, setIsOnline] = useState(false);
    
    // 2. Add state for Dark Mode
    const [isDarkMode, setIsDarkMode] = useState(false);
    const navigate = useNavigate();

    // 3. Check for existing theme preference on initial load
    useEffect(() => {
        const fetchBalance = async () => {
            try {
                const res = await api.get('/api/finance/wallet/', { skipLoading: true });
                setBalance(res.data.balance);
            } catch (err) {
                console.error("Failed to fetch balance", err);
            }
        };
        fetchBalance();

        const savedTheme = localStorage.getItem("theme");
        if (savedTheme === "dark" || (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
            document.documentElement.classList.add("dark");
            setIsDarkMode(true);
        } else {
            document.documentElement.classList.remove("dark");
            setIsDarkMode(false);
        }
    }, []);

    // 4. Function to handle the toggle
    const toggleTheme = () => {
        if (isDarkMode) {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theme", "light");
            setIsDarkMode(false);
        } else {
            document.documentElement.classList.add("dark");
            localStorage.setItem("theme", "dark");
            setIsDarkMode(true);
        }
    };

    return (
        <nav
            className="
        h-16 w-full flex-shrink-0
        /* 5. Replaced hardcoded bg colors with your CSS variables */
        bg-[var(--color-bg-surface)] border-b border-[var(--color-border)]
        flex items-center justify-between
        px-4 md:px-6 transition-colors duration-300
      "
        >
            {/* Left */}
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">

                    <button
                        onClick={() => setSidebarOpen((prev) => !prev)}
                        className="
              p-2 rounded-md text-[#d4af26]
              hover:bg-black/10 dark:hover:bg-white/5 hover:text-[#f3cc44]
              transition-all duration-300
            "
                        aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
                    >
                        <FaBars className="text-lg" />
                    </button>
                    <img
                        src={logo}
                        alt="Roadoz"
                        className="w-14 h-14 object-contain flex-shrink-0"
                    />
                </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-2 sm:gap-3">
                <button
                    className="
            hidden sm:inline-flex
            bg-[#d4af26] hover:bg-[#c39f19]
            text-white font-medium text-xs sm:text-sm
            px-4 py-2 rounded-md transition-all duration-200
          "
                >
                    Import orders
                </button>

                {/* Online toggle */}
                <button
                    onClick={() => setIsOnline((v) => !v)}
                    className={`
            relative h-8 w-14 rounded-full transition-all duration-300
            ${isOnline ? "bg-[#d4af26]" : "bg-[#d1d5db]"}
          `}
                    title={isOnline ? "Online" : "Offline"}
                >
                    <span
                        className={`
              absolute top-1 h-6 w-6 rounded-full bg-white shadow-md transition-all duration-300
              ${isOnline ? "left-7" : "left-1"}
            `}
                    />
                </button>

                {/* Balance */}
                <div
                    className="
            flex items-center gap-2 rounded-full
            bg-gray-200 dark:bg-gray-700 px-2.5 py-1.5
            text-[var(--color-text-primary)] transition-colors duration-300
          "
                >
                    <span className="text-xs sm:text-sm font-medium">₹ {balance}</span>
                    <button
                        onClick={() => navigate('/finance/add-money')}
                        className="
              w-5 h-5 rounded-full bg-[#d4af26]
              text-white font-bold text-sm
              flex items-center justify-center
              hover:bg-[#c39f19] transition-colors
            "
                        title="Add balance"
                    >
                        +
                    </button>
                </div>

                {/* Icons */}
                <div className="flex items-center">
                    <button className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">
                        <MdNotificationsNone className="text-xl" />
                    </button>
                    <button className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">
                        <MdSearch className="text-xl" />
                    </button>
                    
                    {/* 6. Attach toggle function and dynamic icon */}
                    <button 
                      onClick={toggleTheme}
                      className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                    >
                        {isDarkMode ? <MdLightMode className="text-xl" /> : <MdDarkMode className="text-xl" />}
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;