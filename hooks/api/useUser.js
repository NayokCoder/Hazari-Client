import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { userService } from "@/lib/api";

// Get user profile
export const useUserProfile = (userId, options = {}) => {
  return useQuery({
    queryKey: ["user", "profile", userId],
    queryFn: () => userService.getProfile(userId),
    enabled: !!userId,
    staleTime: 0, // Always consider data stale
    refetchOnMount: true, // Refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window regains focus
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

// Increment round wins (for 360 or 0 points achievements)
export const useIncrementRoundWins = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, type }) => userService.incrementRoundWins(userId, type),
    onSuccess: (data, variables) => {
      console.log(`Round win incremented for user ${variables.userId}, type: ${variables.type}`);

      // Update localStorage with new user data
      const currentUser = localStorage.getItem("hazari-current-user");
      if (currentUser) {
        const user = JSON.parse(currentUser);
        if (user.id === variables.userId) {
          // Update the user object with new data from API response
          const updatedUser = {
            ...user,
            ...data.data.user, // Merge with API response data
          };
          localStorage.setItem("hazari-current-user", JSON.stringify(updatedUser));

          // Dispatch event to notify other components
          window.dispatchEvent(new Event("userUpdated"));
          console.log("✅ localStorage and components updated with new round win data");
        }
      }

      // Invalidate and refetch user profile
      queryClient.invalidateQueries({ queryKey: ["user", "profile", variables.userId] });
      queryClient.invalidateQueries({ queryKey: ["user", "stats", variables.userId] });
    },
    onError: (error) => {
      console.error("Increment round wins error:", error);
    },
  });
};
