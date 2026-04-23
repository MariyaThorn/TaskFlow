"use client";

import { useState, useEffect } from "react";
import { Moon, Sun, Bell, Shield, User, Globe, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/sidebar";
import Navbar from "@/components/searchbar";
import { getUser, getToken, fetchMe, saveAuth, clearAuth } from "@/lib/auth";

import { getApiUrl } from "@/lib/utils";

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`relative h-8 w-14 rounded-full transition-colors ${enabled ? "bg-[#5a189a]" : "bg-gray-300"}`}
    >
      <div
        className={`absolute left-1 top-1 h-6 w-6 rounded-full bg-white transition-transform ${enabled ? "translate-x-6" : "translate-x-0"}`}
      />
    </button>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Profile
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [occupation, setOccupation] = useState("");

  // Password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Settings
  const [darkMode, setDarkMode] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [language, setLanguage] = useState("en");
  const [timezone, setTimezone] = useState("UTC");
  const [profileVisibility, setProfileVisibility] = useState("team");

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  useEffect(() => {
    // Load cached profile
    const cached = getUser();
    if (cached) {
      setFirstName(cached.firstName || "");
      setLastName(cached.lastName || "");
      setEmail(cached.email || "");
      setUsername(cached.username || "");
      setOccupation(cached.occupation || "");
    }

    // Fetch fresh profile
    fetchMe()
      .then((user) => {
        setFirstName(user.firstName || "");
        setLastName(user.lastName || "");
        setEmail(user.email || "");
        setUsername(user.username || "");
        setOccupation(user.occupation || "");
      })
      .catch(() => {});

    // Fetch settings
    const token = getToken();
    if (token) {
      fetch(`${getApiUrl()}/users/settings`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data?.settings) {
            const s = data.settings;
            if (s.darkMode !== undefined) setDarkMode(s.darkMode);
            if (s.emailNotifications !== undefined) setEmailNotifications(s.emailNotifications);
            if (s.pushNotifications !== undefined) setPushNotifications(s.pushNotifications);
            if (s.weeklyDigest !== undefined) setWeeklyDigest(s.weeklyDigest);
            if (s.language) setLanguage(s.language);
            if (s.timezone) setTimezone(s.timezone);
            if (s.profileVisibility) setProfileVisibility(s.profileVisibility);
          }
        })
        .catch(() => {});
    }
  }, []);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const token = getToken();
      const res = await fetch(`${getApiUrl()}/users/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        credentials: "include",
        body: JSON.stringify({ firstName, lastName, username, email, occupation }),
      });
      const data = await res.json();
      if (!res.ok) {
        showMessage("error", data.message || "Failed to save profile");
        return;
      }
      // Update local storage
      saveAuth({ token: token!, user: data.user });
      showMessage("success", "Profile saved successfully");
    } catch {
      showMessage("error", "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      showMessage("error", "Passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      showMessage("error", "Password must be at least 8 characters");
      return;
    }
    setSaving(true);
    try {
      const token = getToken();
      const res = await fetch(`${getApiUrl()}/users/password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        credentials: "include",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        showMessage("error", data.message || "Failed to change password");
        return;
      }
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      showMessage("success", "Password changed successfully");
    } catch {
      showMessage("error", "Failed to change password");
    } finally {
      setSaving(false);
    }
  };

  const saveSettings = async (updates: Record<string, unknown>) => {
    try {
      const token = getToken();
      await fetch(`${getApiUrl()}/users/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        credentials: "include",
        body: JSON.stringify(updates),
      });
    } catch {
      // silent
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const token = getToken();
      const res = await fetch(`${getApiUrl()}/users/account`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });
      if (res.ok) {
        clearAuth();
        router.push("/");
      } else {
        const data = await res.json();
        showMessage("error", data.message || "Failed to delete account");
      }
    } catch {
      showMessage("error", "Failed to delete account");
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f8f0ff]">
      <Sidebar activeItem="Settings" />
      <div className="flex flex-1 flex-col">
        <Navbar
          title="Settings"
          subtitle="Manage your account preferences and settings"
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">

          {message && (
            <div className={`mb-6 max-w-4xl rounded-xl px-4 py-3 text-sm font-medium ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
              {message.text}
            </div>
          )}

          <div className="max-w-4xl space-y-6">
            <div className="overflow-hidden rounded-2xl bg-white shadow-md">
              <div className="border-b border-gray-200 p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#5a189a]">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Profile</h2>
                    <p className="text-sm text-gray-600">Update your personal information</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 p-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">First Name</label>
                    <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#5a189a]" />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Last Name</label>
                    <input value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#5a189a]" />
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Username</label>
                  <input value={username} onChange={(e) => setUsername(e.target.value)} className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#5a189a]" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Email Address</label>
                  <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#5a189a]" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Occupation</label>
                  <input value={occupation} onChange={(e) => setOccupation(e.target.value)} className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#5a189a]" />
                </div>
                <button onClick={handleSaveProfile} disabled={saving} className="rounded-xl bg-[#5a189a] px-6 py-3 font-medium text-white shadow-md transition-colors hover:bg-[#3c096c] disabled:opacity-50">
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>

            {/* Password */}
            <div className="overflow-hidden rounded-2xl bg-white shadow-md">
              <div className="border-b border-gray-200 p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500">
                    <Lock className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Change Password</h2>
                    <p className="text-sm text-gray-600">Update your account password</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4 p-6">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Current Password</label>
                  <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#5a189a]" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">New Password</label>
                  <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#5a189a]" placeholder="Min 8 characters" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Confirm New Password</label>
                  <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#5a189a]" />
                </div>
                <button onClick={handleChangePassword} disabled={saving || !currentPassword || !newPassword} className="rounded-xl bg-[#5a189a] px-6 py-3 font-medium text-white shadow-md transition-colors hover:bg-[#3c096c] disabled:opacity-50">
                  {saving ? "Saving..." : "Change Password"}
                </button>
              </div>
            </div>

            {/* Appearance */}
            <div className="overflow-hidden rounded-2xl bg-white shadow-md">
              <div className="border-b border-gray-200 p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500">
                    {darkMode ? <Moon className="h-5 w-5 text-white" /> : <Sun className="h-5 w-5 text-white" />}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Appearance</h2>
                    <p className="text-sm text-gray-600">Customize how TaskFlow looks</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="mb-1 font-semibold text-gray-900">Dark Mode</h3>
                    <p className="text-sm text-gray-600">Switch between light and dark themes</p>
                  </div>
                  <Toggle enabled={darkMode} onChange={() => { setDarkMode((v) => { const next = !v; saveSettings({ darkMode: next }); return next; }); }} />
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="overflow-hidden rounded-2xl bg-white shadow-md">
              <div className="border-b border-gray-200 p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500">
                    <Bell className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Notifications</h2>
                    <p className="text-sm text-gray-600">Manage how you receive updates</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="mb-1 font-semibold text-gray-900">Email Notifications</h3>
                    <p className="text-sm text-gray-600">Receive updates via email</p>
                  </div>
                  <Toggle enabled={emailNotifications} onChange={() => { setEmailNotifications((v) => { const next = !v; saveSettings({ emailNotifications: next }); return next; }); }} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="mb-1 font-semibold text-gray-900">Push Notifications</h3>
                    <p className="text-sm text-gray-600">Get real-time alerts in your browser</p>
                  </div>
                  <Toggle enabled={pushNotifications} onChange={() => { setPushNotifications((v) => { const next = !v; saveSettings({ pushNotifications: next }); return next; }); }} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="mb-1 font-semibold text-gray-900">Weekly Digest</h3>
                    <p className="text-sm text-gray-600">Receive a summary of your activity every week</p>
                  </div>
                  <Toggle enabled={weeklyDigest} onChange={() => { setWeeklyDigest((v) => { const next = !v; saveSettings({ weeklyDigest: next }); return next; }); }} />
                </div>
              </div>
            </div>

            {/* Privacy */}
            <div className="overflow-hidden rounded-2xl bg-white shadow-md">
              <div className="border-b border-gray-200 p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Privacy</h2>
                    <p className="text-sm text-gray-600">Control your privacy settings</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <label className="mb-2 block text-sm font-medium text-gray-700">Profile Visibility</label>
                <select value={profileVisibility} onChange={(e) => { setProfileVisibility(e.target.value); saveSettings({ profileVisibility: e.target.value }); }} className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#5a189a]">
                  <option value="public">Public - Anyone can see</option>
                  <option value="team">Team - Only team members can see</option>
                  <option value="private">Private - Only you can see</option>
                </select>
              </div>
            </div>

            {/* Localization */}
            <div className="overflow-hidden rounded-2xl bg-white shadow-md">
              <div className="border-b border-gray-200 p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500">
                    <Globe className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Localization</h2>
                    <p className="text-sm text-gray-600">Set your language and timezone</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4 p-6">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Language</label>
                  <select value={language} onChange={(e) => { setLanguage(e.target.value); saveSettings({ language: e.target.value }); }} className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#5a189a]">
                    <option value="en">English</option>
                    <option value="es">Espanol</option>
                    <option value="fr">Francais</option>
                    <option value="de">Deutsch</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Timezone</label>
                  <select value={timezone} onChange={(e) => { setTimezone(e.target.value); saveSettings({ timezone: e.target.value }); }} className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#5a189a]">
                    <option value="UTC">UTC (Coordinated Universal Time)</option>
                    <option value="America/New_York">Eastern Time (ET)</option>
                    <option value="America/Los_Angeles">Pacific Time (PT)</option>
                    <option value="Europe/London">London (GMT)</option>
                    <option value="Asia/Tokyo">Tokyo (JST)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="overflow-hidden rounded-2xl border-2 border-red-200 bg-white shadow-md">
              <div className="border-b border-red-200 bg-red-50 p-6">
                <h2 className="text-xl font-semibold text-red-900">Danger Zone</h2>
                <p className="text-sm text-red-700">Irreversible and destructive actions</p>
              </div>
              <div className="space-y-4 p-6">
                {!showDeleteConfirm ? (
                  <>
                    <button onClick={() => setShowDeleteConfirm(true)} className="rounded-xl bg-red-500 px-6 py-3 font-medium text-white shadow-md transition-colors hover:bg-red-600">
                      Delete Account
                    </button>
                    <p className="text-sm text-gray-600">Once you delete your account, there is no going back. Please be certain.</p>
                  </>
                ) : (
                  <div className="rounded-xl border border-red-300 bg-red-50 p-4">
                    <p className="mb-4 font-medium text-red-900">Are you sure? This will permanently delete your account, remove you from all projects, and cannot be undone.</p>
                    <div className="flex gap-3">
                      <button onClick={() => setShowDeleteConfirm(false)} className="rounded-xl bg-gray-200 px-6 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-300">
                        Cancel
                      </button>
                      <button onClick={handleDeleteAccount} className="rounded-xl bg-red-600 px-6 py-2 font-medium text-white transition-colors hover:bg-red-700">
                        Yes, Delete My Account
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
