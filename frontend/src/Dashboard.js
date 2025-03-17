import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = (process.env.REACT_APP_API_BASE_URL || "http://10.0.0.150:8000").replace(/\/$/, "");

function Dashboard() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Dashboard Loaded!");
    const fetchUserInfo = async () => {
      const token = localStorage.getItem("access_token");
      console.log("🔑 Stored Token in LocalStorage:", token);
      if (!token) {
        setError("No authentication token found.");
        console.error("❌ No authentication token found.");
        navigate("/login");
        return;
      }

      try {
        const response = await axios.get(`${API_BASE_URL}/api/recipes/user-info/`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        console.log("API Response:", response.data);
        setUser(response.data);
      } catch (err) {
        console.error("Error fetching user info:", err);
        setError(err.response?.data?.detail || "Failed to fetch user info.");
      }
    };

    fetchUserInfo();
  }, [navigate]);

  const downloadUserData = async () => {
    const token = localStorage.getItem("access_token");
    try {
      const response = await axios.get(`${API_BASE_URL}/api/recipes/export-user-data/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        responseType: "blob",
      });

      const blob = new Blob([response.data], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${user.username}_data.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log("User data downloaded successfully!");
    } catch (err) {
      console.error("Error downloading user data:", err);
      setError("Failed to download user data.");
    }
  };

  return (
    <div>
      <h2>Dashboard Loaded</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
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
        <p>Loading user data...</p>
      )}
    </div>
  );
}

export default Dashboard;