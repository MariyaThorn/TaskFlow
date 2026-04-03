"use client";

import { useState } from "react";
import { X, Upload } from "lucide-react";

interface CreateProjectModalProps {
  onClose: () => void;
  onCreate: (project: {
    name: string;
    teamName: string;
    image: string;
  }) => void;
}

const teams = ["Engineering", "Marketing", "Design", "Support", "Sales"];

export default function CreateProjectModal({ onClose, onCreate }: CreateProjectModalProps) {
  const [name, setName] = useState("");
  const [teamName, setTeamName] = useState(teams[0]);
  const [imagePreview, setImagePreview] = useState("");
  const [imageFile, setImageFile] = useState("");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setImagePreview(result);
      setImageFile(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onCreate({ name, teamName, image: imageFile });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Create Project</h2>
            <button onClick={onClose} className="rounded-xl p-2 transition-colors hover:bg-gray-100">
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Project Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Product Development"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Team</label>
            <select
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
            >
              {teams.map((team) => (
                <option key={team} value={team}>
                  {team}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Project Image</label>
            <div className="relative">
              <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 cursor-pointer opacity-0" />
              <div className={`flex h-32 w-full items-center justify-center rounded-xl border border-gray-300 ${imagePreview ? "bg-gray-100" : ""}`}>
                {imagePreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imagePreview} alt="Project" className="h-full w-full rounded-xl object-cover" />
                ) : (
                  <div className="flex flex-col items-center">
                    <Upload className="h-6 w-6 text-gray-500" />
                    <p className="text-sm text-gray-500">Upload Image</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="submit" className="flex-1 rounded-xl bg-[#4F46E5] py-3 font-medium text-white shadow-md transition-colors hover:bg-[#4338CA]">
              Create Project
            </button>
            <button type="button" onClick={onClose} className="flex-1 rounded-xl bg-gray-100 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-200">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
