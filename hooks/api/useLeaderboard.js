import { useQuery } from "@tanstack/react-query";
import { leaderboardService } from "@/lib/api";

// Get global leaderboard
export const useGlobalLeaderboard = (params = {}, options = {}) => {
  return useQuery({
    queryKey: ["leaderboard", "global", params],
    queryFn: () => leaderboardService.getGlobalLeaderboard(params),
    ...options,
  });
};

// Get user rank
export const useUserRank = (userId, options = {}) => {
  return useQuery({
    queryKey: ["leaderboard", "user", userId],
    queryFn: () => leaderboardService.getUserRank(userId),
    enabled: !!userId,
    ...options,
  });
};

// Get recent games
export const useRecentGames = (params = {}, options = {}) => {
  return useQuery({
    queryKey: ["leaderboard", "recent", params],
    queryFn: () => leaderboardService.getRecentGames(params),
    ...options,
  });
};
