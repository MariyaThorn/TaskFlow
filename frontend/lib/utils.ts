import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Build the API base URL dynamically from the current browser hostname.
 * This allows the app to work from both localhost and LAN IPs without
 * changing environment variables.
 */
export function getApiUrl(): string {
  if (typeof window !== "undefined") {
    return `http://${window.location.hostname}:3000/api`;
  }
  // SSR fallback
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
}

export function getBackendUrl(): string {
  if (typeof window !== "undefined") {
    return `http://${window.location.hostname}:3000`;
  }
  return process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:3000";
}
