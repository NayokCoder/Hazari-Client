"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Medal, Crown, TrendingUp, Award } from "lucide-react";
import { useGlobalLeaderboard } from "@/hooks/api/useLeaderboard";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

const LeaderboardSection = () => {
  const [sortBy, setSortBy] = useState("totalWinnings");
  const { data, isLoading, error } = useGlobalLeaderboard({ limit: 10, sortBy });

  const leaderboard = data?.data?.leaderboard || [];

  // Get medal/crown icon based on rank
  const getRankIcon = (rank) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-amber-600" />;
    return null;
  };

  // Get rank badge color
  const getRankBadgeColor = (rank) => {
    if (rank === 1) return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white";
    if (rank === 2) return "bg-gradient-to-r from-gray-300 to-gray-500 text-white";
    if (rank === 3) return "bg-gradient-to-r from-amber-400 to-amber-600 text-white";
    return "bg-gray-100 text-gray-700";
  };

  if (isLoading) {
    return (
      <div className="py-12">
        <LoadingSpinner message="Loading leaderboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Failed to load leaderboard</p>
      </div>
    );
  }

  return (
    <section className="py-16 px-4 bg-gradient-to-br from-purple-50 via-blue-50 to-green-50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="w-10 h-10 text-yellow-500" />
            <h2 className="text-4xl font-bold text-gray-900">Leaderboard</h2>
            <Trophy className="w-10 h-10 text-yellow-500" />
          </div>
          <p className="text-gray-600 text-lg">Top Players of Hazari</p>
        </motion.div>

        {/* Sort Buttons */}
        <div className="flex justify-center gap-3 mb-8 flex-wrap">
          <button
            onClick={() => setSortBy("totalWinnings")}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              sortBy === "totalWinnings"
                ? "bg-green-500 text-white shadow-lg scale-105"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            <TrendingUp className="w-4 h-4 inline mr-2" />
            Top Earners
          </button>
          <button
            onClick={() => setSortBy("gamesWon")}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              sortBy === "gamesWon"
                ? "bg-blue-500 text-white shadow-lg scale-105"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Award className="w-4 h-4 inline mr-2" />
            Most Wins
          </button>
          <button
            onClick={() => setSortBy("winRate")}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              sortBy === "winRate"
                ? "bg-purple-500 text-white shadow-lg scale-105"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Trophy className="w-4 h-4 inline mr-2" />
            Best Win Rate
          </button>
        </div>

        {/* Leaderboard Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Desktop View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-bold">Rank</th>
                  <th className="px-6 py-4 text-left font-bold">Player</th>
                  <th className="px-6 py-4 text-center font-bold">Games Played</th>
                  <th className="px-6 py-4 text-center font-bold">Games Won</th>
                  <th className="px-6 py-4 text-center font-bold">Win Rate</th>
                  <th className="px-6 py-4 text-right font-bold">Total Winnings</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      No players yet. Be the first to play!
                    </td>
                  </tr>
                ) : (
                  leaderboard.map((player, index) => (
                    <motion.tr
                      key={player.userId?._id || player.userId || index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`border-b border-gray-100 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all ${
                        player.rank <= 3 ? "bg-gradient-to-r from-yellow-50 to-orange-50" : ""
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {getRankIcon(player.rank)}
                          <span
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${getRankBadgeColor(
                              player.rank
                            )}`}
                          >
                            {player.rank}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                            {player.name?.charAt(0).toUpperCase() || "?"}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{player.name}</p>
                            <p className="text-xs text-gray-500">ID: {player.userId?.playerId || "N/A"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-gray-700 font-medium">{player.gamesPlayed || 0}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full font-semibold">
                          <Trophy className="w-4 h-4" />
                          {player.gamesWon || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-semibold text-purple-600">
                          {(() => {
                            const rate = Number(player.winRate || 0);
                            return isNaN(rate) ? "0.0" : rate.toFixed(1);
                          })()}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-xl font-bold text-green-600">
                          ₹{Number(player.totalWinnings || 0).toLocaleString()}
                        </span>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile View */}
          <div className="md:hidden divide-y divide-gray-200">
            {leaderboard.length === 0 ? (
              <div className="px-6 py-12 text-center text-gray-500">
                No players yet. Be the first to play!
              </div>
            ) : (
              leaderboard.map((player, index) => (
                <motion.div
                  key={player.userId?._id || player.userId || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-4 ${
                    player.rank <= 3 ? "bg-gradient-to-r from-yellow-50 to-orange-50" : ""
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    {getRankIcon(player.rank)}
                    <span
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${getRankBadgeColor(
                        player.rank
                      )}`}
                    >
                      {player.rank}
                    </span>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                      {player.name?.charAt(0).toUpperCase() || "?"}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{player.name}</p>
                      <p className="text-xs text-gray-500">ID: {player.userId?.playerId || "N/A"}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-blue-50 px-3 py-2 rounded-lg">
                      <p className="text-xs text-gray-600">Games</p>
                      <p className="font-semibold text-gray-900">{player.gamesPlayed || 0}</p>
                    </div>
                    <div className="bg-green-50 px-3 py-2 rounded-lg">
                      <p className="text-xs text-gray-600">Wins</p>
                      <p className="font-semibold text-green-700">{player.gamesWon || 0}</p>
                    </div>
                    <div className="bg-purple-50 px-3 py-2 rounded-lg">
                      <p className="text-xs text-gray-600">Win Rate</p>
                      <p className="font-semibold text-purple-700">
                        {(() => {
                          const rate = Number(player.winRate || 0);
                          return isNaN(rate) ? "0.0" : rate.toFixed(1);
                        })()}%
                      </p>
                    </div>
                    <div className="bg-orange-50 px-3 py-2 rounded-lg">
                      <p className="text-xs text-gray-600">Winnings</p>
                      <p className="font-semibold text-green-600">
                        ₹{Number(player.totalWinnings || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

        {/* Footer Note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-gray-500 text-sm mt-6"
        >
          Rankings update in real-time based on game results
        </motion.p>
      </div>
    </section>
  );
};

export default LeaderboardSection;
