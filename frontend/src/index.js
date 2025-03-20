// frontend/src/index.js
// Entry point for the React web application.
// Renders the main App component into the DOM and sets up performance reporting.

import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css"; // Import global styles
import App from "./App"; // Main app component
import reportWebVitals from "./reportWebVitals"; // Performance reporting utility

// Create a root for rendering
const root = ReactDOM.createRoot(document.getElementById("root"));

// Render the app
root.render(
  <App />
);

// Optional: Measure and log performance metrics
reportWebVitals(console.log); // Log vitals to console