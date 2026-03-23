import React, { useState } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
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
  FaChevronUp,
} from "react-icons/fa";

const Sidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth > 768);
  const [expandedMenus, setExpandedMenus] = useState(() => {
    const initExpanded = {};
    if (window.location.pathname.startsWith("/orders")) {
      initExpanded["Orders"] = true;
    }
    if (window.location.pathname.startsWith("/tools")) {
      initExpanded["Tools"] = true;
    }
    if (window.location.pathname.startsWith("/finance")) {
      initExpanded["Finance"] = true;
    }
    if (window.location.pathname.startsWith("/settings")) {
      initExpanded["Settings"] = true;
    }
    return initExpanded;
  });

  // Toggle dropdown
  const toggleMenu = (name) => {
    setExpandedMenus((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  // Check if a path or any of its children are active
  const isPathActive = (path) => location.pathname.startsWith(path);

  // Nav links with optional children
  const navLinks = [
    { name: "Dashboard", path: "/dashboard", icon: FaTachometerAlt },
    { name: "New Orders", path: "/new-orders", icon: FaClipboardList },
    {
      name: "Processing Order",
      path: "/processing-order",
      icon: FaClipboardList,
    },
    {
      name: "Orders",
      path: "/orders",
      icon: FaBoxOpen,
      children: [
        { name: "All Orders", path: "/orders/all" },
        { name: "Manifested", path: "/orders/manifested" },
        { name: "Pending", path: "/orders/pending" },
        { name: "In Transit order", path: "/orders/in-transit" },
        { name: "Not Picked", path: "/orders/not-picked" },
        { name: "NDR", path: "/orders/ndr" },
        { name: "Out of Delivery", path: "/orders/out-of-delivery" },
        { name: "Delivery", path: "/orders/delivery" },
        { name: "RTO In Transit", path: "/orders/rto-in-transit" },
        { name: "RTO Delivery", path: "/orders/rto-delivery" },
        { name: "Return", path: "/orders/return" },
        { name: "Cancelled", path: "/orders/cancelled" },
      ],
    },
    {
      name: "Tools",
      path: "/tools",
      icon: FaTools,
      children: [
        { name: "Serviceable Pincode", path: "/tools/serviceable-pincode" },
        { name: "Rate Calculator", path: "/tools/rate-calculator" },
        { name: "Channel Integration", path: "/tools/channel-integration" },
      ],
    },
    {
      name: "Finance",
      path: "/finance",
      icon: FaMoneyCheckAlt,
      children: [
        { name: "Wallet", path: "/finance/wallet" },
        { name: "COD Remittance", path: "/finance/cod-remittance" },
        { name: "Invoices", path: "/finance/invoices" },
      ],
    },
    { name: "Consignees", path: "/consignees", icon: FaUsers },
    { name: "Tickets", path: "/tickets", icon: FaTicketAlt },
    { name: "Reports", path: "/reports", icon: FaChartBar },
    {
      name: "Settings",
      path: "/settings",
      icon: FaCog,
      children: [
        { name: "General Details", path: "/settings/general-details" },
        { name: "Change Password", path: "/settings/change-password" },
        { name: "Pickup Address", path: "/settings/pickup-address" },
        { name: "RTO Address", path: "/settings/rto-address" },
        { name: "Label Settings", path: "/settings/label-settings" },
        { name: "KYC", path: "/settings/kyc" },
      ],
    },
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
            absolute md:relative z-50 h-full md:h-auto
            ${
              sidebarOpen
                ? "w-[250px] translate-x-0"
                : "w-0 md:w-[78px] -translate-x-full md:translate-x-0 border-r-0 md:border-r"
            }
          `}
        >
          <div className="overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <nav className="py-1">
              {navLinks.map((link) => {
                const hasChildren = link.children && link.children.length > 0;
                const isExpanded = expandedMenus[link.name];
                const isActive = hasChildren
                  ? isPathActive(link.path)
                  : location.pathname === link.path;

                return (
                  <div key={link.path}>
                    {/* Main nav item */}
                    {hasChildren ? (
                      <button
                        onClick={() => {
                          toggleMenu(link.name);
                          if (!isExpanded) {
                            navigate(link.children[0].path);
                          }
                        }}
                        className={`
                                                    w-full mx-2 my-1 flex items-center rounded-md
                                                    transition-all duration-200
                                                    ${
                                                      isActive
                                                        ? "bg-[#d4af26] text-white"
                                                        : "text-[var(--color-text-secondary)] hover:bg-black/5 dark:hover:bg-white/5 hover:text-[var(--color-text-primary)]"
                                                    }
                                                    ${sidebarOpen ? "justify-between px-3 py-2.5" : "justify-center px-2 py-3"}
                                                `}
                      >
                        <div
                          className={`flex items-center ${sidebarOpen ? "gap-3" : "justify-center"}`}
                        >
                          <link.icon
                            className={`text-sm flex-shrink-0 ${isActive ? "text-white" : "text-inherit"}`}
                          />
                          <span
                            className={`text-[12px] whitespace-nowrap overflow-hidden transition-all duration-300 ${sidebarOpen ? "w-auto opacity-100" : "w-0 opacity-0"}`}
                          >
                            {link.name}
                          </span>
                        </div>
                        {sidebarOpen &&
                          (isExpanded ? (
                            <FaChevronUp className="text-[10px] opacity-80" />
                          ) : (
                            <FaChevronDown className="text-[10px] opacity-80" />
                          ))}
                      </button>
                    ) : (
                      <NavLink
                        to={link.path}
                        className={({ isActive: navIsActive }) => `
                                                    mx-2 my-1 flex items-center rounded-md
                                                    transition-all duration-200
                                                    ${
                                                      navIsActive
                                                        ? "bg-[#d4af26] text-white"
                                                        : "text-[var(--color-text-secondary)] hover:bg-black/5 dark:hover:bg-white/5 hover:text-[var(--color-text-primary)]"
                                                    }
                                                    ${sidebarOpen ? "justify-between px-3 py-2.5" : "justify-center px-2 py-3"}
                                                `}
                      >
                        {({ isActive: navIsActive }) => (
                          <>
                            <div
                              className={`flex items-center ${sidebarOpen ? "gap-3" : "justify-center"}`}
                            >
                              <link.icon
                                className={`text-sm flex-shrink-0 ${navIsActive ? "text-white" : "text-inherit"}`}
                              />
                              <span
                                className={`text-[12px] whitespace-nowrap overflow-hidden transition-all duration-300 ${sidebarOpen ? "w-auto opacity-100" : "w-0 opacity-0"}`}
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
                    )}

                    {/* Dropdown children */}
                    {hasChildren && isExpanded && sidebarOpen && (
                      <div className="ml-4 mr-2 border-l border-[var(--color-border)] pl-2">
                        {link.children.map((child) => {
                          const childActive = location.pathname === child.path;
                          return (
                            <NavLink
                              key={child.path}
                              to={child.path}
                              className={`
                                                                block py-1.5 pl-3 pr-2 my-0.5 rounded-md text-[11px]
                                                                transition-colors duration-200
                                                                ${
                                                                  childActive
                                                                    ? "text-[#d4af26] font-semibold"
                                                                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                                                                }
                                                            `}
                            >
                              <span className="flex items-center gap-2">
                                <span
                                  className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                                    childActive
                                      ? "bg-[#d4af26]"
                                      : "border border-[var(--color-text-secondary)]"
                                  }`}
                                />
                                {child.name}
                              </span>
                            </NavLink>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
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
                className={`flex items-center ${sidebarOpen ? "gap-3" : "justify-center"}`}
              >
                <FaSignOutAlt className="text-sm flex-shrink-0" />
                <span
                  className={`text-[12px] whitespace-nowrap overflow-hidden transition-all duration-300 ${sidebarOpen ? "w-auto opacity-100" : "w-0 opacity-0"}`}
                >
                  Log Out
                </span>
              </div>
            </button>
          </div>
        </aside>

        {/* Mobile Backdrop */}
        {sidebarOpen && (
          <div
            className="md:hidden absolute inset-0 z-40 bg-black/50 backdrop-blur-[2px]"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 min-w-0 overflow-y-auto bg-[var(--color-bg-main)] transition-colors duration-300">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Sidebar;
