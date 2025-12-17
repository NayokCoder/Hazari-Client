"use client";

import { User } from "lucide-react";

const UserAvatar = ({ name, size = "md", showOnline = false }) => {
  const sizes = {
    sm: "w-8 h-8 text-sm",
    md: "w-12 h-12 text-lg",
    lg: "w-16 h-16 text-2xl",
    xl: "w-20 h-20 text-3xl",
  };

  const initial = name ? name.charAt(0).toUpperCase() : "U";

  return (
    <div className="relative inline-block">
      <div
        className={`${sizes[size]} bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg`}
      >
        {initial}
      </div>
      {showOnline && (
        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
      )}
    </div>
  );
};

export default UserAvatar;
