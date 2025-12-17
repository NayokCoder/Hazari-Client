"use client";

import { motion } from "framer-motion";

const StatsCard = ({ icon: Icon, label, value, color = "blue", delay = 0 }) => {
  const colorClasses = {
    blue: {
      bg: "from-blue-500 to-blue-600",
      text: "text-blue-600",
      lightBg: "bg-blue-50",
      iconBg: "bg-blue-100",
    },
    green: {
      bg: "from-green-500 to-green-600",
      text: "text-green-600",
      lightBg: "bg-green-50",
      iconBg: "bg-green-100",
    },
    purple: {
      bg: "from-purple-500 to-purple-600",
      text: "text-purple-600",
      lightBg: "bg-purple-50",
      iconBg: "bg-purple-100",
    },
    orange: {
      bg: "from-orange-500 to-orange-600",
      text: "text-orange-600",
      lightBg: "bg-orange-50",
      iconBg: "bg-orange-100",
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
      <p className="text-gray-600 text-sm mb-2">{label}</p>
      <p className={`text-3xl font-bold ${colors.text}`}>{value}</p>
    </motion.div>
  );
};

export default StatsCard;
