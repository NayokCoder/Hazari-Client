import axiosInstance from "./axios";
import API_CONFIG from "./config";

const leaderboardService = {
  // Get global leaderboard
  getGlobalLeaderboard: async (params = {}) => {
    return axiosInstance.get(API_CONFIG.ENDPOINTS.LEADERBOARD, { params });
  },

  // Get user rank
  getUserRank: async (userId) => {
    return axiosInstance.get(API_CONFIG.ENDPOINTS.LEADERBOARD_USER(userId));
  },

  // Get recent games
  getRecentGames: async (params = {}) => {
    return axiosInstance.get(API_CONFIG.ENDPOINTS.LEADERBOARD_RECENT, { params });
  },
};

export default leaderboardService;
