"use client";

import { useState } from "react";
import { Moon, Sun, Bell, Shield, User, Globe } from "lucide-react";
import Sidebar from "@/components/sidebar";
import Navbar from "@/components/searchbar";

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`relative h-8 w-14 rounded-full transition-colors ${enabled ? "bg-[#4F46E5]" : "bg-gray-300"}`}
    >
      <div
        className={`absolute left-1 top-1 h-6 w-6 rounded-full bg-white transition-transform ${enabled ? "translate-x-6" : "translate-x-0"}`}
      />
    </button>
  );
}

export default function SettingsPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [language, setLanguage] = useState("en");
  const [timezone, setTimezone] = useState("UTC");
  const [profileVisibility, setProfileVisibility] = useState("team");
  const [name, setName] = useState("John Doe");
  const [email, setEmail] = useState("john.doe@example.com");
  const [bio, setBio] = useState("Product Manager passionate about building great tools");
  const [searchTerm, setSearchTerm] = useState("");

  const handleSaveProfile = () => {
    window.alert("Profile settings saved!");
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activeItem="Settings" />
      <div className="flex flex-1 flex-col">
        <Navbar searchTerm={searchTerm} onSearchChange={setSearchTerm} notificationCount={2} />

        <main className="flex-1 overflow-y-auto p-8">
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600">Manage your account preferences and settings</p>
          </div>

          <div className="max-w-4xl space-y-6">
            <div className="overflow-hidden rounded-2xl bg-white shadow-md">
              <div className="border-b border-gray-200 p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#4F46E5]">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Profile</h2>
                    <p className="text-sm text-gray-600">Update your personal information</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 p-6">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Full Name</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#4F46E5]" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Email Address</label>
                  <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#4F46E5]" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Bio</label>
                  <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#4F46E5]" />
                </div>
                <button onClick={handleSaveProfile} className="rounded-xl bg-[#4F46E5] px-6 py-3 font-medium text-white shadow-md transition-colors hover:bg-[#4338CA]">
                  Save Changes
                </button>
              </div>
            </div>

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
                  <Toggle enabled={darkMode} onChange={() => setDarkMode((v) => !v)} />
                </div>
              </div>
            </div>

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
                  <Toggle enabled={emailNotifications} onChange={() => setEmailNotifications((v) => !v)} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="mb-1 font-semibold text-gray-900">Push Notifications</h3>
                    <p className="text-sm text-gray-600">Get real-time alerts in your browser</p>
                  </div>
                  <Toggle enabled={pushNotifications} onChange={() => setPushNotifications((v) => !v)} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="mb-1 font-semibold text-gray-900">Weekly Digest</h3>
                    <p className="text-sm text-gray-600">Receive a summary of your activity every week</p>
                  </div>
                  <Toggle enabled={weeklyDigest} onChange={() => setWeeklyDigest((v) => !v)} />
                </div>
              </div>
            </div>

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
                <select value={profileVisibility} onChange={(e) => setProfileVisibility(e.target.value)} className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#4F46E5]">
                  <option value="public">Public - Anyone can see</option>
                  <option value="team">Team - Only team members can see</option>
                  <option value="private">Private - Only you can see</option>
                </select>
              </div>
            </div>

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
                  <select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#4F46E5]">
                    <option value="en">English</option>
                    <option value="es">Espanol</option>
                    <option value="fr">Francais</option>
                    <option value="de">Deutsch</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Timezone</label>
                  <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#4F46E5]">
                    <option value="UTC">UTC (Coordinated Universal Time)</option>
                    <option value="America/New_York">Eastern Time (ET)</option>
                    <option value="America/Los_Angeles">Pacific Time (PT)</option>
                    <option value="Europe/London">London (GMT)</option>
                    <option value="Asia/Tokyo">Tokyo (JST)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border-2 border-red-200 bg-white shadow-md">
              <div className="border-b border-red-200 bg-red-50 p-6">
                <h2 className="text-xl font-semibold text-red-900">Danger Zone</h2>
                <p className="text-sm text-red-700">Irreversible and destructive actions</p>
              </div>
              <div className="space-y-4 p-6">
                <button className="rounded-xl bg-red-500 px-6 py-3 font-medium text-white shadow-md transition-colors hover:bg-red-600">
                  Delete Account
                </button>
                <p className="text-sm text-gray-600">Once you delete your account, there is no going back. Please be certain.</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
