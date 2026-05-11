import { getApiUrl } from "@/lib/utils";

export interface AuthUser {
  id: string;
  email: string;
  username?: string;
  firstName: string;
  lastName: string;
  occupation: string;
  avatarColor?: string;
  profileImage?: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

const TOKEN_KEY = "taskflow_token";
const USER_KEY = "taskflow_user";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveAuth(data: AuthResponse) {
  localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${getApiUrl()}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Login failed");
  }

  saveAuth(data);
  return data;
}

export async function register(
  email: string,
  password: string,
  extra?: { firstName?: string; lastName?: string; username?: string; occupation?: string }
): Promise<AuthResponse> {
  const res = await fetch(`${getApiUrl()}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password, ...extra }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Registration failed");
  }

  saveAuth(data);
  return data;
}

export async function logout(): Promise<void> {
  await fetch(`${getApiUrl()}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
  clearAuth();
}

export async function fetchMe(): Promise<AuthUser> {
  const token = getToken();
  const res = await fetch(`${getApiUrl()}/auth/me`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    credentials: "include",
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to fetch user");
  }

  return data.user;
}

export async function googleOAuth(): Promise<AuthResponse> {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  
  if (!clientId) {
    throw new Error("Google Client ID is not configured. Please set NEXT_PUBLIC_GOOGLE_CLIENT_ID environment variable.");
  }

  // Load the Google Sign-In library
  const loadGoogleSignIn = (): Promise<void> => {
    return new Promise((resolve) => {
      if ((window as any).google) {
        resolve();
        return;
      }

      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => {
        throw new Error("Failed to load Google Sign-In library");
      };
      document.head.appendChild(script);
    });
  };

  await loadGoogleSignIn();

  return new Promise((resolve, reject) => {
    const google = (window as any).google;
    if (!google) {
      reject(new Error("Google Sign-In library failed to load"));
      return;
    }

    let tokenReceived = false;

    google.accounts.id.initialize({
      client_id: clientId,
      callback: async (response: any) => {
        if (tokenReceived) return;
        tokenReceived = true;

        try {
          const res = await fetch(`${getApiUrl()}/auth/google`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ token: response.credential }),
          });

          const data = await res.json();

          if (!res.ok) {
            reject(new Error(data.message || "Google authentication failed"));
            return;
          }

          saveAuth(data);
          resolve(data);
        } catch (error) {
          reject(error);
        }
      },
    });

    // Try to show the One Tap UI first
    google.accounts.id.prompt((notification: any) => {
      // If One Tap UI is not displayed, the user might be signed in already
      // or they dismissed it, so we'll just wait for the callback
    });
  });
}
