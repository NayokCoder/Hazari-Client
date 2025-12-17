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

    if (!/^\d{10}$/.test(mobileNumber)) {
      alert("Please enter a valid 10-digit mobile number");
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
          alert(`Welcome back, ${data.data.user.name}!`);
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Login to your Hazari account</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          {/* Mobile Number Input */}
          <div>
            <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-700 mb-2">
              Mobile Number
            </label>
            <input
              type="tel"
              id="mobileNumber"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              placeholder="Enter your mobile number"
              maxLength="10"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={login.isPending}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 rounded-lg shadow-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {login.isPending ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Signup Link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <Link href="/auth/signup" className="text-blue-600 hover:text-blue-700 font-semibold">
              Create one here
            </Link>
          </p>
        </div>

        {/* User Info Display (for testing) */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600 text-center">
            Your account stores: Name, Mobile, Balance, Games Won & Played
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
