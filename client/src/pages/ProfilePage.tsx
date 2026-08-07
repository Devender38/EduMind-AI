import { useState, useEffect } from "react";
import {
  User,
  Lock,
  GraduationCap,
  Target,
  Shield,
  Save,
  Camera,
  Trash2,
  CheckCircle,
  AlertCircle,
  AtSign,
} from "lucide-react";
import toast from "react-hot-toast";
import DashboardLayout from "../layouts/DashboardLayout";
import AvatarUploadModal from "../components/dashboard/AvatarUploadModal";
import {
  getUserProfile,
  updateUserProfile,
  updateUserPassword,
  removeUserAvatar,
} from "../api/user.api";
import { resendVerificationEmail } from "../api/auth.api";
import { useAuthStore } from "../store/authStore";

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();

  const [name, setName] = useState(user?.name || "Student");
  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "student@example.com");
  const [avatar, setAvatar] = useState(user?.avatar || "");
  const [role, setRole] = useState(user?.role || "student");
  const [bio, setBio] = useState(
    user?.bio ||
      "Lifelong learner specializing in Machine Learning, System Design, and Cognitive Science."
  );
  const [phone, setPhone] = useState(user?.phone || "");
  const [country, setCountry] = useState(user?.country || "United States");
  const [timezone, setTimezone] = useState(user?.timezone || "UTC");
  const [isVerified, setIsVerified] = useState(user?.isVerified || false);

  const [field, setField] = useState("Computer Science & AI");
  const [dailyGoal, setDailyGoal] = useState(45);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isResendingVerify, setIsResendingVerify] = useState(false);

  useEffect(() => {
    // Fetch live profile from DB on mount
    getUserProfile()
      .then((profile) => {
        if (profile) {
          setName(profile.name);
          if (profile.username) setUsername(profile.username);
          setEmail(profile.email);
          if (profile.avatar !== undefined) setAvatar(profile.avatar);
          if (profile.bio !== undefined) setBio(profile.bio);
          if (profile.phone !== undefined) setPhone(profile.phone);
          if (profile.country !== undefined) setCountry(profile.country);
          if (profile.timezone !== undefined) setTimezone(profile.timezone);
          if (profile.role) setRole(profile.role);
          if (profile.isVerified !== undefined) setIsVerified(profile.isVerified);
          updateUser(profile);
        }
      })
      .catch((err) => {
        console.error("Failed fetching user profile:", err);
      });
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const res = await updateUserProfile({
        name,
        username: username.trim() || undefined,
        bio,
        phone,
        country,
        timezone,
        avatar,
      });

      updateUser(res.user);
      toast.success("Profile updated successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast.error("Please fill in all password fields.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    try {
      await updateUserPassword({ currentPassword, newPassword, confirmPassword });
      toast.success("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to update password.");
    }
  };

  const handleAvatarUpdated = (newAvatar: string) => {
    setAvatar(newAvatar);
    updateUser({ avatar: newAvatar });
  };

  const handleRemovePhoto = async () => {
    try {
      await removeUserAvatar();
      setAvatar("");
      updateUser({ avatar: "" });
      toast.success("Profile photo removed.");
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to remove profile photo.");
    }
  };

  const handleResendVerification = async () => {
    try {
      setIsResendingVerify(true);
      const res = await resendVerificationEmail(email);
      toast.success(res.message || "Verification email sent!");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to resend verification email.");
    } finally {
      setIsResendingVerify(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-blue-600/10 p-2.5 text-blue-400 ring-1 ring-blue-500/20">
            <User size={26} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Student Profile</h1>
            <p className="mt-0.5 text-sm text-zinc-400">
              Manage your personal information, academic background, and credentials.
            </p>
          </div>
        </div>

        {/* Profile Card Banner */}
        <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-r from-blue-900/40 via-purple-900/30 to-zinc-950 p-8 backdrop-blur-xl">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            {/* Clickable Avatar with Camera Overlay */}
            <div className="relative group">
              <div
                onClick={() => setIsAvatarModalOpen(true)}
                className="relative h-24 w-24 cursor-pointer overflow-hidden rounded-2xl border-2 border-white/20 bg-gradient-to-tr from-blue-600 to-purple-600 text-3xl font-extrabold text-white shadow-xl shadow-blue-600/30 transition hover:scale-105"
              >
                {avatar ? (
                  <img src={avatar} alt={name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    {name.charAt(0).toUpperCase()}
                  </div>
                )}

                {/* Hover overlay with camera */}
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 opacity-0 transition group-hover:opacity-100 text-white">
                  <Camera size={22} />
                  <span className="mt-1 text-[10px] font-semibold">Change</span>
                </div>
              </div>

              {/* Quick Camera Badge */}
              <button
                type="button"
                onClick={() => setIsAvatarModalOpen(true)}
                title="Change Profile Photo"
                className="absolute -bottom-1.5 -right-1.5 rounded-full bg-blue-600 p-1.5 text-white shadow-lg ring-2 ring-zinc-950 transition hover:bg-blue-500"
              >
                <Camera size={13} />
              </button>
            </div>

            {/* Info */}
            <div className="flex-1 space-y-1.5">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-2xl font-bold text-white">{name}</h2>
                <span className="rounded-full bg-blue-500/20 px-3 py-0.5 text-xs font-semibold text-blue-400 capitalize">
                  {role}
                </span>
                {isVerified ? (
                  <span className="flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
                    <CheckCircle size={12} /> Verified
                  </span>
                ) : (
                  <span className="flex items-center gap-1 rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-semibold text-amber-400">
                    <AlertCircle size={12} /> Unverified
                  </span>
                )}
              </div>

              <p className="text-sm text-zinc-400 flex items-center gap-2">
                <span>{email}</span>
                {!isVerified && (
                  <button
                    onClick={handleResendVerification}
                    disabled={isResendingVerify}
                    className="text-xs text-cyan-400 hover:underline hover:text-cyan-300 font-medium"
                  >
                    {isResendingVerify ? "Sending..." : "Send Verification Email"}
                  </button>
                )}
              </p>

              <div className="flex flex-wrap gap-4 pt-1 text-xs text-zinc-400">
                {username && (
                  <span className="flex items-center gap-1 text-cyan-300">
                    <AtSign size={13} />
                    {username}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <GraduationCap size={14} className="text-purple-400" />
                  {field}
                </span>
                <span className="flex items-center gap-1.5">
                  <Target size={14} className="text-emerald-400" />
                  Goal: {dailyGoal} mins/day
                </span>
              </div>
            </div>

            {/* Photo Action Buttons */}
            <div className="flex flex-wrap gap-2 sm:flex-col">
              <button
                type="button"
                onClick={() => setIsAvatarModalOpen(true)}
                className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500"
              >
                <Camera size={14} />
                <span>Change Photo</span>
              </button>

              {avatar && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="flex items-center gap-1.5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-400 transition hover:bg-red-500 hover:text-white"
                >
                  <Trash2 size={14} />
                  <span>Remove</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Edit Profile Form & Security */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* General Information */}
          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-6 backdrop-blur-xl">
            <h3 className="flex items-center gap-2 text-lg font-bold text-white">
              <User size={18} className="text-blue-400" />
              Personal Information
            </h3>
            <p className="mt-1 text-xs text-zinc-400">
              Update your account details and academic background.
            </p>

            <form onSubmit={handleUpdateProfile} className="mt-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-zinc-300">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950/80 p-3 text-sm text-white outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-zinc-300">
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="student_handle"
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950/80 p-3 text-sm text-white outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-zinc-300">
                  Email Address
                </label>
                <input
                  type="email"
                  disabled
                  value={email}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950/40 p-3 text-sm text-zinc-500 cursor-not-allowed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-zinc-300">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950/80 p-3 text-sm text-white outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-zinc-300">
                    Country
                  </label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950/80 p-3 text-sm text-white outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-zinc-300">
                  Major / Field of Study
                </label>
                <input
                  type="text"
                  value={field}
                  onChange={(e) => setField(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950/80 p-3 text-sm text-white outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-zinc-300">
                  Daily Study Goal (Minutes)
                </label>
                <input
                  type="number"
                  value={dailyGoal}
                  onChange={(e) => setDailyGoal(Number(e.target.value))}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950/80 p-3 text-sm text-white outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-zinc-300">
                  Academic Bio
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950/80 p-3 text-sm text-white outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 shadow-lg shadow-blue-600/20 disabled:opacity-50"
              >
                <Save size={16} />
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>

          {/* Security & Password */}
          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-6 backdrop-blur-xl">
            <h3 className="flex items-center gap-2 text-lg font-bold text-white">
              <Shield size={18} className="text-emerald-400" />
              Security & Password
            </h3>
            <p className="mt-1 text-xs text-zinc-400">
              Ensure your account stays secure by updating your credentials.
            </p>

            <form onSubmit={handleChangePassword} className="mt-6 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-zinc-300">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950/80 p-3 text-sm text-white outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-zinc-300">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950/80 p-3 text-sm text-white outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-zinc-300">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950/80 p-3 text-sm text-white outline-none focus:border-blue-500"
                />
              </div>

              <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-4 text-xs text-zinc-400 space-y-1">
                <p className="font-semibold text-zinc-300">Password Requirements:</p>
                <p>• At least 6 characters</p>
                <p>• Include numbers and symbols for high security</p>
              </div>

              <button
                type="submit"
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 shadow-lg shadow-emerald-600/20"
              >
                <Lock size={16} />
                Update Password
              </button>
            </form>
          </div>
        </div>

        {/* Avatar Upload Modal */}
        <AvatarUploadModal
          isOpen={isAvatarModalOpen}
          onClose={() => setIsAvatarModalOpen(false)}
          currentAvatar={avatar}
          onAvatarUpdated={handleAvatarUpdated}
        />
      </div>
    </DashboardLayout>
  );
}
