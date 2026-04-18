"use client";

import { useState } from "react";
import { X, Image } from "lucide-react";

interface CreateBoardModalProps {
  onClose: () => void;
  onCreate: (board: {
    name: string;
    description: string;
    color: string;
    backgroundImage?: string;
  }) => void;
}

const colorOptions = [
  { id: "blue", gradient: "from-blue-500 to-blue-600" },
  { id: "purple", gradient: "from-purple-500 to-purple-600" },
  { id: "pink", gradient: "from-pink-500 to-pink-600" },
  { id: "green", gradient: "from-green-500 to-green-600" },
  { id: "orange", gradient: "from-orange-500 to-orange-600" },
  { id: "red", gradient: "from-red-500 to-red-600" },
  { id: "indigo", gradient: "from-indigo-500 to-indigo-600" },
  { id: "teal", gradient: "from-teal-500 to-teal-600" },
];

export default function CreateBoardModal({ onClose, onCreate }: CreateBoardModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedColor, setSelectedColor] = useState(colorOptions[0].gradient);
  const [backgroundImage, setBackgroundImage] = useState("");
  const [useImage, setUseImage] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onCreate({
        name,
        description,
        color: selectedColor,
        backgroundImage: useImage && backgroundImage.trim() ? backgroundImage.trim() : undefined,
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Create Board</h2>
            <button onClick={onClose} className="rounded-xl p-2 transition-colors hover:bg-gray-100">
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="relative mx-6 mt-6 h-28 overflow-hidden rounded-xl">
          {useImage && backgroundImage.trim() ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={backgroundImage} alt="" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-black/20" />
            </>
          ) : (
            <div className={`h-full w-full bg-gradient-to-br ${selectedColor}`} />
          )}
          {name && (
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <p className="text-lg font-semibold text-white drop-shadow-md">{name}</p>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Board Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Product Roadmap"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this board about?"
              className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              rows={2}
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Background</label>
              <button
                type="button"
                onClick={() => setUseImage(!useImage)}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${useImage ? "bg-[#4F46E5] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
              >
                <Image className="h-3.5 w-3.5" />
                Image URL
              </button>
            </div>

            {useImage && (
              <input
                type="url"
                value={backgroundImage}
                onChange={(e) => setBackgroundImage(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="mb-3 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              />
            )}

            <div className="grid grid-cols-4 gap-3">
              {colorOptions.map((color) => (
                <button
                  key={color.id}
                  type="button"
                  onClick={() => { setSelectedColor(color.gradient); setUseImage(false); }}
                  className={`h-10 w-full rounded-xl bg-gradient-to-br ${color.gradient} transition-all ${
                    selectedColor === color.gradient && !useImage ? "ring-4 ring-[#4F46E5] ring-offset-2" : "hover:scale-105"
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" className="flex-1 rounded-xl bg-[#4F46E5] py-3 font-medium text-white shadow-md transition-colors hover:bg-[#4338CA]">
              Create Board
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
