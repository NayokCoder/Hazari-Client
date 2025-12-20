import axios from "axios";
import API_CONFIG from "./config";

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // You can add auth token here if needed
    // const token = localStorage.getItem("token");
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }

    return config;
  },
  (error) => {
    console.error("[API Request Error]", error);
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error("[API Response Error]", error.response?.data || error.message);

    // Handle specific error cases
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 400:
          console.error("Bad Request:", data.message);
          break;
        case 401:
          console.error("Unauthorized:", data.message);
          // Redirect to login if needed
          break;
        case 404:
          console.error("Not Found:", data.message);
          break;
        case 500:
          console.error("Server Error:", data.message);
          break;
        default:
          console.error("API Error:", data.message);
      }
    }

    return Promise.reject(error.response?.data || error);
  }
);

export default axiosInstance;
