"use client";

import React, { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTableDetails, useTableInvitations, useSendInvitation } from "@/hooks/api/useTable";
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

  // Sync API data to localStorage when it arrives
  useEffect(() => {
    if (tableData?.data?.table) {
      const apiTable = tableData.data.table;
      localStorage.setItem(`table-${tableCode}`, JSON.stringify(apiTable));
      setLocalTableData(apiTable);
    }
  }, [tableData, tableCode]);

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

  // Load data from localStorage on mount
  useEffect(() => {
    const savedPlayers = localStorage.getItem(`game-${tableCode}-players`);
    const savedHistory = localStorage.getItem(`game-${tableCode}-history`);
    const savedSettings = localStorage.getItem(`game-${tableCode}-settings`);

    if (savedPlayers) {
      setPlayers(JSON.parse(savedPlayers));
    }
    if (savedHistory) {
      setRoundHistory(JSON.parse(savedHistory));
    }
    if (savedSettings) {
      setGameSettings(JSON.parse(savedSettings));
    }
  }, [tableCode]);

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
    const winAmount = prize - matchFee;

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

    // Create new round data
    const newRound = {
      roundNumber: roundHistory.length + 1,
      players: players.map((player) => ({
        id: player.id,
        name: player.name,
        points: parseInt(player.currentInput) || 0,
      })),
    };

    // Update players totals and clear inputs
    const updatedPlayers = players.map((player) => {
      const points = parseInt(player.currentInput) || 0;
      return {
        ...player,
        total: player.total + points,
        currentInput: "",
      };
    });

    setPlayers(updatedPlayers);
    setRoundHistory([newRound, ...roundHistory]); // Add to front (most recent first)

    // Check for players who reached the current threshold
    const playersAboveThreshold = updatedPlayers.filter((player) => player.total >= winningThreshold);

    if (playersAboveThreshold.length > 0) {
      // If threshold is 1000
      if (winningThreshold === 1000) {
        if (playersAboveThreshold.length === 1) {
          // Only 1 player reached 1000, they win
          const winningPlayer = playersAboveThreshold[0];
          const finalRoundPoints = parseInt(players.find((p) => p.id === winningPlayer.id)?.currentInput) || 0;

          const winnerData = {
            ...winningPlayer,
            finalRoundPoints,
          };

          // Save final game data
          saveFinalGameData(winnerData, updatedPlayers, newRound);

          setWinner(winnerData);
          setShowWinnerModal(true);
        } else if (playersAboveThreshold.length >= 2) {
          // 2 or more players reached 1000, extend to 1500
          setIsExtended(true);
          setWinningThreshold(1500);
          alert("Match Extended! Two or more players reached 1000. New winning threshold: 1500 points!");
        }
      }
      // If threshold is 1500 (extended game)
      else if (winningThreshold === 1500) {
        if (playersAboveThreshold.length === 1) {
          // Only 1 player reached 1500, they win
          const winningPlayer = playersAboveThreshold[0];
          const finalRoundPoints = parseInt(players.find((p) => p.id === winningPlayer.id)?.currentInput) || 0;

          const winnerData = {
            ...winningPlayer,
            finalRoundPoints,
          };

          // Save final game data
          saveFinalGameData(winnerData, updatedPlayers, newRound);

          setWinner(winnerData);
          setShowWinnerModal(true);
        } else if (playersAboveThreshold.length >= 2) {
          // 2 or more players reached 1500, highest score wins
          const winningPlayer = playersAboveThreshold.reduce((highest, current) => (current.total > highest.total ? current : highest));

          const finalRoundPoints = parseInt(players.find((p) => p.id === winningPlayer.id)?.currentInput) || 0;

          const winnerData = {
            ...winningPlayer,
            finalRoundPoints,
          };

          // Save final game data
          saveFinalGameData(winnerData, updatedPlayers, newRound);

          setWinner(winnerData);
          setShowWinnerModal(true);
        }
      }
    }
  };

  // Reset game after winner
  const handleResetGame = () => {
    // Reset all players to 0 but preserve names and author status
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

    // Save reset players to localStorage (preserving names)
    localStorage.setItem(`game-${tableCode}-players`, JSON.stringify(resetPlayers));
    localStorage.removeItem(`game-${tableCode}-history`);
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
          console.log("Invitation sent:", data);
          alert(`Invitation sent to Player ${invitePlayerId}!`);
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
    const authorId = typeof table.author === 'object' ? table.author._id || table.author.id : table.author;
    const isTableAuthor = authorId?.toString() === currentUser.id;
    console.log('isAuthor check:', { authorId, currentUserId: currentUser.id, isTableAuthor });
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
              {/* Congratulations Header */}
              <div className="mb-6">
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Congratulations!</h2>
                <p className="text-xl font-semibold text-blue-600">{winner.name}</p>
                {isExtended && <p className="text-sm font-medium text-red-600 mt-2">⚡ Extended Match Victory!</p>}
              </div>

              {/* Winner Stats */}
              <div className="space-y-4 mb-6">
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Final Score</p>
                  <p className="text-4xl font-bold text-orange-600">{winner.total}</p>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Final Round Points</p>
                  <p className="text-2xl font-bold text-blue-600">{winner.finalRoundPoints}</p>
                </div>

                {gameSettings && (
                  <>
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-5 border-2 border-green-300">
                      <p className="text-sm text-gray-600 mb-1">You Won</p>
                      <p className="text-4xl font-bold text-green-600">₹{gameSettings.prize - gameSettings.matchFee}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        (Prize: ₹{gameSettings.prize} - Fee: ₹{gameSettings.matchFee})
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Close Button */}
              <button onClick={handleResetGame} className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-semibold text-lg shadow-lg">
                Start New Game
              </button>
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
