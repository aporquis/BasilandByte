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
      <ul className="navbar-list">
        <li className="navbar-item"><button onClick={() => navigate("/")}>Home</button></li>
        {isLoggedIn && <li className="navbar-item"><button onClick={() => navigate("/dashboard")}>Dashboard</button></li>}
        {isLoggedIn ? (
          <li className="navbar-item"><button onClick={handleLogout}>Logout</button></li>
        ) : (
          <li className="navbar-item"><button onClick={() => navigate("/login")}>Login</button></li>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;