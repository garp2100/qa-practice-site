import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

console.log("VITE_ENV:", import.meta.env.VITE_ENV);
console.log("VITE_API_BASE:", import.meta.env.VITE_API_BASE);

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);