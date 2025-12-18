import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { gameService } from "@/lib/api";

// Start game
export const useStartGame = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => gameService.startGame(data),
    onSuccess: (data, variables) => {
      console.log("Game started successfully:", data);
      queryClient.invalidateQueries({ queryKey: ["table", variables.tableCode] });
      queryClient.invalidateQueries({ queryKey: ["game", "active", variables.tableCode] });
    },
    onError: (error) => {
      console.error("Start game error:", error);
    },
  });
};

// Get game details
export const useGameDetails = (gameId, options = {}) => {
  return useQuery({
    queryKey: ["game", gameId],
    queryFn: () => gameService.getGameDetails(gameId),
    enabled: !!gameId,
    ...options,
  });
};

// Add round
export const useAddRound = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ gameId, roundData, tableCode }) => gameService.addRound(gameId, roundData),
    onSuccess: (data, variables) => {
      console.log("Round added successfully:", data);
      // Invalidate both the game ID query and the active game query
      queryClient.invalidateQueries({ queryKey: ["game", variables.gameId] });
      queryClient.invalidateQueries({ queryKey: ["game", "active", variables.tableCode] });
      queryClient.invalidateQueries({ queryKey: ["game", "active"] });
    },
    onError: (error) => {
      console.error("Add round error:", error);
    },
  });
};

// Complete game
export const useCompleteGame = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (gameId) => gameService.completeGame(gameId),
    onSuccess: (data) => {
      console.log("Game completed successfully:", data);
      // Invalidate all relevant queries
      queryClient.invalidateQueries({ queryKey: ["game"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
    },
    onError: (error) => {
      console.error("Complete game error:", error);
    },
  });
};

// Get game history
export const useGameHistory = (userId, params = {}, options = {}) => {
  return useQuery({
    queryKey: ["game", "history", userId, params],
    queryFn: () => gameService.getGameHistory(userId, params),
    enabled: !!userId,
    ...options,
  });
};

// Get active game
export const useActiveGame = (tableCode, options = {}) => {
  return useQuery({
    queryKey: ["game", "active", tableCode],
    queryFn: () => gameService.getActiveGame(tableCode),
    enabled: !!tableCode,
    ...options,
  });
};
