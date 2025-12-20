import axiosInstance from "./axios";
import API_CONFIG from "./config";

const gameService = {
  // Start game
  startGame: async (data) => {
    return axiosInstance.post(API_CONFIG.ENDPOINTS.GAMES, data);
  },

  // Get game details
  getGameDetails: async (gameId) => {
    return axiosInstance.get(API_CONFIG.ENDPOINTS.GAME_DETAILS(gameId));
  },

  // Add round
  addRound: async (gameId, roundData) => {
    return axiosInstance.post(API_CONFIG.ENDPOINTS.GAME_ROUNDS(gameId), { roundData });
  },

  // Edit round
  editRound: async (gameId, roundNumber, roundData) => {
    return axiosInstance.put(API_CONFIG.ENDPOINTS.GAME_EDIT_ROUND(gameId, roundNumber), { roundData });
  },

  // Complete game
  completeGame: async (gameId) => {
    return axiosInstance.put(API_CONFIG.ENDPOINTS.GAME_COMPLETE(gameId));
  },

  // Get game history
  getGameHistory: async (userId, params = {}) => {
    return axiosInstance.get(API_CONFIG.ENDPOINTS.GAME_HISTORY(userId), {
      params,
    });
  },

  // Get active game by table code
  getActiveGame: async (tableCode) => {
    return axiosInstance.get(API_CONFIG.ENDPOINTS.GAME_ACTIVE(tableCode));
  },
};

export default gameService;
