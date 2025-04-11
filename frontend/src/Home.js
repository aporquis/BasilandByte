// frontend/src/Home.js
// Home page component displaying a welcome message and logo.
// Provides navigation to the recipes page.
// No API calls, just static content and navigation.

import React from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate(); // Hook for navigation

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <img
        src="https://res.cloudinary.com/dpxqehszz/image/upload/v1744352362/WebsiteLogo_koxf1q.png"
        alt="Capstone Recipes Logo Graphic"
        style={{ width: "400px", marginBottom: "20px" }} // Logo styling
      />
      <h1>Welcome to the Basil & Byte -- Your Go To Recipe Hub!</h1>
      <p>Find, share, and level up your favorite recipes with the community.</p>
      <p>Already have an account? Jump back in and keep the magic going!</p>
      <p>New here? Let’s get you signed up. You don’t want to miss out.</p>
      <button onClick={() => navigate("/recipes")}>Explore Recipes</button> {/* Navigate to recipes */}
    </div>
  );
}

export default Home;