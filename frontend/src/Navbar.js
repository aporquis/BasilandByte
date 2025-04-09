// frontend/src/Navbar.js
// Navigation bar component for the web app.
// Displays links based on login status and handles logout.
// No API calls, just navigation logic.

import React from "react";
import { useNavigate } from "react-router-dom";
import "./Navbar.css" /*Import associated style sheet*/

function Navbar() {
  const navigate = useNavigate(); // Hook for navigation
  const isLoggedIn = !!localStorage.getItem("access_token"); // Check login status

  // Handle logout by clearing tokens and redirecting
  const handleLogout = () => {
    localStorage.removeItem("access_token"); // Clear access token
    localStorage.removeItem("refresh_token"); // Clear refresh token
    navigate("/login"); // Redirect to login
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <button onClick={() => navigate("/")}>Home</button>
        </div>
        <ul className="navbar-menu">
          {isLoggedIn && (
            <li className="navbar-item">
              <button onClick={() => navigate("/dashboard")}>Dashboard</button>
            </li>
          )}
          <li className="navbar-item">
            {isLoggedIn ? (
              <button onClick={handleLogout}>Logout</button>
            ) : (
              <button onClick={() => navigate("/login")}>Login</button>
            )}
          </li>
        </ul>
        {/* Responsive Menu Button */}
        <button className="navbar-toggle">
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </button>
      </div>
    </nav>
  );
}

export default Navbar;