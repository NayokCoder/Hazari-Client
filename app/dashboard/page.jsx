"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Wallet, Trophy, GamepadIcon, TrendingUp, Play, User, Sparkles, Target, Award, PlusCircle, Users, Loader2 } from "lucide-react";
import StatsCard from "@/components/shared/StatsCard";
import GameCard from "@/components/shared/GameCard";
import UserAvatar from "@/components/shared/UserAvatar";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import LeaderboardSection from "@/components/Leaderboard/LeaderboardSection";
import { useUserProfile, useWalletBalance } from "@/hooks/api";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCreateTable, useJoinTable } from "@/hooks/api/useTable";
import { useToast } from "@/components/shared/Toast";
import Snowfall from "@/components/shared/Snowfall";

const DashboardPage = () => {
  const router = useRouter();
  const [userId, setUserId] = useState(null);
  const [activeTable, setActiveTable] = useState(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
  const [matchFee, setMatchFee] = useState("");
  const [gamePoint, setGamePoint] = useState("");
  const [tableCode, setTableCode] = useState("");

  const createTable = useCreateTable();
  const joinTable = useJoinTable();
  const toast = useToast();

  // Get userId and check for active table
  useEffect(() => {
    const currentUser = localStorage.getItem("hazari-current-user");
    if (currentUser) {
      const user = JSON.parse(currentUser);
      setUserId(user.id);

      // Check localStorage for active tables
      const allKeys = Object.keys(localStorage);
      const tableKeys = allKeys.filter((key) => key.startsWith("table-HGS-"));

      if (tableKeys.length > 0) {
        // Get the most recent table
        const latestTableKey = tableKeys[tableKeys.length - 1];
        const tableData = JSON.parse(localStorage.getItem(latestTableKey));

        // Check if user is in this table and it's not completed
        if (tableData && tableData.status !== "completed") {
          const isInTable = tableData.players?.some((p) => p.userId === user.id);
          if (isInTable) {
            setActiveTable(tableData);
          }
        }
      }
    } else {
      router.push("/auth/login");
    }
  }, [router]);

  // Fetch user profile and wallet balance from API
  const { data: profileData, isLoading: profileLoading, refetch: refetchProfile } = useUserProfile(userId);
  const { data: walletData, isLoading: walletLoading, refetch: refetchWallet } = useWalletBalance(userId);

  // Listen for user data updates (e.g., after round wins are recorded)
  useEffect(() => {
    const handleUserUpdate = () => {
      refetchProfile();
      refetchWallet();
    };

    window.addEventListener("userUpdated", handleUserUpdate);

    return () => {
      window.removeEventListener("userUpdated", handleUserUpdate);
    };
  }, [refetchProfile, refetchWallet]);

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

  // Generate unique table code
  const generateTableCode = () => {
    const prefix = "HGS";
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    return `${prefix}-${randomNum}`;
  };

  const handleCreateTable = () => {
    if (!matchFee) {
      toast.warning("Please enter match fee");
      return;
    }

    if (!gamePoint) {
      toast.warning("Please enter game point");
      return;
    }

    const newTableCode = generateTableCode();
    const prize = parseFloat(matchFee) * 4;

    // Create in database FIRST, then navigate on success
    createTable.mutate(
      {
        userId: user.id,
        matchFee: parseFloat(matchFee),
        prize,
        gamePoint: parseFloat(gamePoint),
        tableCode: newTableCode,
      },
      {
        onSuccess: (data) => {
          console.log("✅ Table created in database:", data);

          // Save to localStorage
          localStorage.setItem(`table-${newTableCode}`, JSON.stringify(data.data.table));

          // Update user balance if returned
          if (data.data.newBalance !== undefined) {
            const updatedUser = { ...user, balance: data.data.newBalance };
            localStorage.setItem("hazari-current-user", JSON.stringify(updatedUser));

            // Notify other components
            window.dispatchEvent(new Event("userUpdated"));
          }

          // Close dialog, clear inputs, and navigate AFTER success
          setIsCreateDialogOpen(false);
          setMatchFee("");
          setGamePoint("");
          toast.success(`Table ${newTableCode} created successfully!`);
          router.push(`/table/${newTableCode}`);
        },
        onError: (error) => {
          console.error("❌ Error creating table:", error);
          toast.error(error.response?.data?.message || "Failed to create table");
        },
      }
    );
  };

  const handleJoinTable = () => {
    if (!tableCode || !tableCode.trim()) {
      toast.warning("Please enter a table code");
      return;
    }

    // Validate and format table code
    let trimmedCode = tableCode.trim().toUpperCase();

    // If user only entered 6 digits, auto-add the HGS- prefix
    if (/^\d{6}$/.test(trimmedCode)) {
      trimmedCode = `HGS-${trimmedCode}`;
    }

    const isValidFormat = /^HGS-\d{6}$/.test(trimmedCode);

    if (!isValidFormat) {
      toast.error(`Invalid table code format. Required: HGS-XXXXXX or just 6 digits (e.g., 123456)`);
      return;
    }

    // Update the input field to show the formatted code
    setTableCode(trimmedCode);

    // Join table via API
    joinTable.mutate(
      {
        tableCode: trimmedCode,
        userId: user.id,
      },
      {
        onSuccess: (data) => {
          // Save table to localStorage
          localStorage.setItem(`table-${trimmedCode}`, JSON.stringify(data.data.table));

          // Update user balance if returned
          if (data.data.newBalance !== undefined) {
            const updatedUser = { ...user, balance: data.data.newBalance };
            localStorage.setItem("hazari-current-user", JSON.stringify(updatedUser));

            // Notify other components
            window.dispatchEvent(new Event("userUpdated"));
          }

          // Close dialog and navigate
          setIsJoinDialogOpen(false);
          setTableCode("");
          router.push(`/table/${trimmedCode}`);
        },
        onError: (error) => {
          console.error("❌ Error joining table:", error);
          toast.error(error.response?.data?.message || "Failed to join table");
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-800 py-8 px-4 relative">
      {/* Christmas Snowfall */}
      <Snowfall snowflakeCount={30} />

      {/* Festive Background Pattern */}
      <div className="fixed inset-0 opacity-10 pointer-events-none z-0" style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "50px 50px" }}></div>

      {/* Christmas Decorations */}
      <div className="fixed top-4 left-4 text-6xl animate-bounce z-40 pointer-events-none">🎄</div>
      <div className="fixed top-4 right-4 text-6xl animate-bounce z-40 pointer-events-none" style={{ animationDelay: "0.5s" }}>🎅</div>
      <div className="fixed bottom-4 left-4 text-5xl animate-pulse z-40 pointer-events-none">🎁</div>
      <div className="fixed bottom-4 right-4 text-5xl animate-pulse z-40 pointer-events-none" style={{ animationDelay: "0.3s" }}>⛄</div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Welcome Section */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-red-500/20 via-green-500/30 to-yellow-500/20 rounded-2xl shadow-xl p-8 mb-8 relative overflow-hidden border-2 border-yellow-400/30">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-red-500/20 to-green-500/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="absolute top-2 right-2 text-3xl">🔔</div>
          <div className="absolute bottom-2 left-2 text-3xl">🌟</div>
          <div className="relative flex items-center gap-6">
            <UserAvatar name={user.name} size="xl" showOnline={true} />
            <div className="flex-1">
              <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="text-[clamp(1.5rem,4vw,3.5rem)] font-bold text-white mb-2 flex items-center gap-2">
                🎄 Welcome back, {user.name} 🎄
                <Sparkles className="w-8 h-8 text-yellow-400" />
              </motion.h1>
              <motion.p initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="text-green-200 font-semibold text-sm">
                🎅 Ready to dominate some Hazari games this Christmas? 🎁
              </motion.p>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-3 flex items-center gap-4">
                <div className="px-4 py-2 bg-red-900/50 backdrop-blur-sm rounded-lg border border-yellow-500/30">
                  <p className="text-xs text-green-200">🎮 Player ID</p>
                  <p className="text-xl font-mono font-bold text-yellow-400">{user.playerId}</p>
                </div>
                <div className="px-4 py-2 bg-green-900/50 backdrop-blur-sm rounded-lg border border-red-500/30">
                  <p className="text-xs text-red-200">🏆 Win Rate</p>
                  <p className="text-lg font-bold text-yellow-400">{winRate}%</p>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <StatsCard icon={Wallet} label="Balance" value={`৳  ${balance ?? 0}`} color="orange" delay={0.1} />
          <StatsCard icon={Trophy} label="Games Won" value={user.gamesWon} color="purple" delay={0.2} />
          <StatsCard icon={GamepadIcon} label="Games Played" value={user.gamesPlayed} color="gray" delay={0.3} />
          <StatsCard icon={TrendingUp} label="Total Winnings" value={`৳  ${user.totalWinnings}`} color="black" delay={0.4} />
          <StatsCard icon={Sparkles} label="Perfect Rounds" value={user.perfectRounds || 0} color="orange" delay={0.5} />
          <StatsCard icon={Target} label="Zero Rounds" value={user.zeroRounds || 0} color="purple" delay={0.6} />
        </div>

        {/* Active Table Alert */}
        {activeTable && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-r from-red-600 via-green-600 to-red-600 rounded-2xl shadow-xl p-6 mb-8 text-white border-2 border-yellow-400/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-400/30 rounded-full flex items-center justify-center animate-pulse">
                  <GamepadIcon className="w-6 h-6 text-yellow-300" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">🎄 You have an active game! 🎄</h3>
                  <p className="text-white/90 text-sm">
                    Table Code: <span className="font-mono font-semibold">{activeTable.tableCode}</span> • Players: {activeTable.players?.length}/{activeTable.maxPlayers || 4} • Status: {activeTable.status}
                  </p>
                </div>
              </div>
              <button onClick={() => router.push(`/table/${activeTable.tableCode}`)} className="px-6 py-3 bg-yellow-400 text-red-900 rounded-lg font-semibold hover:bg-yellow-300 transition-all shadow-lg hover:shadow-xl">
                🎮 Continue Playing →
              </button>
            </div>
          </motion.div>
        )}

        {/* Quick Actions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            🎁 Quick Actions 🎁
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <div onClick={() => setIsCreateDialogOpen(true)} className="cursor-pointer glass-card rounded-2xl p-6 border-2 border-red-500/50 hover:border-yellow-400/80 transition-all shadow-lg hover:shadow-2xl group bg-gradient-to-br from-red-900/50 to-green-900/50">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <PlusCircle className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white group-hover:text-yellow-300 transition-colors">🎄 Create Table</h3>
                    <p className="text-sm text-green-200">Start a new game and invite friends</p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-yellow-500/30">
                  <span className="text-xs text-green-200">Set match fee & prize pool</span>
                  <div className="w-8 h-8 bg-red-500/30 rounded-full flex items-center justify-center group-hover:bg-yellow-400/30 transition-colors">
                    <Play className="w-4 h-4 text-yellow-400" />
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.7 }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <div onClick={() => setIsJoinDialogOpen(true)} className="cursor-pointer glass-card rounded-2xl p-6 border-2 border-green-500/50 hover:border-yellow-400/80 transition-all shadow-lg hover:shadow-2xl group bg-gradient-to-br from-green-900/50 to-red-900/50">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white group-hover:text-yellow-300 transition-colors">🎅 Join Table</h3>
                    <p className="text-sm text-red-200">Enter table code to join a game</p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-yellow-500/30">
                  <span className="text-xs text-red-200">Join with 6-digit code</span>
                  <div className="w-8 h-8 bg-green-500/30 rounded-full flex items-center justify-center group-hover:bg-yellow-400/30 transition-colors">
                    <Play className="w-4 h-4 text-yellow-400" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Recent Activity Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="mt-8 glass-card rounded-2xl shadow-xl p-6">
          <h2 className="text-2xl font-bold text-foreground mb-4">Recent Activity</h2>
          <div className="text-center py-12">
            <GamepadIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No recent games yet. Start playing to see your activity!</p>
          </div>
        </motion.div>

        {/* Leaderboard Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }} className="mt-8">
          <LeaderboardSection />
        </motion.div>
      </div>

      {/* Create Table Modal */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="glass-card border-red-500/50 bg-gradient-to-br from-red-900/90 to-green-900/90">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
              <PlusCircle className="w-6 h-6 text-yellow-400" />
              🎄 Create New Table 🎄
            </DialogTitle>
            <DialogDescription className="text-green-200">Set up a new game table. You will be Player 1.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Player Name Display */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Your Name</label>
              <div className="w-full rounded-lg border border-border bg-card/50 px-4 py-3 text-sm text-foreground font-semibold">{user.name}</div>
            </div>

            {/* Match Fee Input */}
            <div className="space-y-2">
              <label htmlFor="matchFee" className="text-sm font-medium text-foreground">
                Match Fee (৳)
              </label>
              <input id="matchFee" type="number" placeholder="Enter match fee" value={matchFee} onChange={(e) => setMatchFee(e.target.value)} className="w-full rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500" />
              {matchFee && (
                <div className="bg-orange-500/10 rounded-lg p-3 border border-orange-500/20">
                  <p className="text-sm text-foreground font-semibold">Total Prize Pool: ৳ {parseFloat(matchFee) * 4}</p>
                </div>
              )}
            </div>

            {/* Game Point Input */}
            <div className="space-y-2">
              <label htmlFor="gamePoint" className="text-sm font-medium text-foreground">
                Game Point
              </label>
              <input id="gamePoint" type="number" placeholder="Enter game point" value={gamePoint} onChange={(e) => setGamePoint(e.target.value)} className="w-full rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>

            {/* Start Now Button */}
            <button onClick={handleCreateTable} disabled={createTable.isPending} className="w-full mt-4 bg-gradient-to-r from-red-600 to-green-600 hover:from-red-700 hover:to-green-700 text-white font-bold py-3 rounded-lg shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 border-2 border-yellow-400/50">
              {createTable.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  🎄 Creating Table...
                </>
              ) : (
                <>
                  <PlusCircle className="w-5 h-5" />
                  🎁 Create Table Now
                </>
              )}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Join Table Modal */}
      <Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
        <DialogContent className="glass-card border-green-500/50 bg-gradient-to-br from-green-900/90 to-red-900/90">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
              <Users className="w-6 h-6 text-yellow-400" />
              🎅 Join Existing Table 🎅
            </DialogTitle>
            <DialogDescription className="text-red-200">Enter the table code to join an existing game.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Player Name Display */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Your Name</label>
              <div className="w-full rounded-lg border border-border bg-card/50 px-4 py-3 text-sm text-foreground font-semibold">{user.name}</div>
            </div>

            {/* Table Code Input */}
            <div className="space-y-2">
              <label htmlFor="tableCode" className="text-sm font-medium text-foreground">
                Table Code
              </label>
              <input id="tableCode" type="text" placeholder="Enter 6 digits or HGS-XXXXXX" value={tableCode} onChange={(e) => setTableCode(e.target.value.toUpperCase())} className="w-full rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono tracking-wider" maxLength={10} />
              <div className="bg-purple-500/10 rounded-lg p-3 border border-purple-500/20">
                <p className="text-xs text-muted-foreground">💡 Tip: You can enter just the 6 digits (e.g., 123456) and "HGS-" will be added automatically</p>
              </div>
            </div>

            {/* Join Now Button */}
            <button onClick={handleJoinTable} disabled={joinTable.isPending} className="w-full mt-4 bg-gradient-to-r from-green-600 to-red-600 hover:from-green-700 hover:to-red-700 text-white font-bold py-3 rounded-lg shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 border-2 border-yellow-400/50">
              {joinTable.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  🎄 Joining Table...
                </>
              ) : (
                <>
                  <Users className="w-5 h-5" />
                  🎅 Join Table Now
                </>
              )}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DashboardPage;
