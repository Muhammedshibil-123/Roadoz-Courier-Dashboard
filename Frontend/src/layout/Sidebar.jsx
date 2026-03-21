import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../redux/authSlice';
import api, { setAccessToken } from '../lib/axios';
import Navbar from './Navbar';

import {
  FaTachometerAlt, FaUserFriends, FaLayerGroup, FaClipboardList,
  FaBoxOpen, FaStoreAlt, FaMoneyCheckAlt, FaCog, FaSignOutAlt,
} from 'react-icons/fa';

const Sidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

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

  const handleLogout = async () => {
    try {
      await api.post('/api/auth/logout/', {}, { skipLoading: true });
    } catch {
      // swallow
    } finally {
      setAccessToken(null);
      dispatch(logout());
      navigate('/login', { replace: true });
    }
  };

  return (
    /*
      Full-screen dark shell.
      Column: [Navbar full-width] / [Row: Sidebar | Content]
    */
    <div className="flex flex-col h-screen bg-[#0d1b2a] overflow-hidden">

      {/* ── NAVBAR — full width at the very top ───────────────────────── */}
      <Navbar />

      {/* ── BODY ROW ──────────────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0">

        {/* ── SIDEBAR ─────────────────────────────────────────────────── */}
        <aside className="
          w-64 flex-shrink-0
          bg-[#0d1b2a] border-r border-[#1e293b]
          flex flex-col justify-between
          overflow-y-auto
        ">
          <nav className="flex flex-col space-y-0.5 py-3">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-5 py-3 text-sm transition-colors
                   ${isActive
                     ? 'bg-[#1f293a] text-[#f5b800] font-medium border-l-4 border-[#f5b800]'
                     : 'text-gray-400 hover:bg-[#1a2638] hover:text-[#f5b800]'
                   }`
                }
              >
                <link.icon className="text-base flex-shrink-0" />
                <span>{link.name}</span>
              </NavLink>
            ))}
          </nav>

          <div className="px-5 py-4 border-t border-[#1e293b]">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-md
                         text-sm text-gray-400 hover:text-red-400 hover:bg-[#1a2638]
                         transition-colors"
            >
              <FaSignOutAlt className="text-base flex-shrink-0" />
              <span>Log out</span>
            </button>
          </div>
        </aside>

        {/* ── PAGE CONTENT ─────────────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto bg-[#0f1f35]">
          <Outlet />
        </main>

      </div>
    </div>
  );
};

export default Sidebar;