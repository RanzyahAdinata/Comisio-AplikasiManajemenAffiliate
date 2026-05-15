import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import CheckoutPage from "./CheckoutPage";
import "./index.css";
import "./global.css";

// Deteksi jika URL adalah halaman checkout pembeli: /buy/:referralCode
const pathname = window.location.pathname;
const buyMatch = pathname.match(/^\/buy\/([A-Za-z0-9\-_]+)$/);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {buyMatch ? (
      <CheckoutPage referralCode={buyMatch[1]} />
    ) : (
      <App />
    )}
  </React.StrictMode>
);