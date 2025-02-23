// Navbar.js the point of this is to ensure that every page has a way to get home at the time of making this I am stuck on the registration page!
import React from "react";
import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  // Check if the user is logged in by looking for an access token, this makes it so you can only see the add page 
  const isLoggedIn = !!localStorage.getItem("access_token");

  const handleLogout = () => {
    // Clear tokens and redirect to home
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/");
    // Rerender when we have the user logged in
    window.location.reload();
  };

  return (
    <nav style={{ padding: "10px", borderBottom: "1px solid #ccc", marginBottom: "20px" }}>
      <button onClick={() => navigate("/")}>Home</button>
      {isLoggedIn ? (
        <button onClick={handleLogout} style={{ marginLeft: "10px" }}>
          Logout
        </button>
      ) : (
        <button onClick={() => navigate("/login")} style={{ marginLeft: "10px" }}>
          Login
        </button>
      )}
    </nav>
  );
}

export default Navbar;
