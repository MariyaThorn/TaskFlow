export interface MockUser {
  email: string;
  password: string;
}

const USERS_KEY = "taskflow_mock_users";

const defaultUsers: MockUser[] = [
  { email: "test@example.com", password: "password123" },
];

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function seedMockUsers() {
  if (!canUseStorage()) return;
  const raw = window.localStorage.getItem(USERS_KEY);
  if (!raw) {
    window.localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
    return;
  }

  try {
    const parsed = JSON.parse(raw) as MockUser[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      window.localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
    }
  } catch {
    window.localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
  }
}

export function getMockUsers(): MockUser[] {
  if (!canUseStorage()) return defaultUsers;
  seedMockUsers();
  const raw = window.localStorage.getItem(USERS_KEY);
  if (!raw) return defaultUsers;

  try {
    const parsed = JSON.parse(raw) as MockUser[];
    return Array.isArray(parsed) ? parsed : defaultUsers;
  } catch {
    return defaultUsers;
  }
}

export function registerMockUser(user: MockUser) {
  if (!canUseStorage()) return { ok: false, message: "Storage unavailable." };
  const users = getMockUsers();
  const exists = users.some((u) => u.email.toLowerCase() === user.email.toLowerCase());

  if (exists) {
    return { ok: false, message: "Account already exists. Please sign in." };
  }

  const next = [...users, user];
  window.localStorage.setItem(USERS_KEY, JSON.stringify(next));
  return { ok: true, message: "Account created." };
}

export function validateMockUser(email: string, password: string) {
  const users = getMockUsers();
  return users.some(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password,
  );
}
