import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { userService } from "@/lib/api";

// Get user profile
export const useUserProfile = (userId, options = {}) => {
  return useQuery({
    queryKey: ["user", "profile", userId],
    queryFn: () => userService.getProfile(userId),
    enabled: !!userId,
    ...options,
  });
};

// Get user stats
export const useUserStats = (userId, options = {}) => {
  return useQuery({
    queryKey: ["user", "stats", userId],
    queryFn: () => userService.getStats(userId),
    enabled: !!userId,
    ...options,
  });
};

// Update user profile
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }) => userService.updateProfile(userId, data),
    onSuccess: (data, variables) => {
      console.log("Profile updated successfully:", data);
      // Invalidate and refetch user profile
      queryClient.invalidateQueries({ queryKey: ["user", "profile", variables.userId] });
      queryClient.invalidateQueries({ queryKey: ["user", "me", variables.userId] });
    },
    onError: (error) => {
      console.error("Update profile error:", error);
    },
  });
};
