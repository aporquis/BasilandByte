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
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Define state for menu

  // Handle logout by clearing tokens and redirecting
  const handleLogout = () => {
    localStorage.removeItem("access_token"); // Clear access token
    localStorage.removeItem("refresh_token"); // Clear refresh token
    navigate("/login"); // Redirect to login
    setIsMenuOpen(false); // Close menu after logout
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen); // Toggle menu state
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <button onClick={() => { navigate("/"); setIsMenuOpen(false); }}>Home</button>
        </div>
        <ul className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
          {isLoggedIn && (
            <li className="navbar-item">
              <button onClick={() => { navigate("/dashboard"); setIsMenuOpen(false); }}>Dashboard</button>
            </li>
          )}
          <li className="navbar-item">
            {isLoggedIn ? (
              <button onClick={handleLogout}>Logout</button>
            ) : (
              <button onClick={() => { navigate("/login"); setIsMenuOpen(false); }}>Login</button>
            )}
          </li>
        </ul>
        {/* Responsive Menu Button */}
        <button className={`navbar-toggle ${isMenuOpen ? 'active' : ''}`} onClick={toggleMenu}>
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </button>
      </div>
    </nav>
  );
}

export default Navbar;