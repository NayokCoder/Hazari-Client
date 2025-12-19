"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Gamepad2, DollarSign, Users, LogIn, UserPlus, Sparkles, Trophy, Clock } from "lucide-react";
import LeaderboardSection from "@/components/Leaderboard/LeaderboardSection";

const HomePage = () => {
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in, redirect to dashboard
    const currentUser = localStorage.getItem("hazari-current-user");
    if (currentUser) {
      router.push("/dashboard");
    }
  }, [router]);

  const features = [
    { icon: Clock, title: "Play Anytime", desc: "24/7 gaming available" },
    { icon: DollarSign, title: "Win Prizes", desc: "Real rewards await" },
    { icon: Users, title: "Multiplayer", desc: "Challenge your friends" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-40 right-10 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

      <div className="max-w-6xl w-full relative z-10">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: 360 }}
            transition={{ duration: 0.8, type: "spring" }}
            className="mb-8 inline-block"
          >
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-green-500 via-blue-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl relative">
              <Gamepad2 className="w-12 h-12 text-white" />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute -top-2 -right-2"
              >
                <Sparkles className="w-8 h-8 text-yellow-400" />
              </motion.div>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-6xl font-bold text-gray-900 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-green-600 via-blue-600 to-purple-600"
          >
            Welcome to Hazari
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-2xl text-gray-700 mb-4"
          >
            The ultimate card game experience
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex items-center justify-center gap-2 text-gray-600"
          >
            <Trophy className="w-5 h-5 text-yellow-500" />
            <span>Join thousands of players worldwide</span>
          </motion.div>
        </motion.div>

        {/* Login/Signup Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          {/* Login Card */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            whileHover={{ scale: 1.05, y: -5 }}
            className="bg-white rounded-2xl shadow-2xl p-8 hover:shadow-3xl transition-all relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-100 to-green-200 rounded-full blur-2xl opacity-0 group-hover:opacity-50 transition-opacity -mr-16 -mt-16"></div>
            <div className="relative">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <LogIn className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Already a Player?</h2>
              <p className="text-gray-600 mb-6">Login to continue your winning streak</p>
              <Link
                href="/auth/login"
                className="block w-full py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-center rounded-xl font-semibold text-lg shadow-lg transition-all hover:shadow-xl"
              >
                Login Now
              </Link>
            </div>
          </motion.div>

          {/* Signup Card */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            whileHover={{ scale: 1.05, y: -5 }}
            className="bg-white rounded-2xl shadow-2xl p-8 hover:shadow-3xl transition-all relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-200 rounded-full blur-2xl opacity-0 group-hover:opacity-50 transition-opacity -mr-16 -mt-16"></div>
            <div className="relative">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <UserPlus className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">New to Hazari?</h2>
              <p className="text-gray-600 mb-6">Create account and start your journey</p>
              <Link
                href="/auth/signup"
                className="block w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white text-center rounded-xl font-semibold text-lg shadow-lg transition-all hover:shadow-xl"
              >
                Sign Up Free
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 + index * 0.2 }}
              whileHover={{ scale: 1.1, rotate: 2 }}
              className="text-center bg-white bg-opacity-50 backdrop-blur-sm rounded-xl p-6 shadow-lg"
            >
              <div className="bg-gradient-to-br from-blue-100 to-purple-100 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4">
                <feature.icon className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Leaderboard Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6, duration: 0.6 }}
          className="mt-20"
        >
          <LeaderboardSection />
        </motion.div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default HomePage;
