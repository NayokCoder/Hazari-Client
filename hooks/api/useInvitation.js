import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import invitationService from "@/lib/api/invitationService";

// Send invitation
export const useSendInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => invitationService.sendInvitation(data),
    onSuccess: (data, variables) => {
      console.log("Invitation sent successfully:", data);
      // Invalidate table invitations
      queryClient.invalidateQueries({
        queryKey: ["invitations", "table", variables.tableCode],
      });
    },
    onError: (error) => {
      console.error("Send invitation error:", error);
    },
  });
};

// Get user's invitations
export const useUserInvitations = (playerId, params = {}, options = {}) => {
  return useQuery({
    queryKey: ["invitations", "user", playerId, params],
    queryFn: () => invitationService.getUserInvitations(playerId, params),
    enabled: !!playerId,
    refetchInterval: 10000, // Refresh every 10 seconds to get new invitations
    ...options,
  });
};

// Get table invitations
export const useTableInvitations = (tableCode, options = {}) => {
  return useQuery({
    queryKey: ["invitations", "table", tableCode],
    queryFn: () => invitationService.getTableInvitations(tableCode),
    enabled: !!tableCode,
    ...options,
  });
};

// Accept invitation
export const useAcceptInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (invitationId) => invitationService.acceptInvitation(invitationId),
    onSuccess: (data, invitationId) => {
      console.log("Invitation accepted successfully:", data);
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
      queryClient.invalidateQueries({ queryKey: ["tables"] });
      queryClient.invalidateQueries({ queryKey: ["table"] });
    },
    onError: (error) => {
      console.error("Accept invitation error:", error);
    },
  });
};

// Reject invitation
export const useRejectInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (invitationId) => invitationService.rejectInvitation(invitationId),
    onSuccess: (data, invitationId) => {
      console.log("Invitation rejected successfully:", data);
      // Invalidate invitation queries
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
    },
    onError: (error) => {
      console.error("Reject invitation error:", error);
    },
  });
};
