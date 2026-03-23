import React, { useState, useEffect } from "react";
import { MdNotificationsNone, MdDarkMode, MdLightMode } from "react-icons/md";
import { FaBars, FaUser } from "react-icons/fa";
import logo from "../assets/images/logo.png";

import { useNavigate } from "react-router-dom";
import api from "../lib/axios";

const Navbar = ({ sidebarOpen, setSidebarOpen }) => {
  const [balance, setBalance] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const res = await api.get("/api/finance/wallet/", {
          skipLoading: true,
        });
        setBalance(res.data.balance);
      } catch (err) {
        console.error("Failed to fetch balance", err);
      }
    };
    fetchBalance();

    // Fetch profile image
    const fetchProfile = async () => {
      try {
        const res = await api.get("/api/auth/settings/general/", {
          skipLoading: true,
        });
        if (res.data.profile_image_url) {
          const imgUrl = res.data.profile_image_url.startsWith("http")
            ? res.data.profile_image_url
            : `${import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"}${res.data.profile_image_url}`;
          setProfileImage(imgUrl);
        }
      } catch {
        // No profile yet
      }
    };
    fetchProfile();

    const savedTheme = localStorage.getItem("theme");
    if (
      savedTheme === "dark" ||
      (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      document.documentElement.classList.add("dark");
      setIsDarkMode(true);
    } else {
      document.documentElement.classList.remove("dark");
      setIsDarkMode(false);
    }
  }, []);

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
            onClick={() => navigate("/finance/add-money")}
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

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            {isDarkMode ? (
              <MdLightMode className="text-xl" />
            ) : (
              <MdDarkMode className="text-xl" />
            )}
          </button>
        </div>

        {/* Profile Picture */}
        <button
          onClick={() => navigate("/settings/general-details")}
          className="
            w-11 h-11 rounded-full overflow-hidden
            border-2 border-[var(--color-border)] hover:border-[#d4af26]
            transition-all duration-300 flex-shrink-0
            flex items-center justify-center
            bg-[var(--color-border)]/30
            cursor-pointer
          "
          title="Go to Settings"
        >
          {profileImage ? (
            <img
              src={profileImage}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <FaUser className="text-base text-[var(--color-text-secondary)]" />
          )}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
