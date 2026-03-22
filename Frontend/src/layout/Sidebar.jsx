import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../redux/authSlice";
import api, { setAccessToken } from "../lib/axios";
import Navbar from "./Navbar";

import {
    FaTachometerAlt,
    FaClipboardList,
    FaBoxOpen,
    FaTools,
    FaMoneyCheckAlt,
    FaUsers,
    FaTicketAlt,
    FaChartBar,
    FaCog,
    FaSignOutAlt,
    FaChevronDown,
} from "react-icons/fa";

const Sidebar = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [sidebarOpen, setSidebarOpen] = useState(true);

    const navLinks = [
        { name: "Dashboard", path: "/dashboard", icon: FaTachometerAlt },
        { name: "New Orders", path: "/new-orders", icon: FaClipboardList },
        { name: "Processing Order", path: "/processing-order", icon: FaClipboardList },
        { name: "Orders", path: "/orders", icon: FaBoxOpen, arrow: true },
        { name: "Tools", path: "/tools", icon: FaTools, arrow: true },
        { name: "Finance", path: "/finance", icon: FaMoneyCheckAlt, arrow: true },
        { name: "Consignees", path: "/consignees", icon: FaUsers },
        { name: "Tickets", path: "/tickets", icon: FaTicketAlt },
        { name: "Reports", path: "/reports", icon: FaChartBar },
        { name: "Settings", path: "/settings", icon: FaCog, arrow: true },
    ];

    const handleLogout = async () => {
        try {
            await api.post("/api/auth/logout/", {}, { skipLoading: true });
        } catch {
            // ignore
        } finally {
            setAccessToken(null);
            dispatch(logout());
            navigate("/login", { replace: true });
        }
    };

    return (
        <div className="flex h-screen flex-col overflow-hidden bg-[var(--color-bg-main)] transition-colors duration-300">
            <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

            <div className="flex flex-1 min-h-0">
                {/* Sidebar */}
                <aside
                    className={`
            bg-[var(--color-bg-surface)] border-r border-[var(--color-border)]
            flex flex-col justify-between overflow-hidden
            transition-all duration-300 ease-in-out
            ${sidebarOpen ? "w-[250px]" : "w-[78px]"}
          `}
                >
                    <div>
                        <nav className="py-1">
                            {navLinks.map((link) => (
                                <NavLink
                                    key={link.path}
                                    to={link.path}
                                    className={({ isActive }) =>
                                        `
                    mx-2 my-1 flex items-center rounded-md
                    transition-all duration-200
                    ${isActive
                                            ? "bg-[#d4af26] text-white" // Keeping the brand gold for active items
                                            : "text-[var(--color-text-secondary)] hover:bg-black/5 dark:hover:bg-white/5 hover:text-[var(--color-text-primary)]"
                                        }
                    ${sidebarOpen ? "justify-between px-3 py-2.5" : "justify-center px-2 py-3"}
                  `
                                    }
                                >
                                    {({ isActive }) => (
                                        <>
                                            <div
                                                className={`flex items-center ${sidebarOpen ? "gap-3" : "justify-center"
                                                    }`}
                                            >
                                                <link.icon
                                                    className={`text-sm flex-shrink-0 ${isActive ? "text-white" : "text-inherit"
                                                        }`}
                                                />
                                                <span
                                                    className={`
                            text-[12px] whitespace-nowrap overflow-hidden
                            transition-all duration-300
                            ${sidebarOpen ? "w-auto opacity-100" : "w-0 opacity-0"}
                          `}
                                                >
                                                    {link.name}
                                                </span>
                                            </div>

                                            {link.arrow && sidebarOpen && (
                                                <FaChevronDown className="text-[10px] opacity-80" />
                                            )}
                                        </>
                                    )}
                                </NavLink>
                            ))}
                        </nav>
                    </div>

                    <div className="border-t border-[var(--color-border)] p-2 transition-colors duration-300">
                        <button
                            onClick={handleLogout}
                            className={`
                w-full rounded-md text-left transition-all duration-200
                text-[var(--color-text-secondary)] hover:bg-black/5 dark:hover:bg-white/5 hover:text-red-500 dark:hover:text-red-400
                ${sidebarOpen ? "px-3 py-2.5" : "px-2 py-3 flex justify-center"}
              `}
                        >
                            <div
                                className={`flex items-center ${sidebarOpen ? "gap-3" : "justify-center"
                                    }`}
                            >
                                <FaSignOutAlt className="text-sm flex-shrink-0" />
                                <span
                                    className={`
                    text-[12px] whitespace-nowrap overflow-hidden
                    transition-all duration-300
                    ${sidebarOpen ? "w-auto opacity-100" : "w-0 opacity-0"}
                  `}
                                >
                                    Log Out
                                </span>
                            </div>
                        </button>
                    </div>
                </aside>

                {/* Main content */}
                <main className="flex-1 min-w-0 overflow-y-auto bg-[var(--color-bg-main)] transition-colors duration-300">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Sidebar;