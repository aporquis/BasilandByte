// frontend/src/Dashboard.js
// Dashboard component for logged-in users.
// Fetches user info and provides options to download data and navigate.
// Uses getUserInfo and exportUserData from api.js.

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserInfo, exportUserData } from "./api"; // Import API functions
import axios from "axios";

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

  return (
    <div>
      <h2>Dashboard Loaded</h2>
      {error && <p style={{ color: "red" }}>{error}</p>} {/* Display error if present */}
      {user ? (
        <>
          <h3>Welcome, {user.username}!</h3>
          <button onClick={() => navigate("/add-recipe")}>Add a Recipe</button>
          <br />
          <button onClick={() => navigate("/saved-recipes")}>View Saved Recipes</button>
          <br />
          <button onClick={() => navigate("/weekly-planner")}>Weekly Planner</button>
          <br />
          <button onClick={() => navigate("/pantry")} >Personal Pantry</button>
          <br />
          <button onClick={downloadUserData}>Download My Data</button>
          <br />
          <button onClick={() => navigate("/policies")} >Basil Byte Polices</button>
          <br />
          <button onClick={deleteUserAccount}
          style={{ backgroundColor: "red", color: "white", padding: "10px", marginTop: "20px", borderRadius: "5px"}}> Delete my Account</button>
        </>
      ) : (
        <p>Loading user data...</p> // Loading state
      )}
    </div>
  );
}

export default Dashboard;