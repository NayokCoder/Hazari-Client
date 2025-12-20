"use client";

import { motion } from "framer-motion";

const StatsCard = ({ icon: Icon, label, value, color = "orange", delay = 0 }) => {
  const colorClasses = {
    orange: {
      bg: "from-orange-500 to-orange-600",
      text: "text-orange-400",
      lightBg: "bg-card/50 backdrop-blur-sm border border-orange-500/20",
      iconBg: "bg-orange-500/20",
    },
    purple: {
      bg: "from-purple-500 to-purple-600",
      text: "text-purple-400",
      lightBg: "bg-card/50 backdrop-blur-sm border border-purple-500/20",
      iconBg: "bg-purple-500/20",
    },
    gray: {
      bg: "from-gray-600 to-gray-700",
      text: "text-gray-300",
      lightBg: "bg-card/50 backdrop-blur-sm border border-gray-500/20",
      iconBg: "bg-gray-500/20",
    },
    black: {
      bg: "from-gray-800 to-gray-900",
      text: "text-gray-200",
      lightBg: "bg-card/50 backdrop-blur-sm border border-gray-700/20",
      iconBg: "bg-gray-700/20",
    },
  };

  const colors = colorClasses[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ scale: 1.05, y: -5 }}
      className={`${colors.lightBg} rounded-xl shadow-lg p-6 cursor-pointer transition-all hover:shadow-xl`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`${colors.iconBg} p-3 rounded-lg`}>
          <Icon className={`w-6 h-6 ${colors.text}`} />
        </div>
      </div>
      <p className="text-muted-foreground text-sm mb-2">{label}</p>
      <p className={`text-3xl font-bold ${colors.text}`}>{value}</p>
    </motion.div>
  );
};

export default StatsCard;
