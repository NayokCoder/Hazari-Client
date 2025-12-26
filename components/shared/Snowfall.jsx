"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const Snowfall = ({ snowflakeCount = 50 }) => {
  const [snowflakes, setSnowflakes] = useState([]);

  useEffect(() => {
    const flakes = Array.from({ length: snowflakeCount }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      animationDuration: Math.random() * 8 + 10, // Slower: 10-18 seconds instead of 2-5
      opacity: Math.random() * 0.5 + 0.3,
      fontSize: Math.random() * 8 + 12,
      delay: Math.random() * 8,
    }));
    setSnowflakes(flakes);
  }, [snowflakeCount]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {snowflakes.map((flake) => (
        <motion.div
          key={flake.id}
          className="absolute text-white"
          initial={{ top: "-10%", left: `${flake.left}%` }}
          animate={{
            top: "110%",
            left: `${flake.left + Math.sin(flake.id) * 5}%`,
          }}
          transition={{
            duration: flake.animationDuration,
            repeat: Infinity,
            delay: flake.delay,
            ease: "linear",
          }}
          style={{
            opacity: flake.opacity,
            fontSize: `${flake.fontSize}px`,
          }}
        >
          ❄
        </motion.div>
      ))}
    </div>
  );
};

export default Snowfall;
