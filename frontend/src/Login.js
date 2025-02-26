// Login.js
import React, { useState } from "react";
import axios from "axios"; 
import { useNavigate } from "react-router-dom";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${API_BASE_URL}api/token/`, { username, password });

            console.log("Login Response:", response.data); // Debugging

            // Extract tokens from response
            const { access, refresh } = response.data;

            // Store tokens securely in localStorage
            localStorage.setItem("access_token", access);
            localStorage.setItem("refresh_token", refresh);

            setMessage("✅ Login successful! Redirecting...");

            // Redirect user to homepage or dashboard
            navigate("/");
        } catch (error) {
            console.error(" Login Error:", error.response?.data); //  Debugging
            setMessage(error.response?.data?.detail || "Login failed! Check your credentials.");
        }
    };

    return (
        <div>
            <h2>Login</h2>
            {message && <p style={{ color: "red" }}>{message}</p>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Username: </label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Password: </label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Login</button>
            </form>
            <div style={{ marginTop: "20px" }}>
                <p>Don't have an account?</p>
                <button onClick={() => navigate("/register")}>
                    Create New User
                </button>
            </div>
        </div>
    );
}

export default Login;
