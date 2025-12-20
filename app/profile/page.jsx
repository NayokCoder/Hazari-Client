"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const ProfilePage = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Load current user
    const loadUser = () => {
      const currentUser = localStorage.getItem("hazari-current-user");
      if (currentUser) {
        setUser(JSON.parse(currentUser));
        console.log("👤 Profile: User data loaded/refreshed");
      } else {
        // Redirect to login if no user logged in
        router.push("/auth/login");
      }
    };

    loadUser();

    // Listen for user updates (e.g., after game completion)
    const handleUserUpdate = () => {
      console.log("🔄 Profile: User data updated, refreshing...");
      loadUser();
    };

    window.addEventListener("userUpdated", handleUserUpdate);

    return () => {
      window.removeEventListener("userUpdated", handleUserUpdate);
    };
  }, [router]);

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (confirmLogout) {
      localStorage.removeItem("hazari-current-user");
      router.push("/auth/login");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="glass-card rounded-2xl shadow-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
          </div>

          {/* User Info Card */}
          <div className="bg-card/30 backdrop-blur-sm rounded-xl p-6 border border-border/20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* User ID */}
              <div className="bg-card/50 backdrop-blur-sm rounded-lg p-4 border border-border/20">
                <p className="text-xs text-muted-foreground mb-1">User ID</p>
                <p className="text-sm font-mono font-semibold text-foreground">{user.id}</p>
              </div>

              {/* Name */}
              <div className="bg-card/50 backdrop-blur-sm rounded-lg p-4 border border-border/20">
                <p className="text-xs text-muted-foreground mb-1">Full Name</p>
                <p className="text-lg font-semibold text-foreground">{user.name}</p>
              </div>

              {/* Mobile Number */}
              <div className="bg-card/50 backdrop-blur-sm rounded-lg p-4 border border-border/20">
                <p className="text-xs text-muted-foreground mb-1">Mobile Number</p>
                <p className="text-lg font-semibold text-foreground">{user.mobileNumber}</p>
              </div>

              {/* Balance */}
              <div className="bg-card/50 backdrop-blur-sm rounded-lg p-4 border border-orange-500/20">
                <p className="text-xs text-muted-foreground mb-1">Balance</p>
                <p className="text-2xl font-bold text-orange-400">₹{user.balance}</p>
              </div>

              {/* Games Won */}
              <div className="bg-card/50 backdrop-blur-sm rounded-lg p-4 border border-purple-500/20">
                <p className="text-xs text-muted-foreground mb-1">Games Won</p>
                <p className="text-2xl font-bold text-purple-400">{user.gamesWon}</p>
              </div>

              {/* Games Played */}
              <div className="bg-card/50 backdrop-blur-sm rounded-lg p-4 border border-border/20">
                <p className="text-xs text-muted-foreground mb-1">Games Played</p>
                <p className="text-2xl font-bold text-gray-300">{user.gamesPlayed}</p>
              </div>

              {/* Perfect Rounds (360 points) */}
              <div className="bg-card/50 backdrop-blur-sm rounded-lg p-4 border border-orange-500/30">
                <p className="text-xs text-muted-foreground mb-1">Perfect Rounds (360 pts)</p>
                <p className="text-2xl font-bold text-orange-400">{user.perfectRounds || 0}</p>
              </div>

              {/* Zero Rounds (0 points) */}
              <div className="bg-card/50 backdrop-blur-sm rounded-lg p-4 border border-purple-500/30">
                <p className="text-xs text-muted-foreground mb-1">Zero Rounds (0 pts)</p>
                <p className="text-2xl font-bold text-purple-400">{user.zeroRounds || 0}</p>
              </div>

              {/* Total Winnings */}
              <div className="bg-card/50 backdrop-blur-sm rounded-lg p-4 border border-orange-500/20 col-span-full">
                <p className="text-xs text-muted-foreground mb-1">Total Winnings</p>
                <p className="text-3xl font-bold text-orange-400">₹{user.totalWinnings}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="glass-card rounded-2xl shadow-2xl p-6">
          <h2 className="text-2xl font-bold text-foreground mb-4">Statistics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-card/50 backdrop-blur-sm rounded-lg border border-purple-500/20">
              <p className="text-sm text-muted-foreground">Win Rate</p>
              <p className="text-2xl font-bold text-purple-400">{user.gamesPlayed > 0 ? ((user.gamesWon / user.gamesPlayed) * 100).toFixed(1) : 0}%</p>
            </div>
            <div className="text-center p-4 bg-card/50 backdrop-blur-sm rounded-lg border border-orange-500/20">
              <p className="text-sm text-muted-foreground">Avg. Winnings</p>
              <p className="text-2xl font-bold text-orange-400">₹{user.gamesWon > 0 ? (user.totalWinnings / user.gamesWon).toFixed(0) : 0}</p>
            </div>
            <div className="text-center p-4 bg-card/50 backdrop-blur-sm rounded-lg border border-border/20">
              <p className="text-sm text-muted-foreground">Member Since</p>
              <p className="text-sm font-semibold text-gray-300">{new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="text-center p-4 bg-card/50 backdrop-blur-sm rounded-lg border border-orange-500/20">
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="text-sm font-semibold text-orange-400">Active</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
