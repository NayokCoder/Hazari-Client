"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Wallet, Trophy, GamepadIcon, TrendingUp, Play, User, Sparkles } from "lucide-react";
import StatsCard from "@/components/shared/StatsCard";
import GameCard from "@/components/shared/GameCard";
import UserAvatar from "@/components/shared/UserAvatar";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { useUserProfile, useWalletBalance } from "@/hooks/api";

const DashboardPage = () => {
  const router = useRouter();
  const [userId, setUserId] = useState(null);

  // Get userId from localStorage on mount
  useEffect(() => {
    const currentUser = localStorage.getItem("hazari-current-user");
    if (currentUser) {
      const user = JSON.parse(currentUser);
      setUserId(user.id);
    } else {
      router.push("/auth/login");
    }
  }, [router]);

  // Fetch user profile and wallet balance from API
  const { data: profileData, isLoading: profileLoading } = useUserProfile(userId);
  const { data: walletData, isLoading: walletLoading } = useWalletBalance(userId);

  const isLoading = profileLoading || walletLoading;
  const user = profileData?.data?.user;
  const balance = walletData?.data?.balance;

  if (!userId || isLoading) {
    return <LoadingSpinner message="Loading your dashboard..." />;
  }

  if (!user) {
    router.push("/auth/login");
    return null;
  }

  const winRate = user.gamesPlayed > 0 ? ((user.gamesWon / user.gamesPlayed) * 100).toFixed(1) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8 mb-8 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full blur-3xl opacity-30 -mr-32 -mt-32"></div>
          <div className="relative flex items-center gap-6">
            <UserAvatar name={user.name} size="xl" showOnline={true} />
            <div className="flex-1">
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-2"
              >
                Welcome back, {user.name}!
                <Sparkles className="w-8 h-8 text-yellow-500" />
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="text-gray-600 text-lg"
              >
                Ready to dominate some Hazari games?
              </motion.p>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-3 flex items-center gap-4"
              >
                <div className="px-4 py-2 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg">
                  <p className="text-xs text-gray-600">Win Rate</p>
                  <p className="text-lg font-bold text-green-600">{winRate}%</p>
                </div>
                <div className="px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg">
                  <p className="text-xs text-gray-600">Player ID</p>
                  <p className="text-xl font-mono font-bold text-purple-600">{user.playerId}</p>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard icon={Wallet} label="Balance" value={`₹${balance ?? 0}`} color="green" delay={0.1} />
          <StatsCard icon={Trophy} label="Games Won" value={user.gamesWon} color="blue" delay={0.2} />
          <StatsCard icon={GamepadIcon} label="Games Played" value={user.gamesPlayed} color="purple" delay={0.3} />
          <StatsCard icon={TrendingUp} label="Total Winnings" value={`₹${user.totalWinnings}`} color="orange" delay={0.4} />
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GameCard
              icon={Play}
              title="Start Playing"
              description="Create or join a game table"
              href="/play"
              gradient="from-green-500 via-emerald-500 to-teal-600"
              delay={0.6}
            />
            <GameCard
              icon={User}
              title="View Profile"
              description="Check your stats and achievements"
              href="/profile"
              gradient="from-blue-500 via-indigo-500 to-purple-600"
              delay={0.7}
            />
          </div>
        </motion.div>

        {/* Recent Activity Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8 bg-white rounded-2xl shadow-xl p-6"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Activity</h2>
          <div className="text-center py-12">
            <GamepadIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No recent games yet. Start playing to see your activity!</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardPage;
