import React from "react";
import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("access_token");

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/login");
  };

  return (
    <nav>
      <ul style={{ display: "flex", listStyle: "none", padding: 0 }}>
        <li style={{ marginRight: "10px" }}><button onClick={() => navigate("/")}>Home</button></li>
        {isLoggedIn && <li style={{ marginRight: "10px" }}><button onClick={() => navigate("/dashboard")}>Dashboard</button></li>}
        {isLoggedIn ? (
          <li style={{ marginRight: "10px" }}><button onClick={handleLogout}>Logout</button></li>
        ) : (
          <li style={{ marginRight: "10px" }}><button onClick={() => navigate("/login")}>Login</button></li>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;