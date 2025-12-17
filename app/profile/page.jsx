"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const ProfilePage = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Load current user
    const currentUser = localStorage.getItem("hazari-current-user");
    if (currentUser) {
      setUser(JSON.parse(currentUser));
    } else {
      // Redirect to login if no user logged in
      router.push("/auth/login");
    }
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
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
            <div className="flex gap-3">
              <Link
                href="/"
                className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg font-medium transition"
              >
                Home
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition"
              >
                Logout
              </button>
            </div>
          </div>

          {/* User Info Card */}
          <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* User ID */}
              <div className="bg-white rounded-lg p-4 shadow">
                <p className="text-xs text-gray-500 mb-1">User ID</p>
                <p className="text-sm font-mono font-semibold text-gray-900">{user.id}</p>
              </div>

              {/* Name */}
              <div className="bg-white rounded-lg p-4 shadow">
                <p className="text-xs text-gray-500 mb-1">Full Name</p>
                <p className="text-lg font-semibold text-gray-900">{user.name}</p>
              </div>

              {/* Mobile Number */}
              <div className="bg-white rounded-lg p-4 shadow">
                <p className="text-xs text-gray-500 mb-1">Mobile Number</p>
                <p className="text-lg font-semibold text-gray-900">{user.mobileNumber}</p>
              </div>

              {/* Balance */}
              <div className="bg-white rounded-lg p-4 shadow">
                <p className="text-xs text-gray-500 mb-1">Balance</p>
                <p className="text-2xl font-bold text-green-600">₹{user.balance}</p>
              </div>

              {/* Games Won */}
              <div className="bg-white rounded-lg p-4 shadow">
                <p className="text-xs text-gray-500 mb-1">Games Won</p>
                <p className="text-2xl font-bold text-blue-600">{user.gamesWon}</p>
              </div>

              {/* Games Played */}
              <div className="bg-white rounded-lg p-4 shadow">
                <p className="text-xs text-gray-500 mb-1">Games Played</p>
                <p className="text-2xl font-bold text-purple-600">{user.gamesPlayed}</p>
              </div>

              {/* Total Winnings */}
              <div className="bg-white rounded-lg p-4 shadow col-span-full">
                <p className="text-xs text-gray-500 mb-1">Total Winnings</p>
                <p className="text-3xl font-bold text-orange-600">₹{user.totalWinnings}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-white rounded-2xl shadow-2xl p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Statistics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">Win Rate</p>
              <p className="text-2xl font-bold text-blue-600">
                {user.gamesPlayed > 0 ? ((user.gamesWon / user.gamesPlayed) * 100).toFixed(1) : 0}%
              </p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">Avg. Winnings</p>
              <p className="text-2xl font-bold text-green-600">
                ₹{user.gamesWon > 0 ? (user.totalWinnings / user.gamesWon).toFixed(0) : 0}
              </p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600">Member Since</p>
              <p className="text-sm font-semibold text-purple-600">
                {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <p className="text-sm text-gray-600">Status</p>
              <p className="text-sm font-semibold text-orange-600">Active</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
