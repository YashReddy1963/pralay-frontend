import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initializeApiService } from "./utils/apiConfig";

// Initialize API service with correct backend URL before rendering app
initializeApiService();

createRoot(document.getElementById("root")!).render(<App />);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => console.log('SW registered:', reg))
      .catch((err) => console.log('SW registration failed:', err));
  });
}
