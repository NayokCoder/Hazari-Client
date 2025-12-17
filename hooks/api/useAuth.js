import { useMutation, useQuery } from "@tanstack/react-query";
import { authService } from "@/lib/api";

// Signup mutation
export const useSignup = () => {
  return useMutation({
    mutationFn: (data) => authService.signup(data),
    onSuccess: (data) => {
      console.log("Signup successful:", data);
      // Store user in localStorage
      if (data.success && data.data.user) {
        localStorage.setItem("hazari-current-user", JSON.stringify(data.data.user));
      }
    },
    onError: (error) => {
      console.error("Signup error:", error);
    },
  });
};

// Login mutation
export const useLogin = () => {
  return useMutation({
    mutationFn: (data) => authService.login(data),
    onSuccess: (data) => {
      console.log("Login successful:", data);
      // Store user in localStorage
      if (data.success && data.data.user) {
        localStorage.setItem("hazari-current-user", JSON.stringify(data.data.user));
      }
    },
    onError: (error) => {
      console.error("Login error:", error);
    },
  });
};

// Get current user query
export const useGetMe = (userId, options = {}) => {
  return useQuery({
    queryKey: ["user", "me", userId],
    queryFn: () => authService.getMe(userId),
    enabled: !!userId,
    ...options,
  });
};
