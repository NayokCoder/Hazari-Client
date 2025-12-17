"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSignup } from "@/hooks/api";

const SignupPage = () => {
  const router = useRouter();
  const signup = useSignup();
  const [formData, setFormData] = useState({
    name: "",
    mobileNumber: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSignup = (e) => {
    e.preventDefault();

    // Validate inputs
    if (!formData.name || !formData.mobileNumber) {
      alert("Please fill in all fields");
      return;
    }

    // Validate mobile number (10 digits)
    if (!/^\d{10}$/.test(formData.mobileNumber)) {
      alert("Please enter a valid 10-digit mobile number");
      return;
    }

    // Call API to create user
    signup.mutate(
      {
        name: formData.name,
        mobileNumber: formData.mobileNumber,
      },
      {
        onSuccess: (data) => {
          console.log("Signup successful:", data);
          // Store user in localStorage for session management
          localStorage.setItem("hazari-current-user", JSON.stringify(data.data.user));
          alert("Account created successfully!");
          router.push("/dashboard");
        },
        onError: (error) => {
          console.error("Signup error:", error);
          alert(error.message || "Failed to create account. Mobile number may already exist.");
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
          <p className="text-gray-600">Join Hazari and start playing</p>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSignup} className="space-y-6">
          {/* Name Input */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} placeholder="Enter your full name" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          {/* Mobile Number Input */}
          <div>
            <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-700 mb-2">
              Mobile Number
            </label>
            <input type="tel" id="mobileNumber" name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} placeholder="Enter 10-digit mobile number" maxLength="10" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          {/* Submit Button */}
          <button type="submit" disabled={signup.isPending} className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 rounded-lg shadow-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
            {signup.isPending ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        {/* Login Link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-blue-600 hover:text-blue-700 font-semibold">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
