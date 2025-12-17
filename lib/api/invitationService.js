import axiosInstance from "./axios";
import API_CONFIG from "./config";

const invitationService = {
  // Send invitation
  sendInvitation: async (data) => {
    return axiosInstance.post(API_CONFIG.ENDPOINTS.INVITATIONS, data);
  },

  // Get user's invitations
  getUserInvitations: async (playerId, params = {}) => {
    return axiosInstance.get(API_CONFIG.ENDPOINTS.INVITATIONS_USER(playerId), {
      params,
    });
  },

  // Get table invitations
  getTableInvitations: async (tableCode) => {
    return axiosInstance.get(API_CONFIG.ENDPOINTS.INVITATIONS_TABLE(tableCode));
  },

  // Accept invitation
  acceptInvitation: async (invitationId) => {
    return axiosInstance.put(API_CONFIG.ENDPOINTS.INVITATION_ACCEPT(invitationId));
  },

  // Reject invitation
  rejectInvitation: async (invitationId) => {
    return axiosInstance.put(API_CONFIG.ENDPOINTS.INVITATION_REJECT(invitationId));
  },
};

export default invitationService;
