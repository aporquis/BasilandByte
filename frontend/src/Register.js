// frontend/src/Register.js
// Registration component for new users.
// Uses registerUser from api.js to register and store tokens.
// Displays success or error messages.

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "./api"; // Import register function

function Register() {
  // State for registration form data
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    first_name: "",
    last_name: "",
    email: "",
  });
  const [error, setError] = useState(""); // State for error messages
  const [successMessage, setSuccessMessage] = useState(""); // State for success messages
  const navigate = useNavigate(); // Hook for navigation

  // Update form data on input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle registration form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission
    setError("");
    setSuccessMessage("");
    try {
      await registerUser(
        formData.username,
        formData.password,
        formData.first_name,
        formData.last_name,
        formData.email
      ); // Register via API
      setSuccessMessage("Registration successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 1000); // Redirect after 1s
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed.");
      console.error("Registration error:", err.message);
    }
  };

  return (
    <div>
      <h2>Register</h2>
      {error && <p style={{ color: "red" }}>{error}</p>} {/* Display error */}
      {successMessage && <p style={{ color: "green" }}>{successMessage}</p>} {/* Display success */}
      <form onSubmit={handleSubmit}>
        <input type="text" name="username" placeholder="Username" onChange={handleChange} required />
        <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
        <input type="text" name="first_name" placeholder="First Name" onChange={handleChange} required />
        <input type="text" name="last_name" placeholder="Last Name" onChange={handleChange} required />
        <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
        <button type="submit">Register</button>
      </form>
    </div>
  );
}

export default Register;