import { useState, useRef } from "react";
import {
  X,
  Upload,
  Camera,
  Trash2,
  Sparkles,
  Link as LinkIcon,
  Check,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import { uploadUserAvatar, updateUserProfile } from "../../api/user.api";

interface AvatarUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatar?: string;
  onAvatarUpdated: (newAvatar: string) => void;
}

const PRESET_AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&auto=format&fit=crop&q=80",
];

export default function AvatarUploadModal({
  isOpen,
  onClose,
  currentAvatar,
  onAvatarUpdated,
}: AvatarUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(currentAvatar || "");
  const [urlInput, setUrlInput] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file (JPEG, PNG, WEBP).");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image file size must be less than 5 MB.");
        return;
      }

      setSelectedFile(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    }
  };

  const handleSelectPreset = (url: string) => {
    setSelectedFile(null);
    setPreviewUrl(url);
  };

  const handleApplyUrl = () => {
    if (!urlInput.trim()) return;
    setSelectedFile(null);
    setPreviewUrl(urlInput.trim());
    setUrlInput("");
    toast.success("Previewing image from URL");
  };

  const handleRemovePhoto = async () => {
    try {
      setIsUploading(true);
      await updateUserProfile({ avatar: "" });

      // Update local storage user
      const existingUser = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem(
        "user",
        JSON.stringify({ ...existingUser, avatar: "" })
      );

      onAvatarUpdated("");
      toast.success("Profile photo removed.");
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to remove profile photo.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveAvatar = async () => {
    try {
      setIsUploading(true);

      let finalAvatarUrl = previewUrl;

      if (selectedFile) {
        // Upload file to server & Cloudinary
        const res = await uploadUserAvatar(selectedFile);
        finalAvatarUrl = res.avatar || res.user.avatar || "";
      } else if (previewUrl !== currentAvatar) {
        // Preset or URL selected
        const res = await updateUserProfile({ avatar: previewUrl });
        finalAvatarUrl = res.user.avatar || previewUrl;
      }

      // Update local storage user
      const existingUser = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem(
        "user",
        JSON.stringify({ ...existingUser, avatar: finalAvatarUrl })
      );

      onAvatarUpdated(finalAvatarUrl);
      toast.success("Profile photo updated successfully!");
      onClose();
    } catch (err: any) {
      console.error("Avatar save error:", err);
      toast.error(err?.response?.data?.message || "Failed to update profile photo.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900 shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-600/10 p-2 text-blue-400 ring-1 ring-blue-500/20">
              <Camera size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Update Profile Photo</h3>
              <p className="text-xs text-zinc-400">
                Upload a custom photo or choose a curated avatar
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="space-y-6 p-6 max-h-[75vh] overflow-y-auto">
          {/* Avatar Preview Section */}
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="relative group">
              <div className="h-28 w-28 overflow-hidden rounded-full border-4 border-blue-500/40 bg-zinc-800 shadow-2xl ring-4 ring-white/5">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Avatar Preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-tr from-blue-600 to-purple-600 text-3xl font-extrabold text-white">
                    <Camera size={32} />
                  </div>
                )}
              </div>

              {/* Upload Trigger on Click */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 flex flex-col items-center justify-center rounded-full bg-black/60 opacity-0 transition group-hover:opacity-100 text-white text-xs font-semibold"
              >
                <Upload size={18} className="mb-1" />
                Change
              </button>
            </div>

            <p className="text-xs text-zinc-400">
              Preview of your new profile photo
            </p>
          </div>

          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="hidden"
          />

          {/* Upload Button Box */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-700 bg-zinc-950/60 p-5 text-center transition hover:border-blue-500 hover:bg-blue-500/5"
          >
            <div className="rounded-xl bg-blue-600/10 p-2.5 text-blue-400">
              <Upload size={22} />
            </div>
            <p className="mt-2 text-xs font-semibold text-white">
              {selectedFile ? selectedFile.name : "Upload photo from device"}
            </p>
            <p className="text-[11px] text-zinc-500">
              JPEG, PNG, or WEBP (Max 5MB)
            </p>
          </div>

          {/* Preset Avatars Selection */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300">
              <Sparkles size={14} className="text-amber-400" />
              <span>Or Choose from Curated Avatars</span>
            </div>

            <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
              {PRESET_AVATARS.map((avatar, idx) => {
                const isSelected = previewUrl === avatar;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectPreset(avatar)}
                    className={`relative h-12 w-12 overflow-hidden rounded-xl border-2 transition hover:scale-105 ${
                      isSelected
                        ? "border-blue-500 ring-2 ring-blue-500/40"
                        : "border-zinc-800 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={avatar}
                      alt={`Preset ${idx + 1}`}
                      className="h-full w-full object-cover"
                    />
                    {isSelected && (
                      <div className="absolute inset-0 flex items-center justify-center bg-blue-600/40 text-white">
                        <Check size={14} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Image URL Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
              <LinkIcon size={13} />
              <span>Or Paste Image URL</span>
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/photo.jpg"
                className="flex-1 rounded-xl border border-zinc-800 bg-zinc-950/80 px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
              />
              <button
                type="button"
                onClick={handleApplyUrl}
                className="rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs font-semibold text-zinc-200 transition hover:bg-zinc-700"
              >
                Apply
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-zinc-800 bg-zinc-950/60 p-5">
          {currentAvatar ? (
            <button
              type="button"
              onClick={handleRemovePhoto}
              disabled={isUploading}
              className="flex items-center gap-1.5 rounded-xl border border-red-500/20 bg-red-500/10 px-3.5 py-2 text-xs font-semibold text-red-400 transition hover:bg-red-500 hover:text-white disabled:opacity-50"
            >
              <Trash2 size={14} />
              Remove Photo
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isUploading}
              className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs font-semibold text-zinc-300 transition hover:bg-zinc-800"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSaveAvatar}
              disabled={isUploading || (!selectedFile && previewUrl === currentAvatar)}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500 disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check size={14} />
                  Save Photo
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
