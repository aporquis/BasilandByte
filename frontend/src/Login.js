// frontend/src/Login.js
// Login component for user authentication.
// Uses loginUser from api.js to authenticate and store tokens.
// Redirects to /recipes on success.

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "./api"; // Import login function

function Login() {
  const [username, setUsername] = useState(""); // State for username input
  const [password, setPassword] = useState(""); // State for password input
  const [message, setMessage] = useState(""); // State for success/error messages
  const navigate = useNavigate(); // Hook for navigation

// Handle login form submission with GDPR-compliant event logging
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission
    if (!username || !password) { // Validate inputs
      setMessage("Username and password are required!");
      await logLoginEvent(username || 'unknown', 'failure', 'web'); // Log failed attempt due to missing fields
      return;
    }

    try {
      await logLoginEvent(username, 'attempt', 'web'); // Log login attempt
      await loginUser(username, password); // Attempt login via API
      await logLoginEvent(username, 'success', 'web'); // Log successful login
      setMessage("✅ Login successful! Redirecting..."); // Update UI
      setTimeout(() => navigate("/recipes"), 1000); // Redirect after 1s
    } catch (error) {
      console.error("Login Error:", error.message);
      await logLoginEvent(username, 'failure', 'web'); // Log failed login
      setMessage(error.response?.data?.detail || "Login failed! Check your credentials."); // Display error
    }
  };

  return (
    <div>
      <h2>Login</h2>
      {/* Display message with conditional color */}
      {message && <p style={{ color: message.includes("successful") ? "green" : "red" }}>{message}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Username: </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)} // Update username state
            required
          />
        </div>
        <div>
          <label>Password: </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)} // Update password state
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
      <div style={{ marginTop: "20px" }}>
        <p>Don't have an account?</p>
        <button onClick={() => navigate("/register")}>Create New User</button> {/* Navigate to register */}
      </div>
    </div>
  );
}

export default Login;