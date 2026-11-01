import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { AuctionProvider } from "./context/AuctionContext";
import ToastContainer from "./components/ui/Toast";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuctionProvider>
      <App />
      <ToastContainer />
    </AuctionProvider>
  </React.StrictMode>
);
