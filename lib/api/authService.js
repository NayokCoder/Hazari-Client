import axiosInstance from "./axios";
import API_CONFIG from "./config";

const authService = {
  // Signup
  signup: async (data) => {
    return axiosInstance.post(API_CONFIG.ENDPOINTS.AUTH_SIGNUP, data);
  },

  // Login
  login: async (data) => {
    return axiosInstance.post(API_CONFIG.ENDPOINTS.AUTH_LOGIN, data);
  },

  // Get current user
  getMe: async (userId) => {
    return axiosInstance.get(API_CONFIG.ENDPOINTS.AUTH_ME, {
      params: { userId },
    });
  },
};

export default authService;
