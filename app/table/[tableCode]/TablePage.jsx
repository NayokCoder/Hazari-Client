"use client";

import React, { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTableDetails, useTableInvitations, useSendInvitation, useResetTable } from "@/hooks/api/useTable";
import { useActiveGame, useStartGame, useAddRound, useCompleteGame } from "@/hooks/api/useGame";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Users, Send, Loader2, UserPlus } from "lucide-react";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

const TablePage = ({ params }) => {
  console.log(params);
  const { tableCode } = use(params);
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [localTableData, setLocalTableData] = useState(null);

  // Load table from localStorage first
  useEffect(() => {
    const localData = localStorage.getItem(`table-${tableCode}`);
    if (localData) {
      setLocalTableData(JSON.parse(localData));
    }
  }, [tableCode]);

  // Fetch table details from API (only if localStorage is empty)
  const { data: tableData, isLoading: tableLoading } = useTableDetails(tableCode, {
    enabled: !localTableData,
  });
  const { data: invitationsData, isLoading: invitationsLoading } = useTableInvitations(tableCode);
  const sendInvitation = useSendInvitation();

  // Fetch active game data from API
  const { data: gameData, isLoading: gameLoading } = useActiveGame(tableCode, {
    refetchInterval: 4000, // Refresh every 5 seconds
  });
  const startGameMutation = useStartGame();
  const addRoundMutation = useAddRound();
  const completeGameMutation = useCompleteGame();
  const resetTableMutation = useResetTable();

  // Track if we've attempted to start the game
  const [gameStartAttempted, setGameStartAttempted] = React.useState(false);

  // Sync API data to localStorage when it arrives
  useEffect(() => {
    if (tableData?.data?.table) {
      const apiTable = tableData.data.table;
      localStorage.setItem(`table-${tableCode}`, JSON.stringify(apiTable));
      setLocalTableData(apiTable);

      // Auto-start game when table is full and game not started yet
      if (apiTable.players?.length === 4 && apiTable.status === "playing" && !gameData?.data?.game && !gameStartAttempted && !startGameMutation.isPending) {
        console.log("Table is full, starting game...");
        setGameStartAttempted(true);
        startGameMutation.mutate({ tableCode });
      }
    }
  }, [tableData, tableCode, gameData?.data?.game, gameStartAttempted, startGameMutation.isPending]);

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

  // Winner state
  const [winner, setWinner] = useState(null);
  const [showWinnerModal, setShowWinnerModal] = useState(false);

  // Game extension state
  const [isExtended, setIsExtended] = useState(false);
  const [winningThreshold, setWinningThreshold] = useState(1000);

  // Load game data from API when available
  useEffect(() => {
    if (gameData?.data?.game) {
      const game = gameData.data.game;
      console.log("🎮 Game data from API:", game);
      console.log(
        "📊 Player scores:",
        game.players.map((p) => ({ name: p.name, score: p.totalScore }))
      );

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
        console.log("✅ Updated local players:", updatedPlayers);
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

      console.log("Game data loaded from API:", game);
    }
  }, [gameData]);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem(`game-${tableCode}-players`, JSON.stringify(players));
    localStorage.setItem(`game-${tableCode}-history`, JSON.stringify(roundHistory));
  }, [players, roundHistory, tableCode]);

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
      tableCode,
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
  const handleAddPoints = () => {
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

    // Save to API (totals and rounds will be updated from API refetch)
    addRoundMutation.mutate(
      { gameId, roundData: roundDataForAPI, tableCode },
      {
        onSuccess: (response) => {
          // Check if game is won (server handles winner detection)
          if (response.data?.game?.status === "completed") {
            const game = response.data.game;

            if (game.winner) {
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
                      } else {
                        console.error("❌ Invalid user data response:", userData);
                      }
                    } catch (error) {
                      console.error("❌ Failed to refresh user profile:", error);
                    }
                  } else {
                    console.warn("⚠️ No currentUser found, cannot refresh profile");
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
                  // Still show winner modal even if finalization fails
                  setWinner({
                    name: game.winner.name,
                    total: game.winner.finalScore,
                    finalRoundPoints: game.winner.finalRoundPoints,
                  });
                  setShowWinnerModal(true);
                },
              });
            } else {
            }
          } else if (response.data?.game?.isExtended && response.data?.game?.winningThreshold === 1500) {
            // Game was extended (check isExtended flag instead of winningThresholdUpdated)

            setIsExtended(true);
            setWinningThreshold(1500);
            alert("Match Extended! Two or more players reached 1000. New winning threshold: 1500 points!");
          } else {
            console.log("ℹ️ Game still active, current threshold:", response.data?.game?.winningThreshold);
          }
        },
        onError: (error) => {
          console.error("Error saving round:", error);
          alert("Failed to save round to database");
        },
      }
    );

    // Winner detection is now handled by the server
    /* Old client-side winner detection removed - now handled in API response */
  };

  // Reset game after winner
  const handleResetGame = () => {
    // Reset table status in database
    resetTableMutation.mutate(tableCode, {
      onSuccess: () => {
        // console.log("✅ Table reset, starting new game...");

        // Reset local state
        // const resetPlayers = players.map((player) => ({
        //   ...player,
        //   total: 0,
        //   currentInput: "",
        // }));

        setPlayers(resetPlayers);
        setRoundHistory([]);
        setWinner(null);
        setShowWinnerModal(false);
        setIsExtended(false);
        setWinningThreshold(1000);
        setGameStartAttempted(false); // Allow game to start again

        // Save reset players to localStorage (preserving names)
        localStorage.setItem(`game-${tableCode}-players`, JSON.stringify(resetPlayers));
        localStorage.removeItem(`game-${tableCode}-history`);

        // Start new game
        // console.log("🎮 Starting new game...");
        startGameMutation.mutate(
          { tableCode },
          {
            onSuccess: () => {
              // console.log("✅ New game started!");
            },
            onError: (error) => {
              console.error("❌ Failed to start new game:", error);
              alert("Failed to start new game. Please refresh the page.");
            },
          }
        );
      },
      onError: (error) => {
        console.error("❌ Failed to reset table:", error);
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
    console.log("Edit player:", playerId);
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
        tableCode,
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

  // Get table from localStorage or API (localStorage has priority)
  const table = localTableData || tableData?.data?.table;

  // Check if current user is the table author
  const isAuthor = () => {
    if (!currentUser || !table) return false;
    const authorId = typeof table.author === "object" ? table.author._id || table.author.id : table.author;
    const isTableAuthor = authorId?.toString() === currentUser.id;
    console.log("isAuthor check:", { authorId, currentUserId: currentUser.id, isTableAuthor });
    return isTableAuthor;
  };

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
    <div className="min-h-screen bg-linear-to-br from-green-50 to-blue-50 p-2">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-2 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-bold text-gray-900">Game Table</h1>
              <p className="text-gray-600 mt-1">
                Table Code: <span className="font-mono font-semibold text-blue-600">{tableCode}</span>
              </p>
              <div className="mt-2 flex gap-3 text-xs flex-wrap">
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded">Prize: ₹{table.prize}</span>
                <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded">Fee: ₹{table.matchFee}</span>
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                  Players: {table.players.length}/{table.maxPlayers}
                </span>
                <span className={`px-2 py-1 rounded font-semibold ${table.status === "waiting" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}>{table.status === "waiting" ? "Waiting for Players" : table.status === "playing" ? "In Progress" : table.status}</span>
                {isExtended && <span className="px-2 py-1 rounded font-semibold bg-red-100 text-red-700 animate-pulse">Target: {winningThreshold} ⚡ EXTENDED</span>}
              </div>
            </div>
            <div className="flex gap-4 text-xs">
              <button className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium">Share Code</button>
              <button onClick={handleLeaveTable} className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium">
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
                <div className="bg-white rounded-lg shadow-lg p-1">
                  {/* Player Name or Invite Button */}
                  <div className="flex items-center justify-between mb-4">
                    {playerInSlot ? (
                      <div className="flex items-center gap-1">
                        <h3 className="text-sm font-bold text-gray-900">{playerInSlot.name}</h3>
                        {playerInSlot.isAuthor && (
                          <span className="text-xs bg-yellow-100 text-yellow-700 px-1 py-0.5 rounded" title="Table Creator">
                            👑
                          </span>
                        )}
                      </div>
                    ) : invitation ? (
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-semibold text-orange-600">Invitation Pending</span>
                        <span className="text-xs text-gray-500">To: {invitation.toPlayerId}</span>
                      </div>
                    ) : (
                      isAuthor() && (
                        <button onClick={() => handleOpenInviteModal(position)} className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded-md font-medium">
                          <UserPlus className="w-3 h-3" />
                          Invite
                        </button>
                      )
                    )}
                  </div>

                  {playerInSlot ? (
                    <>
                      {/* Total Count */}
                      <div className="mb-4 py-1 bg-blue-50 rounded-lg text-center">
                        <p className="text-xs text-gray-600 mb-1">Total Points</p>
                        <p className="text-xl font-bold text-blue-600">{player?.total || 0}</p>
                      </div>

                      {/* Input */}
                      <div className="mb-1">
                        <div className="flex gap-2">
                          <input type="number" value={player?.currentInput || ""} onChange={(e) => handleInputChange(position, e.target.value)} placeholder="Enter points" className="flex-1 px-2 py-2 border w-22 border-gray-300 rounded-md" />
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-32">{invitation ? <Users className="w-12 h-12 text-orange-300" /> : <Users className="w-12 h-12 text-gray-300" />}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-center my-10">
          <button onClick={handleAddPoints} className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md font-medium">
            +
          </button>
        </div>

        <div className="mt-4">
          <p className="text-base text-center border-b font-medium text-gray-700 mb-5">Recent Points</p>
          <div className="max-h-96 overflow-y-auto space-y-4">
            {roundHistory.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-2">No points yet</p>
            ) : (
              roundHistory.map((round, roundIndex) => (
                <div key={roundIndex} className="bg-gray-50 rounded-md p-3">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Round {round.roundNumber}</p>
                  <div className="grid grid-cols-4 gap-2">
                    {round.players.map((player) => (
                      <div key={player.id} className="bg-white rounded p-2 text-center">
                        <p className="text-xs text-gray-600">{player.name}</p>
                        <p className="text-lg font-bold text-gray-900">{player.points}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Winner Modal */}
        {showWinnerModal && winner && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-md rounded-xl border bg-background p-6 shadow-xl animate-in fade-in zoom-in-95">
              {/* Header */}
              <div className="flex flex-col items-center gap-2 border-b pb-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <span className="text-3xl">🎉</span>
                </div>

                <h2 className="text-2xl font-semibold tracking-tight">Congratulations</h2>

                <p className="text-sm text-muted-foreground">Winner of the match</p>

                <p className="text-lg font-bold text-primary">{winner.name}</p>

                {isExtended && <span className="rounded-md bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive">⚡ Extended Match Victory</span>}
              </div>

              {/* Stats */}
              <div className="mt-6 space-y-4">
                <div className="rounded-lg border p-4 text-center">
                  <p className="text-xs text-muted-foreground">Final Score</p>
                  <p className="text-3xl font-bold">{winner.total}</p>
                </div>

                <div className="rounded-lg border p-4 text-center">
                  <p className="text-xs text-muted-foreground">Final Round Points</p>
                  <p className="text-xl font-semibold">{winner.finalRoundPoints}</p>
                </div>

                {gameSettings && (
                  <div className="rounded-lg border border-green-500/30 bg-green-500/5 p-4 text-center">
                    <p className="text-xs text-muted-foreground">You Won</p>
                    <p className="text-3xl font-bold text-green-600">₹{gameSettings.prize}</p>
                    <p className="mt-1 text-xs text-muted-foreground">Prize Pool ₹{gameSettings.matchFee} × 4 players</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="mt-6">
                <button onClick={handleResetGame} className="inline-flex h-11 w-full items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  Start New Game
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
                <label htmlFor="playerId" className="text-sm font-medium text-gray-700">
                  Player ID
                </label>
                <input id="playerId" type="text" placeholder="Enter 6-digit Player ID" value={invitePlayerId} onChange={(e) => setInvitePlayerId(e.target.value)} maxLength={6} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-xs text-gray-600 mb-1">Match Details</p>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Match Fee:</span>
                  <span className="font-semibold">₹{table.matchFee}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Prize Pool:</span>
                  <span className="font-semibold text-green-600">₹{table.prize}</span>
                </div>
              </div>

              <button onClick={handleSendInvitation} disabled={sendInvitation.isPending || !invitePlayerId} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed">
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
