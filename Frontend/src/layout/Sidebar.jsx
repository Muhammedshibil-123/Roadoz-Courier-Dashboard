import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../redux/authSlice';
import api from '../lib/axios';
import { setAccessToken } from '../lib/axios';

// Sidebar Icons
import {
  FaTachometerAlt, FaUserFriends, FaLayerGroup, FaClipboardList,
  FaBoxOpen, FaStoreAlt, FaMoneyCheckAlt, FaCog, FaSignOutAlt
} from 'react-icons/fa';

// Header Icons
import { MdSearch, MdNotificationsNone, MdKeyboardArrowDown } from 'react-icons/md';

const Sidebar = () => {
  const dispatch   = useDispatch();
  const navigate   = useNavigate();

  // ── Nav links ──────────────────────────────────────────────────────────────
  const navLinks = [
    { name: 'Dashboard',    path: '/dashboard',    icon: FaTachometerAlt },
    { name: 'Users',        path: '/users',        icon: FaUserFriends   },
    { name: 'Categories',   path: '/categories',   icon: FaLayerGroup    },
    { name: 'Waitlist',     path: '/waitlist',     icon: FaClipboardList },
    { name: 'Orders',       path: '/orders',       icon: FaBoxOpen       },
    { name: 'Stores',       path: '/stores',       icon: FaStoreAlt      },
    { name: 'Transactions', path: '/transactions', icon: FaMoneyCheckAlt },
    { name: 'Settings',     path: '/settings',     icon: FaCog           },
  ];

  // ── Logout ─────────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    try {
      await api.post('/api/auth/logout/', {}, { skipLoading: true });
    } catch {
      // swallow — we log out client-side regardless
    } finally {
      setAccessToken(null);
      dispatch(logout());
      navigate('/login', { replace: true });
    }
  };

  // ── Styles ─────────────────────────────────────────────────────────────────
  const activeClass  = 'bg-[#1f293a] text-[#f97316] font-medium border-l-4 border-[#f97316]';
  const normalClass  = 'text-gray-300 hover:bg-[#1f293a] hover:text-[#f97316]';

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-inter">

      {/* ── TOP HEADER ────────────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 w-full h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 z-20">

        {/* Brand */}
        <div className="flex items-center space-x-3 w-64">
          <div className="text-[#f97316] text-2xl font-bold tracking-tight">roadoz</div>
        </div>

        {/* Search */}
        <div className="relative flex items-center w-full max-w-md ml-6">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
          <input
            type="search"
            placeholder="Search for orders, stores, users"
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm
                       focus:outline-none focus:ring-1 focus:ring-[#f97316] focus:border-[#f97316]"
          />
        </div>

        {/* Profile + notifications */}
        <div className="flex items-center space-x-6">
          <button className="text-gray-500 hover:text-[#f97316] transition-colors">
            <MdNotificationsNone className="text-2xl" />
          </button>
          <div className="flex items-center space-x-3 cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-600">
              NK
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-900 leading-tight">Nikhil K</span>
              <span className="text-xs text-gray-500">Superadmin</span>
            </div>
            <MdKeyboardArrowDown className="text-gray-400 text-xl" />
          </div>
        </div>
      </header>

      <div className="flex pt-16">

        {/* ── LEFT SIDEBAR ──────────────────────────────────────────────────── */}
        <aside className="w-64 h-[calc(100vh-4rem)] bg-[#0d1b2a] border-r border-[#1e293b]
                          flex flex-col justify-between py-5 fixed left-0 top-16 z-10">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-6 py-3 transition-colors
                   ${isActive ? activeClass : normalClass}`
                }
              >
                <link.icon className="text-xl flex-shrink-0" />
                <span>{link.name}</span>
              </NavLink>
            ))}
          </nav>

          <div className="px-6">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 w-full px-4 py-2 bg-transparent
                         text-gray-300 hover:text-red-500 transition-colors"
            >
              <FaSignOutAlt className="text-xl" />
              <span>Log out</span>
            </button>
          </div>
        </aside>

        {/* ── PAGE CONTENT (Outlet renders the matched child route) ─────────── */}
        <main className="flex-1 ml-64 p-0 bg-gray-50 min-h-[calc(100vh-4rem)]">
          <Outlet />
        </main>

      </div>
    </div>
  );
};

export default Sidebar;