"use client";

import type { CursorData } from "@/lib/socket";

interface LiveCursorsProps {
  cursors: CursorData[];
}

// Map Tailwind gradient classes to solid CSS colors for the SVG cursors
function gradientToColor(color: string): string {
  if (color.includes("purple")) return "#7b2cbf";
  if (color.includes("blue")) return "#2563eb";
  if (color.includes("green")) return "#16a34a";
  if (color.includes("red")) return "#dc2626";
  if (color.includes("pink")) return "#db2777";
  if (color.includes("orange")) return "#ea580c";
  if (color.includes("yellow")) return "#ca8a04";
  if (color.includes("teal") || color.includes("cyan")) return "#0891b2";
  if (color.includes("indigo")) return "#4f46e5";
  if (color.includes("rose")) return "#e11d48";
  return "#5a189a";
}

// Map Tailwind bg classes to CSS colors for labels
function labelBgToColor(bg: string): string {
  if (bg.includes("red")) return "#ef4444";
  if (bg.includes("orange")) return "#f97316";
  if (bg.includes("yellow")) return "#eab308";
  if (bg.includes("green")) return "#22c55e";
  if (bg.includes("blue")) return "#3b82f6";
  if (bg.includes("purple")) return "#a855f7";
  if (bg.includes("pink")) return "#ec4899";
  if (bg.includes("indigo")) return "#6366f1";
  return "#8b5cf6";
}

export default function LiveCursors({ cursors }: LiveCursorsProps) {
  if (cursors.length === 0) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-[100] overflow-hidden">
      {cursors.map((cursor) => {
        const cursorColor = gradientToColor(cursor.userColor);
        const dragging = cursor.draggingCard;
        return (
          <div
            key={cursor.userId}
            className="absolute transition-all duration-200 ease-out"
            style={{ left: cursor.x, top: cursor.y }}
          >
            {/* Cursor SVG */}
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill={cursorColor}
              stroke="white"
              strokeWidth="1.5"
              className="drop-shadow-md"
            >
              <path d="M5.65 2.65l12.7 9.35-5.5 1.2-3.3 5.1z" />
            </svg>
            {/* Label */}
            <div
              className="ml-4 mt-0.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold text-white shadow-lg"
              style={{
                backgroundColor: cursorColor,
                fontFamily: "'Poppins', sans-serif",
              }}
            >
              {cursor.userName}
            </div>
            {/* Dragging card preview */}
            {dragging && (
              <div
                className="ml-3 mt-2 w-48 overflow-hidden rounded-xl border border-white/40 bg-white shadow-2xl"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                {/* Colored top accent */}
                <div className="h-1" style={{ backgroundColor: cursorColor }} />
                <div className="p-2.5">
                  {/* Labels */}
                  {dragging.labels.length > 0 && (
                    <div className="mb-1.5 flex flex-wrap gap-1">
                      {dragging.labels.slice(0, 3).map((label, i) => (
                        <span
                          key={i}
                          className="rounded px-1.5 py-0.5 text-[8px] font-semibold text-white"
                          style={{ backgroundColor: labelBgToColor(label.color) }}
                        >
                          {label.name}
                        </span>
                      ))}
                    </div>
                  )}
                  {/* Title */}
                  <p className="mb-1.5 truncate text-xs font-semibold text-gray-900">
                    {dragging.title}
                  </p>
                  {/* Progress bar */}
                  <div className="mb-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[8px] text-gray-400">Progress</span>
                      <span className="text-[8px] font-bold text-gray-500">{dragging.progress}%</span>
                    </div>
                    <div className="mt-0.5 h-1 w-full overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${dragging.progress}%`, backgroundColor: cursorColor }}
                      />
                    </div>
                  </div>
                  {/* Assignee */}
                  {dragging.assignee && (
                    <div className="flex items-center gap-1.5">
                      <div
                        className="flex h-4 w-4 items-center justify-center rounded-full text-[7px] font-bold text-white"
                        style={{ backgroundColor: gradientToColor(dragging.assignee.color) }}
                      >
                        {dragging.assignee.avatar}
                      </div>
                      <span className="truncate text-[9px] text-gray-500">{dragging.assignee.name}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
