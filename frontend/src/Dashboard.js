// frontend/src/Dashboard.js
// Dashboard component for logged-in users.
// Fetches user info and provides options to download data and navigate.
// Uses getUserInfo and exportUserData from api.js.

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserInfo, exportUserData } from "./api"; // Import API functions
import axios from "axios";
import './Dashboard.css';

function Dashboard() {
  const [user, setUser] = useState(null); // State for user data
  const [error, setError] = useState(""); // State for error messages
  const [currentTime, setCurrentTime] = useState(new Date()); // State for clock
  const navigate = useNavigate(); // Hook for navigation

  // Fetch user info on mount
  useEffect(() => {
    console.log("Dashboard Loaded!");
    const token = localStorage.getItem("access_token"); // Check for token
    console.log("🔑 Stored Token in LocalStorage:", token);

    if (!token) {
      setError("No authentication token found.");
      console.error("No authentication token found.");
      navigate("/login");
      return;
    }

    const fetchUserInfo = async () => {
      try {
        console.log("About to call getUserInfo() with token");
        const data = await getUserInfo(); // Fetch user info via API
        console.log("User Information Response:", data);
        setUser(data);
      } catch (err) {
        console.error("Error fetching user info:", err.message);
        setError(err.response?.data?.detail || "Failed to fetch user info.");
        navigate("/login");
      }
    };

    setTimeout(() => {
      fetchUserInfo();
    }, 100);

    // Update clock every second
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
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

  //Handle Delete Account
  const deleteUserAccount = async () => {
    if (!window.confirm("Are you sure? Your account will be deactivated immediately and permanently deleted after 6 months.")){
      return;
    }
    try {
      const token = localStorage.getItem("access_token");
      await axios.post('https://basilandbyte.onrender.com/api/recipes/request-account-deletion/', {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });

      alert("Your account deletion was successful.");
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      navigate("/login");
    } catch (err) {
      console.error("Error requesting account deletion: ", err.message);
      alert(err.response?.data?.error || "Failed to request account deletion.");
    }
  };

  // Determine meal time based on hours
  const getMealTime = () => {
    const hours = currentTime.getHours();
    if (hours >= 6 && hours < 12) return "Breakfast Time";
    if (hours >= 12 && hours < 17) return "Lunch Time";
    if (hours >= 17 && hours < 24) return "Dinner Time";
    return "Late Night Snacking";
  };

  // Format time as HH:MM:SS AM/PM
  const formatTime = () => {
    return currentTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="dashboard">
      <h2>Dashboard Loaded</h2>
      {error && <p className="error">{error}</p>} {/* Display error if present */}
      {user ? (
        <>
          <h3>Welcome, {user.username}!</h3>
          <div className="dashboard-content">
            <div className="dashboard-actions">
              <button onClick={() => navigate("/recipes")}>Explore Recipes</button>
              <button onClick={() => navigate("/add-recipe")}>Add a Recipe</button>
              <button onClick={() => navigate("/saved-recipes")}>View Saved Recipes</button>
              <button onClick={() => navigate("/weekly-planner")}>Weekly Planner</button>
              <button onClick={() => navigate("/pantry")}>Personal Pantry</button>
              <button onClick={() => navigate("/shopping-list")}>Shopping List</button>
              <button onClick={downloadUserData}>Download My Data</button>
              <button onClick={() => navigate("/policies")}>Basil Byte Policies</button>
              <button
                onClick={deleteUserAccount}
                className="delete-account-button"
              >
                Delete My Account
              </button>
            </div>
            <div className="meal-clock">
              <span className="clock-time">{formatTime()}</span>
              <span className="meal-label">{getMealTime()}</span>
            </div>
          </div>
        </>
      ) : (
        <p>Loading user data...</p> // Loading state
      )}
    </div>
  );
}

export default Dashboard;