import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css"; // Import global styles
import App from "./App";
import reportWebVitals from "./reportWebVitals";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <App />
);

// Optional: Measure performance
reportWebVitals(console.log); // Log vitals to console