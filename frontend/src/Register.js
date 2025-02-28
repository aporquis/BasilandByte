import React, { useState } from "react";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

function Register() {
    const [formData, setFormData] = useState({
        username: "",
        password: "",
        first_name: "",          //fields for registering users
        last_name: "",
        email: "",
    });

    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccessMessage("");

        try {
            const response = await axios.post(`${API_BASE_URL}/api/recipes/register/`, formData);
            setSuccessMessage("Registration successful! You can now log in.");
        } catch (err) {
            setError(err.response?.data?.error || "Registration failed.");
        }
    };

    return (
        <div>
            <h2>Register</h2>
            {error && <p style={{ color: "red" }}>{error}</p>}
            {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
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
