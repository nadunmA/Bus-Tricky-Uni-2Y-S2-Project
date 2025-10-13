import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BusIcon, MenuIcon, UserIcon, X, LogOutIcon } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <img
              src="/images/logo.png"
              alt="Bus Icon"
              className="h-12 w-auto max-w-60"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6">
            <Link to="/" className="hover:text-blue-200 font-medium">
              Home
            </Link>
            <Link to="/track-bus" className="hover:text-blue-200 font-medium">
              Track Bus
            </Link>
            <Link to="/book-seats" className="hover:text-blue-200 font-medium">
              Book Seats
            </Link>
            <Link to="/routes" className="hover:text-blue-200 font-medium">
              Routes
            </Link>
            <Link to="/support" className="hover:text-blue-200 font-medium">
              Support
            </Link>
            {isAuthenticated && (
              <Link
                to="/user/userprofile"
                className="hover:text-blue-200 font-medium"
              >
                Dashboard
              </Link>
            )}
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <span className="font-medium">
                  {user?.name || user?.firstName || "User"}
                </span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-1.5 border border-white rounded-md hover:bg-white hover:text-blue-600 transition-colors flex items-center"
                >
                  <LogOutIcon size={16} className="mr-1" />
                  Logout
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => navigate("/login")}
                  className="px-4 py-1.5 border border-white rounded-md hover:bg-white hover:text-blue-600 transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate("/signup")}
                  className="px-4 py-1.5 bg-white text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden" onClick={toggleMenu}>
            {isMenuOpen ? <X size={24} /> : <MenuIcon size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-3 pb-3">
            <nav className="flex flex-col space-y-3">
              <Link to="/" className="hover:text-blue-200 font-medium">
                Home
              </Link>
              <Link to="/track-bus" className="hover:text-blue-200 font-medium">
                Track Bus
              </Link>
              <Link
                to="/book-seats"
                className="hover:text-blue-200 font-medium"
              >
                Book Seats
              </Link>
              <Link to="/routes" className="hover:text-blue-200 font-medium">
                Routes
              </Link>
              <Link to="/support" className="hover:text-blue-200 font-medium">
                Support
              </Link>
              {isAuthenticated && (
                <Link
                  to="/user/userprofile"
                  className="hover:text-blue-200 font-medium"
                >
                  Dashboard
                </Link>
              )}

              <div className="flex space-x-3 pt-2">
                {isAuthenticated ? (
                  <button
                    onClick={handleLogout}
                    className="px-4 py-1.5 border border-white rounded-md hover:bg-white hover:text-blue-600 transition-colors flex items-center"
                  >
                    <LogOutIcon size={16} className="mr-1" />
                    Logout
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => navigate("/login")}
                      className="px-4 py-1.5 border border-white rounded-md hover:bg-white hover:text-blue-600 transition-colors"
                    >
                      Login
                    </button>
                    <button
                      onClick={() => navigate("/signup")}
                      className="px-4 py-1.5 bg-white text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
                    >
                      Sign Up
                    </button>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
