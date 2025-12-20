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
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="w-10 h-10 text-orange-400" />
            <h2 className="text-4xl font-bold text-foreground">Leaderboard</h2>
            <Trophy className="w-10 h-10 text-orange-400" />
          </div>
          <p className="text-muted-foreground text-lg">Top Players of Hazari</p>
        </motion.div>

        {/* Sort Buttons */}
        <div className="flex justify-center gap-3 mb-8 flex-wrap">
          <button
            onClick={() => setSortBy("totalWinnings")}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              sortBy === "totalWinnings"
                ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg scale-105"
                : "glass-card text-foreground hover:bg-card/80"
            }`}
          >
            <TrendingUp className="w-4 h-4 inline mr-2" />
            Top Earners
          </button>
          <button
            onClick={() => setSortBy("gamesWon")}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              sortBy === "gamesWon"
                ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg scale-105"
                : "glass-card text-foreground hover:bg-card/80"
            }`}
          >
            <Award className="w-4 h-4 inline mr-2" />
            Most Wins
          </button>
          <button
            onClick={() => setSortBy("winRate")}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              sortBy === "winRate"
                ? "bg-gradient-to-r from-purple-500 to-orange-500 text-white shadow-lg scale-105"
                : "glass-card text-foreground hover:bg-card/80"
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
          className="glass-card rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Desktop View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-orange-500 to-purple-600 text-white">
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
                    <td colSpan="6" className="px-6 py-12 text-center text-muted-foreground">
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
                      className={`border-b border-border hover:bg-card/50 transition-all ${
                        player.rank <= 3 ? "bg-card/30" : ""
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
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                            {player.name?.charAt(0).toUpperCase() || "?"}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{player.name}</p>
                            <p className="text-xs text-muted-foreground">ID: {player.userId?.playerId || "N/A"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-foreground font-medium">{player.gamesPlayed || 0}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full font-semibold border border-purple-500/30">
                          <Trophy className="w-4 h-4" />
                          {player.gamesWon || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-semibold text-orange-400">
                          {(() => {
                            const rate = Number(player.winRate || 0);
                            return isNaN(rate) ? "0.0" : rate.toFixed(1);
                          })()}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-xl font-bold text-orange-400">
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
          <div className="md:hidden divide-y divide-border">
            {leaderboard.length === 0 ? (
              <div className="px-6 py-12 text-center text-muted-foreground">
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
                    player.rank <= 3 ? "bg-card/30" : ""
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
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-purple-500 flex items-center justify-center text-white font-bold">
                      {player.name?.charAt(0).toUpperCase() || "?"}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">{player.name}</p>
                      <p className="text-xs text-muted-foreground">ID: {player.userId?.playerId || "N/A"}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-card/50 backdrop-blur-sm px-3 py-2 rounded-lg border border-border/20">
                      <p className="text-xs text-muted-foreground">Games</p>
                      <p className="font-semibold text-foreground">{player.gamesPlayed || 0}</p>
                    </div>
                    <div className="bg-card/50 backdrop-blur-sm px-3 py-2 rounded-lg border border-purple-500/20">
                      <p className="text-xs text-muted-foreground">Wins</p>
                      <p className="font-semibold text-purple-400">{player.gamesWon || 0}</p>
                    </div>
                    <div className="bg-card/50 backdrop-blur-sm px-3 py-2 rounded-lg border border-orange-500/20">
                      <p className="text-xs text-muted-foreground">Win Rate</p>
                      <p className="font-semibold text-orange-400">
                        {(() => {
                          const rate = Number(player.winRate || 0);
                          return isNaN(rate) ? "0.0" : rate.toFixed(1);
                        })()}%
                      </p>
                    </div>
                    <div className="bg-card/50 backdrop-blur-sm px-3 py-2 rounded-lg border border-orange-500/20">
                      <p className="text-xs text-muted-foreground">Winnings</p>
                      <p className="font-semibold text-orange-400">
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
          className="text-center text-muted-foreground text-sm mt-6"
        >
          Rankings update in real-time based on game results
        </motion.p>
      </div>
    </section>
  );
};

export default LeaderboardSection;
