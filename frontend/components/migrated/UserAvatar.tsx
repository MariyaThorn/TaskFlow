"use client";

import { useState } from "react";

interface UserAvatarProps {
  name: string;
  avatar: string;
  color: string;
  size?: "sm" | "md" | "lg";
  isActive?: boolean;
  statusAnimation?: "pop-in" | "pop-out";
  showStatus?: boolean;
  className?: string;
  onClick?: () => void;
  children?: React.ReactNode;
}

const sizeClasses = {
  sm: "h-7 w-7 text-xs",
  md: "h-8 w-8 text-xs",
  lg: "h-10 w-10 text-sm",
};

export default function UserAvatar({ name, avatar, color, size = "md", isActive, statusAnimation, showStatus = false, className = "", onClick, children }: UserAvatarProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      className={`group/avatar relative inline-flex ${className}`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onClick={onClick}
    >
      <div
        className={`relative flex items-center justify-center rounded-full bg-gradient-to-br ${color} ${sizeClasses[size]} font-semibold text-white ring-2 ${isActive ? "ring-green-400" : "ring-white"} transition-all hover:scale-110 ${
          statusAnimation === "pop-in" ? "animate-avatar-pop-in" : statusAnimation === "pop-out" ? "animate-avatar-pop-out" : ""
        }`}
      >
        {avatar}
      </div>

      {/* Custom tooltip */}
      {showTooltip && (
        <div className="pointer-events-none absolute top-full left-1/2 z-50 mt-1.5 -translate-x-1/2 whitespace-nowrap">
          {/* Arrow pointing up */}
          <div className="mx-auto h-0 w-0 border-l-[6px] border-r-[6px] border-b-[6px] border-l-transparent border-r-transparent border-b-[#5a189a]" />
          <div
            className={`rounded-lg bg-gradient-to-r ${color} px-3 py-1.5 text-xs font-semibold text-white shadow-lg`}
          >
            {name}
          </div>
        </div>
      )}

      {children}
    </div>
  );
}
