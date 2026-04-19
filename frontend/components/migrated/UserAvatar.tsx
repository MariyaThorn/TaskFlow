"use client";

import { useState } from "react";

interface UserAvatarProps {
  name: string;
  avatar: string;
  color: string;
  size?: "sm" | "md" | "lg";
  isActive?: boolean;
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

export default function UserAvatar({ name, avatar, color, size = "md", isActive, showStatus = false, className = "", onClick, children }: UserAvatarProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      className={`group/avatar relative inline-flex ${className}`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onClick={onClick}
    >
      <div
        className={`relative flex items-center justify-center rounded-full bg-gradient-to-br ${color} ${sizeClasses[size]} font-semibold text-white ring-2 ring-white transition-transform hover:scale-110`}
      >
        {avatar}
        {showStatus && (
          <span
            className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white ${
              isActive ? "bg-green-400" : "bg-gray-400"
            }`}
          />
        )}
      </div>

      {/* Custom tooltip */}
      {showTooltip && (
        <div className="pointer-events-none absolute -top-10 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap">
          <div
            className={`rounded-lg bg-gradient-to-r ${color} px-3 py-1.5 text-xs font-semibold text-white shadow-lg`}
          >
            {name}
          </div>
          {/* Arrow */}
          <div className="mx-auto h-0 w-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-[#5a189a]" />
        </div>
      )}

      {children}
    </div>
  );
}
