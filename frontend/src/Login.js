// Login.js
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:8000/api/token/", { //our token endpoint, refer to backend/url.py for the url list
        username,
        password,
      });
      const { access, refresh } = response.data;
      // Store tokens, when we progress we should probably revist for a potenial for something more secure.
      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);
      setMessage("Login successful!");
      // Navigate back to the recipe list
      navigate("/");
    } catch (error) {
      setMessage("Login failed! Please check your credentials and try again!");
      console.error("Login error:", error);
    }
    };
    
    

  return (
    <div>
      <h2>Login</h2>
      {message && <p>{message}</p>}
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
