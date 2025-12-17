"use client";

import { useState } from "react";
import {
  useSignup,
  useLogin,
  useWalletBalance,
  useDeposit,
  useCreateTable,
  useUserStats,
  useGlobalLeaderboard,
} from "@/hooks/api";

/**
 * Example component demonstrating how to use all API hooks
 * This is for reference only - copy patterns into your actual pages
 */
export default function ExampleUsage() {
  const [userId, setUserId] = useState("");

  // Auth hooks
  const signup = useSignup();
  const login = useLogin();

  // Wallet hooks
  const { data: balanceData } = useWalletBalance(userId);
  const deposit = useDeposit();

  // User hooks
  const { data: statsData } = useUserStats(userId);

  // Table hooks
  const createTable = useCreateTable();

  // Leaderboard hooks
  const { data: leaderboardData } = useGlobalLeaderboard();

  // Example: Signup
  const handleSignup = () => {
    signup.mutate(
      {
        name: "Test User",
        mobileNumber: "9876543210",
      },
      {
        onSuccess: (data) => {
          console.log("✅ Signup successful:", data);
          setUserId(data.data.user.id);
          alert(`Account created! User ID: ${data.data.user.id}`);
        },
        onError: (error) => {
          console.error("❌ Signup failed:", error);
          alert(error.message || "Signup failed");
        },
      }
    );
  };

  // Example: Login
  const handleLogin = () => {
    login.mutate(
      {
        mobileNumber: "9876543210",
      },
      {
        onSuccess: (data) => {
          console.log("✅ Login successful:", data);
          setUserId(data.data.user.id);
          alert(`Welcome back, ${data.data.user.name}!`);
        },
        onError: (error) => {
          console.error("❌ Login failed:", error);
          alert(error.message || "Login failed");
        },
      }
    );
  };

  // Example: Deposit money
  const handleDeposit = () => {
    if (!userId) {
      alert("Please login first!");
      return;
    }

    deposit.mutate(
      {
        userId,
        amount: 1000,
        description: "Test deposit",
      },
      {
        onSuccess: (data) => {
          console.log("✅ Deposit successful:", data);
          alert(`Deposited ₹1000! New balance: ₹${data.data.newBalance}`);
        },
        onError: (error) => {
          console.error("❌ Deposit failed:", error);
          alert(error.message || "Deposit failed");
        },
      }
    );
  };

  // Example: Create table
  const handleCreateTable = () => {
    if (!userId) {
      alert("Please login first!");
      return;
    }

    createTable.mutate(
      {
        userId,
        matchFee: 100,
      },
      {
        onSuccess: (data) => {
          console.log("✅ Table created:", data);
          const tableCode = data.data.table.tableCode;
          alert(`Table created! Code: ${tableCode}`);
        },
        onError: (error) => {
          console.error("❌ Create table failed:", error);
          alert(error.message || "Create table failed");
        },
      }
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8">
      <h1 className="text-3xl font-bold">API Integration Examples</h1>

      {/* Auth Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Authentication</h2>
        <div className="space-x-4">
          <button
            onClick={handleSignup}
            disabled={signup.isPending}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            {signup.isPending ? "Signing up..." : "Signup"}
          </button>
          <button
            onClick={handleLogin}
            disabled={login.isPending}
            className="px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50"
          >
            {login.isPending ? "Logging in..." : "Login"}
          </button>
        </div>
        {userId && (
          <p className="mt-4 text-sm text-gray-600">
            Current User ID: <code className="bg-gray-100 px-2 py-1 rounded">{userId}</code>
          </p>
        )}
      </div>

      {/* Wallet Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Wallet</h2>
        <div className="space-y-4">
          <div>
            <p className="text-lg">
              Balance: <span className="font-bold text-green-600">₹{balanceData?.data?.balance || 0}</span>
            </p>
          </div>
          <button
            onClick={handleDeposit}
            disabled={deposit.isPending || !userId}
            className="px-4 py-2 bg-purple-500 text-white rounded disabled:opacity-50"
          >
            {deposit.isPending ? "Depositing..." : "Deposit ₹1000"}
          </button>
        </div>
      </div>

      {/* User Stats Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">User Statistics</h2>
        {statsData?.data?.stats ? (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Games Won</p>
              <p className="text-2xl font-bold">{statsData.data.stats.gamesWon}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Games Played</p>
              <p className="text-2xl font-bold">{statsData.data.stats.gamesPlayed}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Win Rate</p>
              <p className="text-2xl font-bold">{statsData.data.stats.winRate}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Winnings</p>
              <p className="text-2xl font-bold">₹{statsData.data.stats.totalWinnings}</p>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">Login to see stats</p>
        )}
      </div>

      {/* Table Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Tables</h2>
        <button
          onClick={handleCreateTable}
          disabled={createTable.isPending || !userId}
          className="px-4 py-2 bg-orange-500 text-white rounded disabled:opacity-50"
        >
          {createTable.isPending ? "Creating..." : "Create Table (₹100 fee)"}
        </button>
      </div>

      {/* Leaderboard Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Leaderboard</h2>
        {leaderboardData?.data?.leaderboard?.length > 0 ? (
          <div className="space-y-2">
            {leaderboardData.data.leaderboard.slice(0, 5).map((player) => (
              <div key={player.userId} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="font-semibold">
                  #{player.rank} {player.name}
                </span>
                <span className="text-green-600 font-bold">₹{player.totalWinnings}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No players yet</p>
        )}
      </div>

      {/* Debug Info */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-bold mb-2">Debug Info</h3>
        <pre className="text-xs overflow-auto">
          {JSON.stringify(
            {
              userId,
              balance: balanceData?.data?.balance,
              stats: statsData?.data?.stats,
              signupPending: signup.isPending,
              depositPending: deposit.isPending,
            },
            null,
            2
          )}
        </pre>
      </div>
    </div>
  );
}
