import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://10.0.0.150:8000";

function Dashboard() {
    const [user, setUser] = useState(null);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        console.log("🚀 Dashboard Loaded!");

        const fetchUserInfo = async () => {
            const token = localStorage.getItem("access_token");

            console.log("🔑 Stored Token:", token); // Debugging: Check token

            if (!token) {
                setError("No authentication token found.");
                console.error("❌ No authentication token found.");
                return;
            }

            try {
                const response = await axios.get(`${API_BASE_URL}/api/recipes/user-info/`, {
                    headers: {
                        Authorization: `Bearer ${token}`, // Include token for authentication
                        "Content-Type": "application/json",
                    },
                });

                console.log("✅ API Response:", response.data); // Debugging: Log API response
                setUser(response.data);
            } catch (err) {
                console.error("❌ Error fetching user info:", err);
                setError(err.response?.data?.detail || "Failed to fetch user info.");
            }
        };

        fetchUserInfo();
    }, []);

    return (
        <div>
            <h2>🚀 Dashboard Loaded ✅</h2> {/* This should appear in UI */}
            {error && <p style={{ color: "red" }}>{error}</p>}
            {user ? (
                <h3>Welcome, {user.username}!</h3> // Display username
            ) : (
                <p>Loading user data...</p>
            )}
        </div>
    );
}

export default Dashboard;
