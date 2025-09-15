import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import useStore from "../store/useStore";

export default function SidebarLayout() {
  const { user, logout } = useStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // Clear user from store and localStorage
    navigate("/"); // Redirect to home page
  };

  return (
    <div className="flex max-w-6xl mx-auto mt-6 bg-white border rounded-lg shadow-md relative">
      {/* Mobile Hamburger */}
      <button
        className="absolute top-4 left-4 md:hidden z-30 p-2 bg-gray-100 rounded"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-gray-800"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          {sidebarOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {/* Dark overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static top-0 left-0 h-full md:h-auto w-64 bg-white border-r p-4 space-y-4 transform transition-transform duration-300 z-30
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        <div className="flex items-center mb-6 space-x-4">
          <img
            src={user?.avatar || "https://avatar.iran.liara.run/public"}
            alt="User Avatar"
            className="w-16 h-16 rounded-full object-cover"
          />
          <div className="flex flex-col max-w-[160px] overflow-hidden">
            <p className="font-semibold truncate">{user?.name || "Hello"}</p>
            <p className="text-sm text-gray-500 truncate">
              {user?.email || "user@example.com"}
            </p>
          </div>
        </div>

        <nav className="space-y-2">
          <NavLink to="/account" className="block px-3 py-2 rounded hover:bg-gray-100">
            My Account
          </NavLink>
          <NavLink to="/orders" className="block px-3 py-2 rounded hover:bg-gray-100">
            My Orders
          </NavLink>
          <NavLink to="/payments" className="block px-3 py-2 rounded hover:bg-gray-100">
            My Payments
          </NavLink>
          <NavLink to="/wishlist" className="block px-3 py-2 rounded hover:bg-gray-100">
            My Wishlist
          </NavLink>
        </nav>

        <button
          onClick={handleLogout}
          className="mt-6 w-full bg-red-600 text-white py-2 rounded hover:bg-red-700"
        >
          Logout
        </button>
      </aside>

      {/* Content area */}
      <main className="flex-1 p-6 md:ml-0 ml-0">
        <Outlet />
      </main>
    </div>
  );
}
