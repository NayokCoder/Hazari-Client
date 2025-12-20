"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export const Balance = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Load current user
    const currentUser = localStorage.getItem("hazari-current-user");
    if (currentUser) {
      setUser(JSON.parse(currentUser));
    }
  }, []);

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (confirmLogout) {
      localStorage.removeItem("hazari-current-user");
      setUser(null);
      router.push("/auth/login");
    }
  };

  if (!user) {
    // Show login/signup buttons if not logged in
    return (
      <div className="bg-gradient-to-r from-blue-50 to-green-50 py-6 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Welcome to Hazari</h2>
              <p className="text-gray-600 text-sm">Login or create an account to start playing</p>
            </div>
            <div className="flex gap-3">
              <Link href="/auth/login" className="px-6 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition shadow-lg">
                Login
              </Link>
              <Link href="/auth/signup" className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition shadow-lg">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show user info if logged in
  return (
    <div className="bg-gradient-to-r from-blue-50 to-green-50 py-6 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg">
              <span className="text-2xl font-bold text-blue-600">{user.name.charAt(0).toUpperCase()}</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
              <p className="text-sm text-gray-600">ID: {user.id}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white rounded-lg px-6 py-3 shadow-lg">
              <p className="text-xs text-gray-500">Balance</p>
              <p className="text-2xl font-bold text-green-600">৳ {user.balance}</p>
            </div>
            <div className="bg-white rounded-lg px-6 py-3 shadow-lg">
              <p className="text-xs text-gray-500">Games Won</p>
              <p className="text-2xl font-bold text-blue-600">{user.gamesWon}</p>
            </div>
            <div className="flex gap-2">
              <Link href="/profile" className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition">
                Profile
              </Link>
              <button onClick={handleLogout} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition">
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React from "react";
import clsx from "clsx";

const Button = ({ children, className, variant = "primary", ...props }) => {
  const base = "inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variants = {
    primary: "bg-black text-white hover:bg-gray-800 focus:ring-black",
    secondary: "bg-gray-100 text-black hover:bg-gray-200 focus:ring-gray-400",
    danger: "bg-red-500 text-white hover:bg-red-600 focus:ring-red-500",
  };

  return (
    <button className={clsx(base, variants[variant], className)} {...props}>
      {children}
    </button>
  );
};

export default Button;
