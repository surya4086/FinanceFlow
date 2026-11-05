
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";

import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";

import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>

        <Toaster
      position="top-right"
      reverseOrder={false}
      toastOptions={{
        duration: 3000,
        style: {
          borderRadius: "12px",
          background: "#ffffff",
          color: "#1e293b",
        },
      }}
    />



    </BrowserRouter>
  </StrictMode>
);
