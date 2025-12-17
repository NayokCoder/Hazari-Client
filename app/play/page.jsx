"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "../(home)/wrapper";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useCreateTable } from "@/hooks/api/useTable";
import { Loader2 } from "lucide-react";

const PlayPage = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [matchFee, setMatchFee] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const createTable = useCreateTable();

  useEffect(() => {
    const currentUser = localStorage.getItem("hazari-current-user");
    if (currentUser) {
      setUser(JSON.parse(currentUser));
    } else {
      router.push("/auth/login");
    }
  }, [router]);

  // Generate unique table code
  const generateTableCode = () => {
    const prefix = "HGS";
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    return `${prefix}-${randomNum}`;
  };

  const handleStartNow = () => {
    if (!matchFee) {
      alert("Please enter match fee");
      return;
    }

    if (!user) {
      alert("Please login first");
      router.push("/auth/login");
      return;
    }

    const tableCode = generateTableCode();
    const prize = parseFloat(matchFee) * 4;

    // Create table data object
    const tableData = {
      tableCode,
      author: user.id,
      matchFee: parseFloat(matchFee),
      prize,
      status: "waiting",
      maxPlayers: 4,
      players: [
        {
          userId: user.id,
          name: user.name,
          position: 1,
          isAuthor: true,
          joinedAt: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
    };

    // Save to localStorage FIRST (optimistic UI)
    localStorage.setItem(`table-${tableCode}`, JSON.stringify(tableData));

    // Navigate immediately
    setIsDialogOpen(false);
    setMatchFee("");
    router.push(`/table/${tableCode}`);

    // Then create in database in background
    createTable.mutate(
      {
        userId: user.id,
        matchFee: parseFloat(matchFee),
        prize,
        tableCode,
      },
      {
        onSuccess: (data) => {
          console.log("Table created in database:", data);
          // Update localStorage with database response
          localStorage.setItem(`table-${tableCode}`, JSON.stringify(data.data.table));
        },
        onError: (error) => {
          console.error("Error creating table in database:", error);
          // Table still exists in localStorage, so user can continue
        },
      }
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <section className="flex items-center justify-center min-h-[60vh] px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg text-center">
            {/* Title */}
            <h2 className="text-2xl font-bold text-gray-900">Start Playing</h2>

            {/* Subtitle */}
            <p className="mt-2 text-sm text-gray-500">Create a new table or join an existing one</p>

            {/* User Info */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-gray-600">Playing as</p>
              <p className="text-lg font-semibold text-blue-600">{user.name}</p>
            </div>

            {/* Buttons */}
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="primary" className="w-full sm:w-auto">
                    Create Table
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Table</DialogTitle>
                    <DialogDescription>Set up a new game table. You will be Player 1.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    {/* Player Name Display */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Your Name</label>
                      <div className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">{user.name}</div>
                    </div>

                    {/* Match Fee Input */}
                    <div className="space-y-2">
                      <label htmlFor="matchFee" className="text-sm font-medium text-gray-700">
                        Match Fee
                      </label>
                      <input id="matchFee" type="number" placeholder="Enter match fee" value={matchFee} onChange={(e) => setMatchFee(e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      {matchFee && <p className="text-xs text-gray-500">Total Prize: ₹{parseFloat(matchFee) * 4}</p>}
                    </div>

                    {/* Start Now Button */}
                    <Button variant="primary" className="w-full mt-4" onClick={handleStartNow} disabled={createTable.isPending}>
                      {createTable.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating Table...
                        </>
                      ) : (
                        "Start Now !"
                      )}
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
      </div>
    </div>
  );
};

export default PlayPage;
