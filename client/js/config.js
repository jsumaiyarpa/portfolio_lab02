// Centralized API Configuration with Automatic Environment Detection
const isLocalhost = Boolean(
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1" ||
  window.location.hostname === "" ||
  window.location.protocol === "file:"
);

const API_BASE_URL = isLocalhost
  ? "http://localhost:5000"
  : "https://portfolio-backend-8zt5.onrender.com";

// Expose on window for global access
window.API_BASE_URL = API_BASE_URL;
