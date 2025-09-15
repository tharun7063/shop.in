import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faXmark, faShoppingCart, faEllipsisV, faUser } from "@fortawesome/free-solid-svg-icons";
import { NavLink, Link, useLocation } from "react-router-dom";
import logo from "../assets/logo.svg";
import useStore from "../store/useStore";

const navLinks = [
  { title: "Home", url: "/" },
  { title: "Products", url: "/products" },
  { title: "Categories", url: "/categories" },
];

export default function Navbar() {
  const { user } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const location = useLocation();

  // Sidebar paths for active profile highlighting
  const sidebarPaths = ["/account", "/orders", "/payments", "/wishlist"];
  const isProfileActive = user && sidebarPaths.some((path) =>
    location.pathname.startsWith(path)
  );

  return (
    <nav className="bg-white shadow-md fixed w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex-shrink-0">
            <NavLink to="/">
              <img src={logo} alt="MyBrand Logo" className="h-20 w-auto" />
            </NavLink>
          </div>

          {/* Center Menu */}
          <div className="hidden md:flex flex-1 justify-center space-x-6">
            {navLinks.map((link) => (
              <NavLink
                key={link.title}
                to={link.url}
                className={({ isActive }) =>
                  isActive
                    ? "text-blue-600 font-semibold"
                    : "text-gray-700 hover:text-blue-600"
                }
              >
                {link.title}
              </NavLink>
            ))}
          </div>

          {/* Right Side */}
          <div className="hidden md:flex items-center space-x-10">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="px-3 py-1 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Cart */}
            <NavLink
              to="/cart"
              className={({ isActive }) =>
                isActive ? "text-blue-600" : "text-gray-700 hover:text-blue-600"
              }
            >
              <FontAwesomeIcon icon={faShoppingCart} size="lg" />
            </NavLink>

            {/* Profile */}
            <NavLink
              to={user ? "/account" : "/login"}
              className={() =>
                isProfileActive
                  ? "text-blue-600"
                  : "text-gray-700 hover:text-blue-600"
              }
            >
              <FontAwesomeIcon icon={faUser} size="lg" />
            </NavLink>

            {/* More Options */}
            <button className="text-gray-700 hover:text-blue-600">
              <FontAwesomeIcon icon={faEllipsisV} size="lg" />
            </button>
          </div>

          {/* Mobile Hamburger */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-blue-600 focus:outline-none"
            >
              <FontAwesomeIcon icon={isOpen ? faXmark : faBars} size="lg" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Slide-in Menu */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="p-4 flex flex-col space-y-4">
          {navLinks.map((link) => (
            <NavLink
              key={link.title}
              to={link.url}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                isActive
                  ? "text-blue-600 font-semibold"
                  : "text-gray-700 hover:text-blue-600"
              }
            >
              {link.title}
            </NavLink>
          ))}

          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Mobile Icons */}
          <div className="flex items-center space-x-4 mt-2">
            <Link to="/cart" className="text-gray-700 hover:text-blue-600">
              <FontAwesomeIcon icon={faShoppingCart} size="lg" />
            </Link>
            <Link to={user ? "/account" : "/login"} className="text-gray-700 hover:text-blue-600">
              <FontAwesomeIcon icon={faUser} size="lg" />
            </Link>
            <FontAwesomeIcon icon={faEllipsisV} className="text-gray-700 hover:text-blue-600" size="lg" />
          </div>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black opacity-30"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </nav>
  );
}
