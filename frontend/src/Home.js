// Home.js is used as the homepage, that way our landing page is not the direct use of the add recipe form
import React from "react";
import { useNavigate } from "react-router-dom";
import WebsiteLogo from "./WebsiteLogo.png"

function Home() {
  const navigate = useNavigate();

  return (
      <div style={{ textAlign: "center", marginTop: "100px" }}>
        <img
            src= {WebsiteLogo} //this is the basic logo I picked you can chose a different one, I just wanted to see it on the page.
            alt="Capstone Recipes Logo Graphic"
            style={{ width: "400px", marginBottom: "20px" }}
        />
      <h1>Welcome to the Basil and Bytes Recipe Website!</h1>
          <p>Discover and share your favorite recipes with others!</p>
          <p>If you have an account please login here to continue!</p>
          <p>New here? Lets get you registered to join in on the fun!</p>
      <button onClick={() => navigate("/recipes")}>View Recipes</button>
    </div>
  );
}

export default Home;