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

export default function LiveCursors({ cursors }: LiveCursorsProps) {
  if (cursors.length === 0) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-[100] overflow-hidden">
      {cursors.map((cursor) => {
        const cursorColor = gradientToColor(cursor.userColor);
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
          </div>
        );
      })}
    </div>
  );
}
