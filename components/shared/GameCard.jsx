"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const GameCard = ({ icon: Icon, title, description, href, gradient, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ scale: 1.05, rotate: 1 }}
      whileTap={{ scale: 0.95 }}
    >
      <Link
        href={href}
        className={`block bg-gradient-to-br ${gradient} text-white rounded-2xl shadow-xl p-8 text-center transition-all hover:shadow-2xl group`}
      >
        <motion.div
          className="mb-4 flex justify-center"
          whileHover={{ rotate: 360, scale: 1.2 }}
          transition={{ duration: 0.6 }}
        >
          <div className="bg-white bg-opacity-20 p-4 rounded-full">
            <Icon className="w-12 h-12" />
          </div>
        </motion.div>
        <h2 className="text-2xl font-bold mb-2">{title}</h2>
        <p className="text-white text-opacity-90 mb-4">{description}</p>
        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-sm font-semibold">Get Started</span>
          <ArrowRight className="w-4 h-4" />
        </div>
      </Link>
    </motion.div>
  );
};

export default GameCard;
