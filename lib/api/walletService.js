import axiosInstance from "./axios";
import API_CONFIG from "./config";

const walletService = {
  // Get wallet balance
  getBalance: async (userId) => {
    return axiosInstance.get(API_CONFIG.ENDPOINTS.WALLET_BALANCE(userId));
  },

  // Deposit money
  deposit: async (data) => {
    return axiosInstance.post(API_CONFIG.ENDPOINTS.WALLET_DEPOSIT, data);
  },

  // Withdraw money
  withdraw: async (data) => {
    return axiosInstance.post(API_CONFIG.ENDPOINTS.WALLET_WITHDRAW, data);
  },

  // Get transaction history
  getTransactions: async (userId, params = {}) => {
    return axiosInstance.get(API_CONFIG.ENDPOINTS.WALLET_TRANSACTIONS(userId), {
      params,
    });
  },
};

export default walletService;
