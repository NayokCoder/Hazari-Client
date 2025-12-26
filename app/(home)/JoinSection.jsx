"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "./wrapper";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const JoinSection = () => {
  const router = useRouter();
  const [playerName, setPlayerName] = useState("");
  const [matchFee, setMatchFee] = useState("");
  const [gamePoint, setGamePoint] = useState("");

  // Generate unique table code
  const generateTableCode = () => {
    const prefix = "HGS";
    const randomNum = Math.floor(100000 + Math.random() * 900000); // 6-digit number
    return `${prefix}-${randomNum}`;
  };

  const handleStartNow = () => {
    if (!matchFee || !playerName) {
      alert("Please enter both player name and match fee");
      return;
    }

    if (!gamePoint) {
      alert("Please enter game point");
      return;
    }

    const tableCode = generateTableCode();
    const prize = parseFloat(matchFee) * 4;

    // Save game settings to localStorage
    localStorage.setItem(`game-${tableCode}-settings`, JSON.stringify({
      matchFee: parseFloat(matchFee),
      prize,
      gamePoint: parseFloat(gamePoint),
      author: playerName,
      createdAt: new Date().toISOString(),
      tableCode,
    }));

    // Initialize players with author as Player 1
    localStorage.setItem(`game-${tableCode}-players`, JSON.stringify([
      { id: 1, name: playerName, total: 0, currentInput: "", isAuthor: true },
      { id: 2, name: "Player 2", total: 0, currentInput: "", isAuthor: false },
      { id: 3, name: "Player 3", total: 0, currentInput: "", isAuthor: false },
      { id: 4, name: "Player 4", total: 0, currentInput: "", isAuthor: false },
    ]));

    // Navigate to dynamic route with the table code
    router.push(`/table/${tableCode}`);
  };

  return (
    <section className="flex items-center justify-center min-h-[60vh] px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg text-center">
        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900">Start Playing</h2>

        {/* Subtitle */}
        <p className="mt-2 text-sm text-gray-500">Create a new table or join an existing one</p>

        {/* Buttons */}
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="primary" className="w-full sm:w-auto">
                Create Table
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Table</DialogTitle>
                <DialogDescription>Set up a new game table. Configure your game settings below.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {/* Player Name Input */}
                <div className="space-y-2">
                  <label htmlFor="playerName" className="text-sm font-medium text-gray-700">
                    Player Name
                  </label>
                  <input
                    id="playerName"
                    type="text"
                    placeholder="Enter your name"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Match Fee Input */}
                <div className="space-y-2">
                  <label htmlFor="matchFee" className="text-sm font-medium text-gray-700">
                    Match Fee
                  </label>
                  <input
                    id="matchFee"
                    type="number"
                    placeholder="Enter match fee"
                    value={matchFee}
                    onChange={(e) => setMatchFee(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Game Point Input */}
                <div className="space-y-2">
                  <label htmlFor="gamePoint" className="text-sm font-medium text-gray-700">
                    Game Point
                  </label>
                  <input
                    id="gamePoint"
                    type="number"
                    placeholder="Enter game point"
                    value={gamePoint}
                    onChange={(e) => setGamePoint(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Start Now Button */}
                <Button variant="primary" className="w-full mt-4" onClick={handleStartNow}>
                  Start Now
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Button variant="secondary" className="w-full sm:w-auto">
            Join Table
          </Button>
        </div>
      </div>
    </section>
  );
};

export default JoinSection;
