import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL?.replace(/\/$/, "") || "http://10.0.0.150:8000";

function Dashboard() {
    const [user, setUser] = useState(null);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        console.log("Dashboard Loaded!"); //lets users know that the paged worked (in the console side of things F12)!
 
        const fetchUserInfo = async () => {
            const token = localStorage.getItem("access_token");

            console.log("🔑 Stored Token in LocalStorage:", token); // Debugging for the chrome console

            if (!token) {
                setError("No authentication token found.");
                console.error("❌ No authentication token found.");
                return;
            }

            try {
                const response = await axios.get(`${API_BASE_URL}/api/recipes/user-info/`, {
                    headers: {
                        Authorization: `Bearer ${token}`, // If using JWT, change to `Bearer ${token}` THIS IS WHAT I MESSED UP ON!!! FIXED NOW HAHA!
                        "Content-Type": "application/json",
                    },
                });

                console.log(" API Response:", response.data); // Debugging
                setUser(response.data);
            } catch (err) {
                console.error(" Error fetching user info:", err);
                setError(err.response?.data?.detail || "Failed to fetch user info.");
            }
        };

        fetchUserInfo();
    }, []);

    // Function to Download User Data for specific LOGGED IN user
    const downloadUserData = async () => {
    const token = localStorage.getItem("access_token");

    try {
        const response = await axios.get(`${API_BASE_URL}/api/recipes/export-user-data/`, {
            headers: {
                Authorization: `Bearer ${token}`, // If using JWT, change to `Bearer ${token}` this was the issue that I was having as said above in the lost function!
                "Content-Type": "application/json",
            },
            responseType: "blob", // Force the response as a file for users to have their own data for logged in account
        });

        // Convert blob response to JSON file for easy reading when downloaded can open in an app like notes
        const blob = new Blob([response.data], { type: "application/json" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `${user.username}_data.json`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        console.log(" User data downloaded successfully!");
    } catch (err) {
        console.error(" Error downloading user data:", err);
        setError("Failed to download user data.");
    }
};

//all of the stuff below should show in the UI
    return (
        <div>
            <h2> Dashboard Loaded </h2> {/* This should appear in UI */}
            {error && <p style={{ color: "red" }}>{error}</p>}
            {user ? (
                <>
                    <h3>Welcome, {user.username}!</h3> {/* Display username */}
                    <button onClick={downloadUserData}>📥 Download My Data</button> {/* Added Button for downloading user data! */}
                </>
            ) : (
                <p>Loading user data...</p>
            )}
        </div>
    );
}

export default Dashboard;
