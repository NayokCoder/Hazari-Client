import axiosInstance from "./axios";
import API_CONFIG from "./config";

const userService = {
  // Get user profile
  getProfile: async (userId) => {
    return axiosInstance.get(API_CONFIG.ENDPOINTS.USER_PROFILE(userId));
  },

  // Get user stats
  getStats: async (userId) => {
    return axiosInstance.get(API_CONFIG.ENDPOINTS.USER_STATS(userId));
  },

  // Update user profile
  updateProfile: async (userId, data) => {
    return axiosInstance.put(API_CONFIG.ENDPOINTS.USER_PROFILE(userId), data);
  },

  // Increment round wins (for 360 points or 0 points achievements)
  incrementRoundWins: async (userId, type) => {
    return axiosInstance.post(`/api/users/${userId}/increment-round-wins`, { type });
  },
};

export default userService;
