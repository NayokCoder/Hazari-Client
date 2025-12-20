"use client";

import { motion } from "framer-motion";
import { Gamepad2, Sparkles } from "lucide-react";

const LoadingSpinner = ({ message = "Loading..." }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-black via-gray-900 to-gray-800 relative overflow-hidden">
      {/* Animated Background Circles */}
      <motion.div
        className="absolute top-20 left-20 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.5, 0.3, 0.5],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Animated Logo/Icon */}
        <motion.div
          className="relative"
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <div className="w-24 h-24 bg-gradient-to-br from-orange-500 via-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl">
            <Gamepad2 className="w-12 h-12 text-white" />
          </div>
        </motion.div>

        {/* Sparkles Animation */}
        <motion.div
          className="absolute -top-2 -right-2"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Sparkles className="w-6 h-6 text-orange-400" />
        </motion.div>

        {/* Loading Dots */}
        <div className="flex gap-2 mt-8">
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className="w-3 h-3 bg-gradient-to-r from-orange-500 to-purple-600 rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "easeInOut",
                delay: index * 0.2,
              }}
            />
          ))}
        </div>

        {/* Message */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 text-foreground font-semibold text-lg"
        >
          {message}
        </motion.p>

        {/* Sub Message */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{
            delay: 0.5,
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="mt-2 text-muted-foreground text-sm"
        >
          Please wait...
        </motion.p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
