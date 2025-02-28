import React, { useState } from "react";
import axios from "axios"; 
import { useNavigate } from "react-router-dom";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

function Register() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Ensure passwords match before submitting
        if (password !== confirmPassword) {
            setMessage("⚠️ Passwords do not match!");
            return;
        }

        try {
            const response = await axios.post(`${API_BASE_URL}api/recipes/register/`, { 
                username, 
                password 
            });

            console.log("Registration Response:", response.data); // Debugging

            setMessage("✅ Registration successful! Redirecting to login...");
            
            // Redirect user to login page after 2 seconds
            setTimeout(() => navigate("/login"), 2000);

        } catch (error) {
            console.error("Registration Error:", error.response?.data); // Debugging
            setMessage(error.response?.data?.error || "⚠️ Registration failed! Try a different username.");
        }
    };

    return (
        <div>
            <h2>Register</h2>
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
                <div>
                    <label>Confirm Password: </label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Register</button>
            </form>
            <div style={{ marginTop: "20px" }}>
                <p>Already have an account?</p>
                <button onClick={() => navigate("/login")}>Go to Login</button>
            </div>
        </div>
    );
}

export default Register;
