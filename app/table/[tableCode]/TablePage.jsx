"use client";

import React, { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTableDetails, useTableInvitations, useSendInvitation, useResetTable } from "@/hooks/api/useTable";
import { useActiveGame, useStartGame, useAddRound, useEditRound, useCompleteGame } from "@/hooks/api/useGame";
import { useIncrementRoundWins } from "@/hooks/api/useUser";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Users, Send, Loader2, UserPlus, Crown, X } from "lucide-react";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { ImUserTie } from "react-icons/im";
import { SiGitextensions } from "react-icons/si";
import { Atom, BlinkBlur, ThreeDot } from "react-loading-indicators";

const TablePage = ({ params }) => {
  const unwrappedParams = use(params);
  // Decode URI component in case Next.js encoded the hyphen or other characters
  const rawTableCode = unwrappedParams?.tableCode;
  const tableCode = rawTableCode ? decodeURIComponent(rawTableCode) : null;
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [localTableData, setLocalTableData] = useState(null);

  // Winner state (declared early to use in hooks)
  const [winner, setWinner] = useState(null);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [isResettingGame, setIsResettingGame] = useState(false);
  const [isCompletingGame, setIsCompletingGame] = useState(false);
  const [isAddingPoints, setIsAddingPoints] = useState(false);

  // Use ref for immediate duplicate prevention (updates synchronously)
  const isCompletingRef = React.useRef(false);

  // Validate table code format
  useEffect(() => {
    if (!tableCode) {
      console.error("❌ No table code provided");
      alert("No table code provided. Please check the URL.");
      router.push("/play");
      return;
    }

    // Trim any whitespace from tableCode
    const trimmedCode = tableCode.trim();
    const isValidTableCode = /^HGS-\d{6}$/.test(trimmedCode);

    if (!isValidTableCode) {
      console.error("❌ Invalid table code format:", tableCode);
      alert(`Invalid table code format. Table codes should be in format HGS-XXXXXX (e.g., HGS-123456)`);
      router.push("/play");
      return;
    }
  }, [tableCode, router]);

  // Load table from localStorage first
  useEffect(() => {
    if (!tableCode) return;
    const trimmedCode = tableCode.trim();
    const localData = localStorage.getItem(`table-${trimmedCode}`);
    if (localData) {
      setLocalTableData(JSON.parse(localData));
    }
  }, [tableCode]);

  // Fetch table details from API (only if localStorage is empty)
  const trimmedTableCode = tableCode?.trim() || "";
  const {
    data: tableData,
    isLoading: tableLoading,
    error: tableError,
  } = useTableDetails(trimmedTableCode, {
    enabled: !localTableData && !!trimmedTableCode && /^HGS-\d{6}$/.test(trimmedTableCode),
    retry: false, // Don't retry on 404
  });

  // Handle table not found error
  useEffect(() => {
    if (tableError) {
      console.error("Table fetch error:", tableError);
      if (tableError.response?.status === 404) {
        alert(`Table ${trimmedTableCode} not found. Please check the table code and try again.`);
        // Clear invalid localStorage data
        localStorage.removeItem(`table-${trimmedTableCode}`);
        localStorage.removeItem(`game-${trimmedTableCode}-players`);
        localStorage.removeItem(`game-${trimmedTableCode}-history`);
        router.push("/play");
      }
    }
  }, [tableError, trimmedTableCode, router]);
  const { data: invitationsData, isLoading: invitationsLoading } = useTableInvitations(trimmedTableCode);
  const sendInvitation = useSendInvitation();

  // Fetch active game data from API
  const {
    data: gameData,
    isLoading: gameLoading,
    refetch: refetchGame,
  } = useActiveGame(trimmedTableCode, {
    refetchInterval: showWinnerModal || isResettingGame || isCompletingGame ? false : 4000, // Stop polling when completing, showing modal, or resetting
  });
  const startGameMutation = useStartGame();
  const addRoundMutation = useAddRound();
  const editRoundMutation = useEditRound();
  const completeGameMutation = useCompleteGame();
  const resetTableMutation = useResetTable();
  const incrementRoundWinsMutation = useIncrementRoundWins();

  // Track if we've attempted to start the game
  const [gameStartAttempted, setGameStartAttempted] = React.useState(false);

  // Sync API data to localStorage when it arrives
  useEffect(() => {
    if (tableData?.data?.table) {
      const apiTable = tableData.data.table;
      localStorage.setItem(`table-${trimmedTableCode}`, JSON.stringify(apiTable));
      setLocalTableData(apiTable);

      // Auto-start game when table is full and game not started yet
      if (apiTable.players?.length === 4 && apiTable.status === "playing" && !gameData?.data?.game && !gameStartAttempted && !startGameMutation.isPending) {
        setGameStartAttempted(true);
        startGameMutation.mutate({ tableCode: trimmedTableCode });
      }
    }
  }, [tableData, trimmedTableCode, gameData?.data?.game, gameStartAttempted, startGameMutation.isPending]);

  // Invitation modal state
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [invitePlayerId, setInvitePlayerId] = useState("");

  // Get current user from localStorage
  useEffect(() => {
    const user = localStorage.getItem("hazari-current-user");
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
  }, []);

  // Initialize 4 players with state
  const [players, setPlayers] = useState([
    { id: 1, name: "Player 1", total: 0, currentInput: "", isAuthor: false },
    { id: 2, name: "Player 2", total: 0, currentInput: "", isAuthor: false },
    { id: 3, name: "Player 3", total: 0, currentInput: "", isAuthor: false },
    { id: 4, name: "Player 4", total: 0, currentInput: "", isAuthor: false },
  ]);

  // Store round history (all 4 players' points per round)
  const [roundHistory, setRoundHistory] = useState([]);

  // Game settings
  const [gameSettings, setGameSettings] = useState(null);

  // Game extension state
  const [isExtended, setIsExtended] = useState(false);
  const [winningThreshold, setWinningThreshold] = useState(1000);

  // Edit round state
  const [editingRound, setEditingRound] = useState(null); // { roundNumber, players: [] }
  const [isEditingRound, setIsEditingRound] = useState(false);

  // Load game data from API when available
  useEffect(() => {
    if (gameData?.data?.game) {
      const game = gameData.data.game;

      // Update players with scores from API, preserve current inputs
      setPlayers((prevPlayers) => {
        const updatedPlayers = game.players.map((p) => {
          const prevPlayer = prevPlayers.find((pp) => pp.id === p.position);
          return {
            id: p.position,
            name: p.name,
            total: p.totalScore || 0,
            currentInput: prevPlayer?.currentInput || "",
            isAuthor: p.isAuthor || false,
          };
        });
        return updatedPlayers;
      });

      // Update round history from API
      setRoundHistory(game.rounds || []);

      // Update game settings
      setWinningThreshold(game.winningThreshold || 1000);
      setIsExtended(game.isExtended || false);
      setGameSettings({
        matchFee: game.matchFee,
        prize: game.prize,
        author: game.tableCode,
        createdAt: game.createdAt,
      });
    }
  }, [gameData]);

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (!trimmedTableCode) return;
    localStorage.setItem(`game-${trimmedTableCode}-players`, JSON.stringify(players));
    localStorage.setItem(`game-${trimmedTableCode}-history`, JSON.stringify(roundHistory));
  }, [players, roundHistory, trimmedTableCode]);

  // Handle input change for each player
  const handleInputChange = (playerId, value) => {
    setPlayers(players.map((player) => (player.id === playerId ? { ...player, currentInput: value } : player)));
  };

  // Save final game data for leaderboard
  const saveFinalGameData = (winnerData, finalPlayers, finalRound) => {
    const matchFee = gameSettings?.matchFee || 0;
    const prize = gameSettings?.prize || 0;
    const winAmount = prize; // Full prize pool

    const gameData = {
      tableCode: trimmedTableCode,
      author: gameSettings?.author || "Unknown",
      winner: {
        name: winnerData.name,
        finalScore: winnerData.total,
        finalRoundPoints: winnerData.finalRoundPoints,
        winAmount: winAmount,
      },
      matchFee: matchFee,
      prize: prize,
      isExtended: isExtended,
      winningThreshold: winningThreshold,
      players: finalPlayers.map((p) => ({
        id: p.id,
        name: p.name,
        finalScore: p.total,
        isAuthor: p.isAuthor || false,
      })),
      totalRounds: finalRound.roundNumber,
      completedAt: new Date().toISOString(),
      createdAt: gameSettings?.createdAt || new Date().toISOString(),
    };

    // Get existing leaderboard data
    const leaderboardData = JSON.parse(localStorage.getItem("hazari-leaderboard") || "[]");

    // Add new game to leaderboard
    leaderboardData.push(gameData);

    // Save back to localStorage
    localStorage.setItem("hazari-leaderboard", JSON.stringify(leaderboardData));

    return gameData;
  };

  // Handle plus button click - adds points for all players at once
  const handleAddPoints = async () => {
    // Check if at least one player has input
    const hasInput = players.some((player) => player.currentInput);
    if (!hasInput) {
      alert("Please enter points for at least one player");
      return;
    }

    // Calculate total points
    const totalPoints = players.reduce((sum, player) => {
      return sum + (parseInt(player.currentInput) || 0);
    }, 0);

    // Validate total must be exactly 360
    if (totalPoints !== 360) {
      alert(`Total points must be 360. Current total: ${totalPoints}`);
      return;
    }

    // Get game ID from API data
    const gameId = gameData?.data?.game?.id;
    if (!gameId) {
      alert("Game not started yet. Please wait for all players to join.");
      return;
    }

    // Show loading
    setIsAddingPoints(true);

    // Prepare round data for API (needs userId instead of id)
    const table = localTableData || tableData?.data?.table;
    const roundDataForAPI = {
      players: players.map((player) => {
        const tablePlayer = table?.players?.find((p) => p.position === player.id);
        // Extract userId - it might be an object or a string
        const userId = typeof tablePlayer?.userId === "object" ? tablePlayer?.userId?._id || tablePlayer?.userId?.id || tablePlayer?.userId : tablePlayer?.userId || "";

        return {
          userId: userId.toString(),
          name: player.name,
          points: parseInt(player.currentInput) || 0,
        };
      }),
    };

    // Clear inputs immediately for better UX
    setPlayers(
      players.map((player) => ({
        ...player,
        currentInput: "",
      }))
    );

    // Wait 1 second to show loading spinner
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Save to API (totals and rounds will be updated from API refetch)
    addRoundMutation.mutate(
      { gameId, roundData: roundDataForAPI, tableCode: trimmedTableCode },
      {
        onSuccess: (response) => {
          // Check for 360 points (perfect round) or 0 points and update user profiles
          roundDataForAPI.players.forEach((player) => {
            const points = player.points;

            // Player got 360 points (highest/perfect round)
            if (points === 360) {
              console.log(`🎯 Player ${player.name} got 360 points! Updating profile...`);
              incrementRoundWinsMutation.mutate(
                { userId: player.userId, type: "perfect_round" },
                {
                  onSuccess: () => {
                    console.log(`✅ Perfect round win recorded for ${player.name}`);
                  },
                  onError: (error) => {
                    console.error(`❌ Failed to record perfect round for ${player.name}:`, error);
                  },
                }
              );
            }

            // Player got 0 points (clean round/no tricks won)
            if (points === 0) {
              console.log(`🎯 Player ${player.name} got 0 points! Updating profile...`);
              incrementRoundWinsMutation.mutate(
                { userId: player.userId, type: "zero_round" },
                {
                  onSuccess: () => {
                    console.log(`✅ Zero round win recorded for ${player.name}`);
                  },
                  onError: (error) => {
                    console.error(`❌ Failed to record zero round for ${player.name}:`, error);
                  },
                }
              );
            }
          });

          // Check if game is won (server handles winner detection)
          if (response.data?.game?.status === "completed") {
            const game = response.data.game;

            // Use ref for synchronous duplicate prevention
            if (game.winner && !isCompletingRef.current && !showWinnerModal) {
              // Set both ref (immediate) and state (for UI)
              isCompletingRef.current = true;
              setIsCompletingGame(true);

              // Call completeGame API to finalize the game and update balances
              completeGameMutation.mutate(game.id, {
                onSuccess: async (completeResponse) => {
                  // Refetch ALL players' profiles to get updated balances
                  if (currentUser) {
                    try {
                      const response = await fetch(`http://localhost:5000/api/users/${currentUser.id}`);
                      const userData = await response.json();

                      if (userData.success && userData.data?.user) {
                        const updatedUser = {
                          ...currentUser,
                          balance: userData.data.user.balance,
                          gamesPlayed: userData.data.user.gamesPlayed,
                          gamesWon: userData.data.user.gamesWon,
                          totalWinnings: userData.data.user.totalWinnings,
                        };

                        localStorage.setItem("hazari-current-user", JSON.stringify(updatedUser));
                        setCurrentUser(updatedUser);

                        // Dispatch event to notify other components (like Header and Profile)

                        window.dispatchEvent(new Event("userUpdated"));
                      }
                    } catch (error) {
                      console.error("❌ Failed to refresh user profile:", error);
                    }
                  }

                  // Show winner modal
                  setWinner({
                    name: game.winner.name,
                    total: game.winner.finalScore,
                    finalRoundPoints: game.winner.finalRoundPoints,
                  });
                  setShowWinnerModal(true);
                },
                onError: (error) => {
                  console.error("❌ Error finalizing game:", error);
                  isCompletingRef.current = false; // Reset ref
                  setIsCompletingGame(false); // Reset state
                  // Still show winner modal even if finalization fails
                  setWinner({
                    name: game.winner.name,
                    total: game.winner.finalScore,
                    finalRoundPoints: game.winner.finalRoundPoints,
                  });
                  setShowWinnerModal(true);
                },
              });
            }
          } else if (response.data?.game?.isExtended && response.data?.game?.winningThreshold === 1500) {
            // Game was extended (check isExtended flag instead of winningThresholdUpdated)

            setIsExtended(true);
            setWinningThreshold(1500);
            alert("Match Extended! Two or more players reached 1000. New winning threshold: 1500 points!");
          }

          // Hide loading
          setIsAddingPoints(false);
        },
        onError: (error) => {
          console.error("Error saving round:", error);
          setIsAddingPoints(false);
          alert("Failed to save round to database");
        },
      }
    );

    // Winner detection is now handled by the server
    /* Old client-side winner detection removed - now handled in API response */
  };

  // Reset game after winner
  const handleResetGame = () => {
    setIsResettingGame(true);

    // Reset local state
    const resetPlayers = players.map((player) => ({
      ...player,
      total: 0,
      currentInput: "",
    }));

    setPlayers(resetPlayers);
    setRoundHistory([]);
    setWinner(null);
    setShowWinnerModal(false);
    setIsExtended(false);
    setWinningThreshold(1000);
    setGameStartAttempted(false); // Allow game to start again
    isCompletingRef.current = false; // Reset ref
    setIsCompletingGame(false); // Reset state

    // Save reset players to localStorage (preserving names)
    localStorage.setItem(`game-${trimmedTableCode}-players`, JSON.stringify(resetPlayers));
    localStorage.removeItem(`game-${trimmedTableCode}-history`);

    // Reset table status in backend (changes status from "completed" to "playing")
    resetTableMutation.mutate(trimmedTableCode, {
      onSuccess: () => {
        // Now start new game
        startGameMutation.mutate(
          { tableCode: trimmedTableCode },
          {
            onSuccess: async () => {
              // Wait a bit for database to commit, then refetch with retry logic
              const maxRetries = 5;
              let retryCount = 0;
              let gameFound = false;

              while (retryCount < maxRetries && !gameFound) {
                await new Promise((resolve) => setTimeout(resolve, 500 * (retryCount + 1))); // Exponential delay
                const result = await refetchGame();

                if (result.data?.data?.game) {
                  gameFound = true;
                } else {
                  retryCount++;
                }
              }

              setIsResettingGame(false);
            },
            onError: (error) => {
              console.error("❌ Failed to start new game:", error);
              setIsResettingGame(false);
              alert("Failed to start new game. Please try again.");
            },
          }
        );
      },
      onError: (error) => {
        console.error("❌ Failed to reset table:", error);
        setIsResettingGame(false);
        alert("Failed to reset table. Please try again.");
      },
    });
  };

  // Handle leave table
  const handleLeaveTable = () => {
    const confirmLeave = window.confirm("Are you sure you want to leave the table?");
    if (confirmLeave) {
      router.push("/");
    }
  };

  // Handle edit button click
  const handleEdit = (playerId) => {
    // You can implement edit functionality here
  };

  // Handle opening invite modal for a position
  const handleOpenInviteModal = (position) => {
    setSelectedPosition(position);
    setInvitePlayerId("");
    setInviteModalOpen(true);
  };

  // Handle sending invitation
  const handleSendInvitation = () => {
    if (!invitePlayerId || !invitePlayerId.trim()) {
      alert("Please enter a Player ID");
      return;
    }

    if (!currentUser) {
      alert("Please login first");
      return;
    }

    const table = tableData?.data?.table;
    if (!table) {
      alert("Table not found");
      return;
    }

    sendInvitation.mutate(
      {
        tableCode: trimmedTableCode,
        fromUserId: currentUser.id,
        toPlayerId: invitePlayerId.trim(),
        position: selectedPosition,
      },
      {
        onSuccess: (data) => {
          // alert(`Invitation sent to Player ${invitePlayerId}!`);
          setInviteModalOpen(false);
          setInvitePlayerId("");
        },
        onError: (error) => {
          console.error("Error sending invitation:", error);
          alert(error.response?.data?.message || "Failed to send invitation");
        },
      }
    );
  };

  // Get invitation status for a position
  const getInvitationForPosition = (position) => {
    const invitations = invitationsData?.data?.invitations || [];
    return invitations.find((inv) => inv.position === position && inv.status === "pending");
  };

  // Handle edit round button click
  const handleEditRound = (round) => {
    setEditingRound({
      roundNumber: round.roundNumber,
      players: round.players.map((p) => ({ ...p, points: p.points })),
    });
    setIsEditingRound(true);
  };

  // Handle edit round input change
  const handleEditRoundInputChange = (userId, value) => {
    setEditingRound((prev) => ({
      ...prev,
      players: prev.players.map((p) => (p.userId === userId ? { ...p, points: parseInt(value) || 0 } : p)),
    }));
  };

  // Handle save edited round
  const handleSaveEditedRound = async () => {
    if (!editingRound) return;

    // Validate total points must be 360
    const totalPoints = editingRound.players.reduce((sum, p) => sum + p.points, 0);
    if (totalPoints !== 360) {
      alert(`Total points must be 360. Current total: ${totalPoints}`);
      return;
    }

    const gameId = gameData?.data?.game?.id;
    if (!gameId) {
      alert("Game not found");
      return;
    }

    const table = localTableData || tableData?.data?.table;
    const roundDataForAPI = {
      players: editingRound.players.map((player) => ({
        userId: player.userId,
        name: player.name,
        points: player.points,
      })),
    };

    editRoundMutation.mutate(
      { gameId, roundNumber: editingRound.roundNumber, roundData: roundDataForAPI, tableCode: trimmedTableCode },
      {
        onSuccess: (response) => {
          setIsEditingRound(false);
          setEditingRound(null);
        },
        onError: (error) => {
          console.error("Error editing round:", error);
          alert(error.response?.data?.message || "Failed to edit round");
        },
      }
    );
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setIsEditingRound(false);
    setEditingRound(null);
  };

  // Get table from localStorage or API (localStorage has priority)
  const table = localTableData || tableData?.data?.table;

  // Check if current user is the table author
  const isAuthor = () => {
    if (!currentUser || !table) return false;
    const authorId = typeof table.author === "object" ? table.author._id || table.author.id : table.author;
    const isTableAuthor = authorId?.toString() === currentUser.id;
    return isTableAuthor;
  };

  // Get player with highest total points
  const getHighestScorePlayers = () => {
    if (players.length === 0) return [];
    const maxScore = Math.max(...players.map((p) => p.total));
    // Only show crown if someone has scored (maxScore > 0)
    if (maxScore === 0) return [];
    return players.filter((p) => p.total === maxScore).map((p) => p.id);
  };

  const highestScorePlayers = getHighestScorePlayers();

  if (!currentUser) {
    return <LoadingSpinner message="Loading user..." />;
  }

  // Show loading only if we're fetching from API and have no local data
  if (tableLoading && !localTableData) {
    return <LoadingSpinner message="Loading table..." />;
  }
  if (!table) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Table not found</h2>
          <button onClick={() => router.push("/play")} className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
            Back to Play
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 p-2">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="glass-card rounded-lg shadow-lg p-2 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground mt-1">
                Table Code: <span className="font-mono font-semibold text-orange-400">{trimmedTableCode}</span>
              </p>
              <div className="mt-2 grid grid-cols-2 gap-3 text-xs ">
                <span className="bg-orange-500/20 text-orange-400 px-2 py-1 rounded border border-orange-500/30">Prize: ₹{table.prize}</span>
                <span className="bg-card/50 text-muted-foreground px-2 py-1 rounded border border-border">Fee: ₹{table.matchFee}</span>
                <span className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded border border-purple-500/30">
                  Players: {table.players.length}/{table.maxPlayers}
                </span>
                <span className={`px-2 py-1 rounded font-semibold border ${table.status === "waiting" ? "bg-orange-500/20 text-orange-400 border-orange-500/30" : "bg-purple-500/20 text-purple-400 border-purple-500/30"}`}>{table.status === "waiting" ? "Waiting for Players" : table.status === "playing" ? "In Progress" : table.status}</span>
                {isExtended && (
                  <span className="px-2 py-1 rounded font-semibold bg-destructive/20 text-destructive border border-destructive/30 animate-pulse">
                    Target: {winningThreshold} <SiGitextensions /> EXTENDED
                  </span>
                )}
              </div>
            </div>
            <div className="space-y-5 flex flex-col w-4/12 text-xs">
              <button className="px-2 py-1 bg-card/50 hover:bg-accent/50 rounded-lg font-medium text-foreground border border-border">Share Code</button>
              <button onClick={handleLeaveTable} className="px-2 py-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-lg font-medium">
                Leave Table
              </button>
            </div>
          </div>
        </div>

        {/* Players Grid */}
        <div className="grid grid-cols-4 gap-1">
          {[1, 2, 3, 4].map((position) => {
            const playerInSlot = table.players.find((p) => p.position === position);
            const invitation = getInvitationForPosition(position);
            const player = players.find((p) => p.id === position);

            return (
              <div key={position} className="">
                <div className="glass-card rounded-lg shadow-lg p-1 min-w-22">
                  {/* Player Name or Invite Button */}
                  <div className="flex items-center mb-4 justify-between ">
                    {playerInSlot ? (
                      <div className="relative flex items-center gap-1 ">
                        <h3 className="text-sm font-bold text-center text-foreground">{playerInSlot.name}</h3>
                        {playerInSlot.isAuthor && (
                          <span className="text-xs bg-orange-500/20 text-orange-400 px-1 py-0.5 rounded border border-orange-500/30" title="Table Creator">
                            <ImUserTie className="w-4 h-4" />
                          </span>
                        )}
                        {highestScorePlayers.includes(position) && (
                          <span className="absolute top-12/12 right-2/8  text-xs  px-1 py-0.5 rounded" title="Highest Score">
                            <Crown className="w-5 h-5 text-orange-400 fill-orange-400" />
                          </span>
                        )}
                      </div>
                    ) : invitation ? (
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-semibold text-orange-400">Invitation Pending</span>
                        <span className="text-xs text-muted-foreground">To: {invitation.toPlayerId}</span>
                      </div>
                    ) : (
                      isAuthor() && (
                        <button onClick={() => handleOpenInviteModal(position)} className="flex items-center gap-1 px-2 py-1 text-xs bg-purple-500 hover:bg-purple-600 text-white rounded-md font-medium">
                          <UserPlus className="w-3 h-3" />
                          Invite
                        </button>
                      )
                    )}
                  </div>

                  {playerInSlot ? (
                    <>
                      {/* Total Count */}
                      <div className="mb-4 py-1 bg-purple-500/20 rounded-lg text-center border border-purple-500/30">
                        {/* <p className="text-xs text-gray-600 mb-1">Total Points</p> */}
                        <p className="text-xl font-bold text-purple-400">{player?.total || 0}</p>
                      </div>

                      {/* Input */}
                      <div className="mb-1">
                        <div className="flex gap-2">
                          <input type="tel" value={player?.currentInput || ""} onChange={(e) => handleInputChange(position, e.target.value)} placeholder="Enter points" disabled={showWinnerModal || isResettingGame || isCompletingGame} className="flex-1 px-2 py-2 border w-20 min-w-20 bg-gray-800 border-border text-foreground rounded-md placeholder:text-muted-foreground disabled:bg-muted disabled:cursor-not-allowed" />
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-32">{invitation ? <Users className="w-12 h-12 text-orange-400/40" /> : <Users className="w-12 h-12 text-muted-foreground/40" />}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-center my-10">
          <button onClick={handleAddPoints} disabled={showWinnerModal || isResettingGame || isCompletingGame || isAddingPoints} className="px-4 py-2 w-40 h-12 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-xl rounded-3xl font-medium disabled:bg-muted disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg">
            {isAddingPoints ? (
              <div className="flex items-center justify-center h-full">
                <ThreeDot color="#fefefe" size="small" text="" textColor="" />
              </div>
            ) : (
              "+"
            )}
          </button>
        </div>

        <div className="">
          <p className="text-base text-center border-b border-border font-medium text-foreground pb-2">Recent Points</p>
          <div className="max-h-96 overflow-y-auto space-y-4">
            {roundHistory.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-2">No points yet</p>
            ) : (
              [...roundHistory].reverse().map((round, roundIndex) => {
                const isLatestRound = roundIndex === 0;
                const isEditingThisRound = isEditingRound && editingRound?.roundNumber === round.roundNumber;

                return (
                  <div key={roundIndex} className="bg-card/50 backdrop-blur-sm rounded-md p-3 border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-foreground">Round {round.roundNumber}</p>
                        {round.isEdited && <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded border border-orange-500/30">Edited</span>}
                      </div>
                      {isLatestRound && isAuthor() && !isEditingThisRound && !showWinnerModal && (
                        <button onClick={() => handleEditRound(round)} className="text-xs px-2 py-1 bg-purple-500 hover:bg-purple-600 text-white rounded">
                          Edit
                        </button>
                      )}
                    </div>

                    {isEditingThisRound ? (
                      <div>
                        <div className="grid grid-cols-4 gap-2 mb-3">
                          {editingRound.players.map((player) => (
                            <div key={player.userId} className="bg-card rounded p-2 border border-border">
                              <p className="text-xs text-muted-foreground mb-1 text-center">{player.name}</p>
                              <input type="tel" value={player.points} onChange={(e) => handleEditRoundInputChange(player.userId, e.target.value)} className="w-full px-2 py-1 border border-border bg-card/50 text-foreground rounded text-center text-sm" />
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2 justify-end">
                          <button onClick={handleCancelEdit} className="text-xs px-3 py-1 bg-muted hover:bg-accent text-foreground rounded">
                            Cancel
                          </button>
                          <button onClick={handleSaveEditedRound} disabled={editRoundMutation.isPending} className="text-xs px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded disabled:bg-muted disabled:cursor-not-allowed">
                            {editRoundMutation.isPending ? "Saving..." : "Save"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-4 gap-2">
                        {round.players.map((player) => (
                          <div key={player.id} className="bg-card rounded p-2 text-center border border-border">
                            <p className="text-xs text-muted-foreground">{player.name}</p>
                            <p className="text-lg font-bold text-foreground">{player.points}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Winner Modal */}
        {showWinnerModal && winner && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-primary   backdrop-blur-sm p-4">
            <div className="relative w-full max-w-md rounded-xl border border-border bg-gradient-primary  p-6 shadow-xl animate-in fade-in zoom-in-95">
              {/* Close Button */}
              <button onClick={() => setShowWinnerModal(false)} className="absolute top-4 right-4 rounded-full p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors" aria-label="Close modal">
                <X className="w-5 h-5" />
              </button>

              {/* Header */}
              <div className="flex flex-col items-center gap-2 border-b border-border pb-4">
                <h2 className="text-2xl font-semibold tracking-tight text-foreground">Congratulations</h2>

                <p className="text-sm text-muted-foreground">Winner of the match</p>

                <p className="text-lg font-bold text-primary">{winner.name}</p>

                {isExtended && <span className="rounded-md bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive">⚡ Extended Match Victory</span>}
              </div>

              {/* Stats */}
              <div className="mt-6 space-y-4">
                <div className="rounded-lg border border-border bg-card/50 p-4 text-center">
                  <p className="text-xs text-muted-foreground">Final Score</p>
                  <p className="text-3xl font-bold text-foreground">{winner.total}</p>
                </div>

                <div className="rounded-lg border border-border bg-card/50 p-4 text-center">
                  <p className="text-xs text-muted-foreground">Final Round Points</p>
                  <p className="text-xl font-semibold text-foreground">{winner.finalRoundPoints}</p>
                </div>

                {gameSettings && (
                  <div className="rounded-lg border border-orange-500/30 bg-orange-500/10 p-4 text-center">
                    <p className="text-xs text-muted-foreground">You Won</p>
                    <p className="text-3xl font-bold text-orange-400">₹{gameSettings.prize}</p>
                    <p className="mt-1 text-xs text-muted-foreground">Prize Pool ₹{gameSettings.matchFee} × 4 players</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="mt-6">
                <button onClick={handleResetGame} disabled={isResettingGame} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:bg-muted disabled:cursor-not-allowed">
                  {isResettingGame ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Starting New Game...
                    </>
                  ) : (
                    "Start New Game"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Invitation Modal */}
        <Dialog open={inviteModalOpen} onOpenChange={setInviteModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite Player to Position {selectedPosition}</DialogTitle>
              <DialogDescription>Enter the 6-digit Player ID to send an invitation. Match Fee: ₹{table.matchFee}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="playerId" className="text-sm font-medium text-foreground">
                  Player ID
                </label>
                <input id="playerId" type="text" placeholder="Enter 6-digit Player ID" value={invitePlayerId} onChange={(e) => setInvitePlayerId(e.target.value)} maxLength={6} className="w-full rounded-md border border-border bg-card/50 text-foreground px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground" />
              </div>

              <div className="bg-purple-500/20 rounded-lg p-3 border border-purple-500/30">
                <p className="text-xs text-muted-foreground mb-1">Match Details</p>
                <div className="flex justify-between text-sm">
                  <span className="text-foreground">Match Fee:</span>
                  <span className="font-semibold text-orange-400">₹{table.matchFee}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-foreground">Prize Pool:</span>
                  <span className="font-semibold text-purple-400">₹{table.prize}</span>
                </div>
              </div>

              <button onClick={handleSendInvitation} disabled={sendInvitation.isPending || !invitePlayerId} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-purple-600 text-white rounded-md hover:from-orange-600 hover:to-purple-700 disabled:bg-muted disabled:cursor-not-allowed">
                {sendInvitation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Invitation
                  </>
                )}
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default TablePage;
