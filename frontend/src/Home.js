// frontend/src/Home.js
// Home page component displaying a welcome message and logo.
// Provides navigation to the recipes page.
// No API calls, just static content and navigation.

import React from "react";
import { useNavigate } from "react-router-dom";
import WebsiteLogo from "./WebsiteLogo.png"; // Import logo asset

function Home() {
  const navigate = useNavigate(); // Hook for navigation

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <img
        src={WebsiteLogo}
        alt="Capstone Recipes Logo Graphic"
        style={{ width: "400px", marginBottom: "20px" }} // Logo styling
      />
      <h1>Welcome to the Basil and Bytes Recipe Website!</h1>
      <p>Discover and share your favorite recipes with others!</p>
      <p>If you have an account please login here to continue!</p>
      <p>New here? Lets get you registered to join in on the fun!</p>
      <button onClick={() => navigate("/recipes")}>View Recipes</button> {/* Navigate to recipes */}
    </div>
  );
}

export default Home;