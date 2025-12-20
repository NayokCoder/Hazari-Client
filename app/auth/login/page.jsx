"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLogin } from "@/hooks/api";

const LoginPage = () => {
  const router = useRouter();
  const login = useLogin();
  const [mobileNumber, setMobileNumber] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    // Validate mobile number
    if (!mobileNumber) {
      alert("Please enter your mobile number");
      return;
    }

    if (!/^\d{11}$/.test(mobileNumber)) {
      alert("Please enter a valid 11-digit mobile number");
      return;
    }

    // Call API to login
    login.mutate(
      { mobileNumber },
      {
        onSuccess: (data) => {
          console.log("Login successful:", data);
          // Store user in localStorage for session management
          localStorage.setItem("hazari-current-user", JSON.stringify(data.data.user));
          // alert(`Welcome back, ${data.data.user.name}!`);
          router.push("/dashboard");
        },
        onError: (error) => {
          console.error("Login error:", error);
          alert(error.message || "Mobile number not found. Please create an account first.");
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md glass-card rounded-2xl shadow-2xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 via-purple-500 to-purple-600 bg-clip-text text-transparent mb-2">Welcome Back Juaries</h1>
          <p className="text-muted-foreground">Login to your Hazari account</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          {/* Mobile Number Input */}
          <div>
            <label htmlFor="mobileNumber" className="block text-sm font-medium text-foreground mb-2">
              Mobile Number
            </label>
            <input type="tel" id="mobileNumber" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} placeholder="Enter your mobile number" maxLength="11" className="w-full px-4 py-3 border border-border bg-card rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500" />
          </div>

          {/* Submit Button */}
          <button type="submit" disabled={login.isPending} className="w-full bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white font-semibold py-3 rounded-lg shadow-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
            {login.isPending ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Signup Link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/auth/signup" className="text-orange-400 hover:text-orange-500 font-semibold">
              Create one here
            </Link>
          </p>
        </div>

        {/* User Info Display (for testing) */}
        <div className="mt-8 p-4 bg-card/50 backdrop-blur-sm rounded-lg border border-border/20">
          <p className="text-xs text-muted-foreground text-center">Your account stores: Name, Mobile, Balance, Games Won & Played</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
