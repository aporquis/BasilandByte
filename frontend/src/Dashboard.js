// frontend/src/Dashboard.js
// Dashboard component for logged-in users.
// Fetches user info and provides options to download data and navigate.
// Uses getUserInfo and exportUserData from api.js.

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserInfo, exportUserData } from "./api"; // Import API functions

function Dashboard() {
  const [user, setUser] = useState(null); // State for user data
  const [error, setError] = useState(""); // State for error messages
  const navigate = useNavigate(); // Hook for navigation

  // Fetch user info on mount
  useEffect(() => {
    console.log("Dashboard Loaded!");
    const fetchUserInfo = async () => {
      const token = localStorage.getItem("access_token"); // Check for token
      console.log("🔑 Stored Token in LocalStorage:", token);
      if (!token) {
        setError("No authentication token found.");
        console.error("❌ No authentication token found.");
        navigate("/login"); // Redirect to login if no token
        return;
      }

      try {
        const data = await getUserInfo(); // Fetch user info via API
        console.log("API Response:", data);
        setUser(data);
      } catch (err) {
        console.error("Error fetching user info:", err.message);
        setError(err.response?.data?.detail || "Failed to fetch user info.");
      }
    };

    fetchUserInfo();
  }, [navigate]);

  // Download user data as JSON file
  const downloadUserData = async () => {
    try {
      const blob = await exportUserData(); // Fetch user data blob
      const url = window.URL.createObjectURL(blob); // Create downloadable URL
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${user.username}_data.json`); // Set filename
      document.body.appendChild(link);
      link.click(); // Trigger download
      document.body.removeChild(link); // Clean up
      console.log("User data downloaded successfully!");
    } catch (err) {
      console.error("Error downloading user data:", err.message);
      setError("Failed to download user data.");
    }
  };

  return (
    <div>
      <h2>Dashboard Loaded</h2>
      {error && <p style={{ color: "red" }}>{error}</p>} {/* Display error if present */}
      {user ? (
        <>
          <h3>Welcome, {user.username}!</h3>
          <button onClick={downloadUserData}>📥 Download My Data</button>
          <br />
          <button onClick={() => navigate("/add-recipe")}>Add a Recipe</button>
          <br />
          <button onClick={() => navigate("/saved-recipes")}>View Saved Recipes</button>
          <br />
          <button onClick={() => navigate("/weekly-planner")}>Weekly Planner</button>
        </>
      ) : (
        <p>Loading user data...</p> // Loading state
      )}
    </div>
  );
}

export default Dashboard;