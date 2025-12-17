import axiosInstance from "./axios";
import API_CONFIG from "./config";

const tableService = {
  // Create new table
  createTable: async (data) => {
    return axiosInstance.post(API_CONFIG.ENDPOINTS.TABLES, data);
  },

  // Get active tables
  getActiveTables: async (params = {}) => {
    return axiosInstance.get(API_CONFIG.ENDPOINTS.TABLES, { params });
  },

  // Get table details
  getTableDetails: async (tableCode) => {
    return axiosInstance.get(API_CONFIG.ENDPOINTS.TABLE_DETAILS(tableCode));
  },

  // Join table
  joinTable: async (tableCode, data) => {
    return axiosInstance.post(API_CONFIG.ENDPOINTS.TABLE_JOIN(tableCode), data);
  },

  // Leave table
  leaveTable: async (tableCode, data) => {
    return axiosInstance.post(API_CONFIG.ENDPOINTS.TABLE_LEAVE(tableCode), data);
  },
};

export default tableService;
