import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Base URL for API
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";

function Login() {
  const [username, setUsername] = useState(""); // Username input state
  const [password, setPassword] = useState(""); // Password input state
  const [message, setMessage] = useState(""); // Success/error message state
  const navigate = useNavigate(); // For redirecting after login

  // Handle form submission to log in
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission
    try {
      const response = await axios.post(`${API_BASE_URL}/api/token/`, { username, password });
      console.log("Login Response:", response.data); // Debug: Log response
      const { access, refresh } = response.data; // Extract tokens
      localStorage.setItem("access_token", access); // Store access token
      localStorage.setItem("refresh_token", refresh); // Store refresh token
      setMessage("✅ Login successful! Redirecting...");
      setTimeout(() => navigate("/recipes"), 1000); // Redirect to recipes after 1s
    } catch (error) {
      console.error("Login Error:", error.response?.data || error);
      setMessage(error.response?.data?.detail || "Login failed! Check your credentials.");
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
        <button onClick={() => navigate("/register")}>Create New User</button>
      </div>
    </div>
  );
}

export default Login;