import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { walletService } from "@/lib/api";

// Get wallet balance
export const useWalletBalance = (userId, options = {}) => {
  return useQuery({
    queryKey: ["wallet", "balance", userId],
    queryFn: () => walletService.getBalance(userId),
    enabled: !!userId,
    ...options,
  });
};

// Deposit money
export const useDeposit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => walletService.deposit(data),
    onSuccess: (data, variables) => {
      console.log("Deposit successful:", data);
      // Invalidate wallet balance and user data
      queryClient.invalidateQueries({ queryKey: ["wallet", "balance", variables.userId] });
      queryClient.invalidateQueries({ queryKey: ["user", "profile", variables.userId] });
      queryClient.invalidateQueries({ queryKey: ["wallet", "transactions", variables.userId] });
    },
    onError: (error) => {
      console.error("Deposit error:", error);
    },
  });
};

// Withdraw money
export const useWithdraw = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => walletService.withdraw(data),
    onSuccess: (data, variables) => {
      console.log("Withdrawal successful:", data);
      // Invalidate wallet balance and user data
      queryClient.invalidateQueries({ queryKey: ["wallet", "balance", variables.userId] });
      queryClient.invalidateQueries({ queryKey: ["user", "profile", variables.userId] });
      queryClient.invalidateQueries({ queryKey: ["wallet", "transactions", variables.userId] });
    },
    onError: (error) => {
      console.error("Withdrawal error:", error);
    },
  });
};

// Get transaction history
export const useTransactions = (userId, params = {}, options = {}) => {
  return useQuery({
    queryKey: ["wallet", "transactions", userId, params],
    queryFn: () => walletService.getTransactions(userId, params),
    enabled: !!userId,
    ...options,
  });
};
