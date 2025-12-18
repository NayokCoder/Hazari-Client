import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { tableService, invitationService } from "@/lib/api";

// Create table
export const useCreateTable = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => tableService.createTable(data),
    onSuccess: (data, variables) => {
      console.log("Table created successfully:", data);
      // Invalidate user wallet
      queryClient.invalidateQueries({ queryKey: ["wallet", "balance", variables.userId] });
      queryClient.invalidateQueries({ queryKey: ["tables"] });
    },
    onError: (error) => {
      console.error("Create table error:", error);
    },
  });
};

// Get active tables
export const useActiveTables = (params = {}, options = {}) => {
  return useQuery({
    queryKey: ["tables", params],
    queryFn: () => tableService.getActiveTables(params),
    ...options,
  });
};

// Get table details
export const useTableDetails = (tableCode, options = {}) => {
  return useQuery({
    queryKey: ["table", tableCode],
    queryFn: () => tableService.getTableDetails(tableCode),
    enabled: !!tableCode,
    ...options,
  });
};

// Join table
export const useJoinTable = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tableCode, userId }) => tableService.joinTable(tableCode, { userId }),
    onSuccess: (data, variables) => {
      console.log("Joined table successfully:", data);
      // Invalidate table and wallet
      queryClient.invalidateQueries({ queryKey: ["table", variables.tableCode] });
      queryClient.invalidateQueries({ queryKey: ["wallet", "balance", variables.userId] });
      queryClient.invalidateQueries({ queryKey: ["tables"] });
    },
    onError: (error) => {
      console.error("Join table error:", error);
    },
  });
};

// Leave table
export const useLeaveTable = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tableCode, userId }) => tableService.leaveTable(tableCode, { userId }),
    onSuccess: (data, variables) => {
      console.log("Left table successfully:", data);
      // Invalidate table and wallet
      queryClient.invalidateQueries({ queryKey: ["table", variables.tableCode] });
      queryClient.invalidateQueries({ queryKey: ["wallet", "balance", variables.userId] });
      queryClient.invalidateQueries({ queryKey: ["tables"] });
    },
    onError: (error) => {
      console.error("Leave table error:", error);
    },
  });
};

// Reset table for new game
export const useResetTable = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tableCode) => tableService.resetTable(tableCode),
    onSuccess: (data, tableCode) => {
      console.log("Table reset successfully:", data);
      // Invalidate table queries
      queryClient.invalidateQueries({ queryKey: ["table", tableCode] });
      queryClient.invalidateQueries({ queryKey: ["game", "active", tableCode] });
    },
    onError: (error) => {
      console.error("Reset table error:", error);
    },
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

// Send invitation
export const useSendInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => invitationService.sendInvitation(data),
    onSuccess: (data, variables) => {
      console.log("Invitation sent successfully:", data);
      // Invalidate table invitations
      queryClient.invalidateQueries({ queryKey: ["invitations", "table", variables.tableCode] });
    },
    onError: (error) => {
      console.error("Send invitation error:", error);
    },
  });
};
