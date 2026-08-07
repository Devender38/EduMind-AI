import { useState, useEffect } from "react";
import {
  Settings,
  Cpu,
  Volume2,
  Sliders,
  Save,
  RotateCcw,
  Camera,
  Trash2,
  User,
  Shield,
  Laptop,
  Smartphone,
  Tablet,
  Globe,
  LogOut,
  AlertTriangle,
  History,
  CheckCircle2,
  Lock,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import DashboardLayout from "../layouts/DashboardLayout";
import AvatarUploadModal from "../components/dashboard/AvatarUploadModal";
import { getUserProfile, removeUserAvatar } from "../api/user.api";
import {
  getActiveSessions,
  revokeSession,
  logoutAllDevices,
  deleteAccount,
} from "../api/auth.api";
import type { SessionItem, LoginHistoryItem } from "../api/auth.api";
import { useAuthStore } from "../store/authStore";

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuthStore();

  const [activeTab, setActiveTab] = useState<"system" | "security">("system");

  const [userName, setUserName] = useState(user?.name || "Student");
  const [userEmail] = useState(user?.email || "student@example.com");
  const [avatar, setAvatar] = useState<string>(user?.avatar || "");
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  // System Settings
  const [aiProvider, setAiProvider] = useState("ollama");
  const [aiModel, setAiModel] = useState("llama3");
  const [detailLevel, setDetailLevel] = useState("exhaustive");
  const [ttsSpeed, setTtsSpeed] = useState(1.0);
  const [defaultTab, setDefaultTab] = useState("chat");
  const [soundEffects, setSoundEffects] = useState(true);
  const [autoSelectDoc, setAutoSelectDoc] = useState(true);

  // Security & Sessions State
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [loginHistory, setLoginHistory] = useState<LoginHistoryItem[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const fetchSessions = async () => {
    try {
      setLoadingSessions(true);
      const data = await getActiveSessions();
      setSessions(data.sessions || []);
      setLoginHistory(data.loginHistory || []);
    } catch (err) {
      console.error("Failed to load active sessions:", err);
    } finally {
      setLoadingSessions(false);
    }
  };

  useEffect(() => {
    // Sync live profile from backend
    getUserProfile()
      .then((profile) => {
        if (profile) {
          setUserName(profile.name);
          if (profile.avatar !== undefined) {
            setAvatar(profile.avatar);
          }
          updateUser(profile);
        }
      })
      .catch((err) => {
        console.error("Settings profile fetch error:", err);
      });

    // Load saved settings
    const saved = localStorage.getItem("user_settings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.aiProvider) setAiProvider(parsed.aiProvider);
        if (parsed.aiModel) setAiModel(parsed.aiModel);
        if (parsed.detailLevel) setDetailLevel(parsed.detailLevel);
        if (parsed.ttsSpeed) setTtsSpeed(parsed.ttsSpeed);
        if (parsed.defaultTab) setDefaultTab(parsed.defaultTab);
        if (parsed.soundEffects !== undefined) setSoundEffects(parsed.soundEffects);
        if (parsed.autoSelectDoc !== undefined) setAutoSelectDoc(parsed.autoSelectDoc);
      } catch (e) {
        console.error(e);
      }
    }

    fetchSessions();
  }, []);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem(
      "user_settings",
      JSON.stringify({
        aiProvider,
        aiModel,
        detailLevel,
        ttsSpeed,
        defaultTab,
        soundEffects,
        autoSelectDoc,
      })
    );
    toast.success("Settings saved successfully!");
  };

  const handleResetDefaults = () => {
    setAiProvider("ollama");
    setAiModel("llama3");
    setDetailLevel("exhaustive");
    setTtsSpeed(1.0);
    setDefaultTab("chat");
    setSoundEffects(true);
    setAutoSelectDoc(true);
    toast.success("Settings reset to defaults.");
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

  const handleRevokeSession = async (sessionId: string) => {
    try {
      await revokeSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      toast.success("Session revoked successfully.");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to revoke session.");
    }
  };

  const handleLogoutAll = async () => {
    try {
      await logoutAllDevices();
      toast.success("Logged out from all devices.");
      navigate("/login");
    } catch (err: any) {
      toast.error("Failed to logout from all devices.");
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsDeletingAccount(true);
      await deleteAccount(deletePassword);
      toast.success("Account deleted successfully.");
      logout();
      navigate("/register");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete account.");
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const getDeviceIcon = (deviceType: string) => {
    const dev = deviceType?.toLowerCase() || "";
    if (dev.includes("mobile")) return <Smartphone size={18} className="text-cyan-400" />;
    if (dev.includes("tablet")) return <Tablet size={18} className="text-purple-400" />;
    return <Laptop size={18} className="text-blue-400" />;
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-zinc-800 p-2.5 text-zinc-200 ring-1 ring-zinc-700">
              <Settings size={26} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">System & Security Settings</h1>
              <p className="mt-0.5 text-sm text-zinc-400">
                Configure AI engine, devices, active sessions, and account protection.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("system")}
              className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
                activeTab === "system"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                  : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
              }`}
            >
              System Preferences
            </button>
            <button
              onClick={() => setActiveTab("security")}
              className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
                activeTab === "security"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                  : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
              }`}
            >
              Security & Sessions
            </button>
          </div>
        </div>

        {/* TAB 1: SYSTEM PREFERENCES */}
        {activeTab === "system" && (
          <div className="space-y-6">
            {/* 1. Profile Photo & Appearance */}
            <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-6 backdrop-blur-xl space-y-5">
              <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
                <User size={20} className="text-purple-400" />
                <div>
                  <h3 className="text-base font-bold text-white">Profile Photo & Identity</h3>
                  <p className="text-xs text-zinc-400">Update your avatar photo displayed across EduMind</p>
                </div>
              </div>

              <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                <div className="relative group flex-shrink-0">
                  <div
                    onClick={() => setIsAvatarModalOpen(true)}
                    className="relative h-20 w-20 cursor-pointer overflow-hidden rounded-2xl border-2 border-white/20 bg-gradient-to-tr from-blue-600 to-purple-600 text-2xl font-bold text-white shadow-xl transition hover:scale-105"
                  >
                    {avatar ? (
                      <img src={avatar} alt={userName} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        {userName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 opacity-0 transition group-hover:opacity-100 text-white">
                      <Camera size={18} />
                      <span className="text-[10px] font-medium">Change</span>
                    </div>
                  </div>
                </div>

                <div className="flex-1 space-y-1">
                  <h4 className="text-base font-bold text-white">{userName}</h4>
                  <p className="text-xs text-zinc-400">{userEmail}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsAvatarModalOpen(true)}
                    className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500"
                  >
                    <Camera size={14} />
                    <span>Upload Photo</span>
                  </button>

                  {avatar && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="flex items-center gap-1.5 rounded-xl border border-red-500/20 bg-red-500/10 px-3.5 py-2 text-xs font-semibold text-red-400 transition hover:bg-red-500 hover:text-white"
                    >
                      <Trash2 size={14} />
                      <span>Remove</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-6">
              {/* AI Intelligence Configuration */}
              <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-6 backdrop-blur-xl space-y-5">
                <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
                  <Cpu size={20} className="text-blue-400" />
                  <div>
                    <h3 className="text-base font-bold text-white">AI Engine & Model Preferences</h3>
                    <p className="text-xs text-zinc-400">Configure LLM backend generation parameters</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs font-semibold text-zinc-300">
                      AI Provider
                    </label>
                    <select
                      value={aiProvider}
                      onChange={(e) => setAiProvider(e.target.value)}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-950/80 p-3 text-sm text-white outline-none focus:border-blue-500"
                    >
                      <option value="ollama">Ollama (Local LLM)</option>
                      <option value="groq">Groq Cloud (Ultra-Fast Llama-3)</option>
                      <option value="openai">OpenAI (GPT-4o / Mini)</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold text-zinc-300">
                      Default Model
                    </label>
                    <input
                      type="text"
                      value={aiModel}
                      onChange={(e) => setAiModel(e.target.value)}
                      placeholder="e.g. llama3, llama3-70b-8192"
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-950/80 p-3 text-sm text-white outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold text-zinc-300">
                      Study Summary Depth
                    </label>
                    <select
                      value={detailLevel}
                      onChange={(e) => setDetailLevel(e.target.value)}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-950/80 p-3 text-sm text-white outline-none focus:border-blue-500"
                    >
                      <option value="exhaustive">Exhaustive Academic Guide (Full Explanations)</option>
                      <option value="concise">Standard Concise Summary</option>
                      <option value="bullet">Bullet-Point Overview Only</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold text-zinc-300">
                      Default Dashboard Mode
                    </label>
                    <select
                      value={defaultTab}
                      onChange={(e) => setDefaultTab(e.target.value)}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-950/80 p-3 text-sm text-white outline-none focus:border-blue-500"
                    >
                      <option value="chat">AI Chat</option>
                      <option value="flashcards">Flashcards</option>
                      <option value="quiz">Practice Quiz</option>
                      <option value="summary">AI Summary</option>
                      <option value="planner">Study Planner</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Audio & Speech Synthesis */}
              <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-6 backdrop-blur-xl space-y-5">
                <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
                  <Volume2 size={20} className="text-amber-400" />
                  <div>
                    <h3 className="text-base font-bold text-white">Audio & Speech Synthesis</h3>
                    <p className="text-xs text-zinc-400">Configure text-to-speech voice playback</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-medium mb-2">
                      <span className="text-zinc-300">Speech Playback Speed</span>
                      <span className="text-amber-400 font-bold">{ttsSpeed}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="2.0"
                      step="0.1"
                      value={ttsSpeed}
                      onChange={(e) => setTtsSpeed(parseFloat(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Interface & Workflow */}
              <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-6 backdrop-blur-xl space-y-4">
                <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
                  <Sliders size={20} className="text-emerald-400" />
                  <div>
                    <h3 className="text-base font-bold text-white">Interface & Behavior</h3>
                    <p className="text-xs text-zinc-400">UI workflow options</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/60 border border-zinc-800 cursor-pointer">
                    <div>
                      <p className="text-sm font-semibold text-white">Auto-select first document on load</p>
                      <p className="text-xs text-zinc-400">Automatically prepares AI chat and flashcards</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={autoSelectDoc}
                      onChange={(e) => setAutoSelectDoc(e.target.checked)}
                      className="h-5 w-5 rounded accent-blue-600"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/60 border border-zinc-800 cursor-pointer">
                    <div>
                      <p className="text-sm font-semibold text-white">Interactive Feedback Notifications</p>
                      <p className="text-xs text-zinc-400">Display toast confirmations on quiz and chat actions</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={soundEffects}
                      onChange={(e) => setSoundEffects(e.target.checked)}
                      className="h-5 w-5 rounded accent-blue-600"
                    />
                  </label>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-500 shadow-lg shadow-blue-600/20"
                >
                  <Save size={18} />
                  Save Preferences
                </button>

                <button
                  type="button"
                  onClick={handleResetDefaults}
                  className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3.5 text-xs font-semibold text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
                >
                  <RotateCcw size={14} />
                  Reset
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 2: SECURITY & SESSIONS */}
        {activeTab === "security" && (
          <div className="space-y-8">
            {/* Active Sessions List */}
            <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-6 backdrop-blur-xl space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
                <div className="flex items-center gap-2.5">
                  <Shield size={22} className="text-emerald-400" />
                  <div>
                    <h3 className="text-base font-bold text-white">Active Device Sessions</h3>
                    <p className="text-xs text-zinc-400">
                      Devices currently authenticated to your EduMind AI account
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleLogoutAll}
                  className="flex items-center gap-1.5 self-start sm:self-auto rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-2 text-xs font-semibold text-red-400 transition hover:bg-red-500 hover:text-white"
                >
                  <LogOut size={14} />
                  Log Out of All Devices
                </button>
              </div>

              {loadingSessions ? (
                <div className="flex items-center justify-center py-8 text-zinc-400">
                  <Loader2 size={24} className="animate-spin text-blue-500 mr-2" />
                  <span>Loading active sessions...</span>
                </div>
              ) : sessions.length === 0 ? (
                <p className="text-sm text-zinc-400">No active sessions found.</p>
              ) : (
                <div className="space-y-3">
                  {sessions.map((sess) => (
                    <div
                      key={sess.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-zinc-800 bg-zinc-950/70 p-4 transition hover:border-zinc-700"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800">
                          {getDeviceIcon(sess.device)}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-white">
                              {sess.browser} on {sess.os}
                            </span>
                            {sess.isCurrentSession && (
                              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                                This Device
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 pt-0.5 text-xs text-zinc-400">
                            <span className="flex items-center gap-1">
                              <Globe size={12} className="text-zinc-500" />
                              {sess.ipAddress}
                            </span>
                            <span>•</span>
                            <span>Last Active: {new Date(sess.lastUsedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      {!sess.isCurrentSession && (
                        <button
                          onClick={() => handleRevokeSession(sess.id)}
                          className="self-end sm:self-auto rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-400 transition hover:bg-red-500/20 hover:text-red-300 hover:border-red-500/30"
                        >
                          Revoke Access
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Login History Audit Trail */}
            <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-6 backdrop-blur-xl space-y-4">
              <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
                <History size={20} className="text-blue-400" />
                <div>
                  <h3 className="text-base font-bold text-white">Login History</h3>
                  <p className="text-xs text-zinc-400">Recent sign-in attempts and security events</p>
                </div>
              </div>

              {loginHistory.length === 0 ? (
                <p className="text-xs text-zinc-500">No login history recorded yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-zinc-400">
                    <thead className="border-b border-zinc-800 text-zinc-300 font-semibold uppercase text-[10px]">
                      <tr>
                        <th className="py-2.5">Status</th>
                        <th className="py-2.5">Device & Browser</th>
                        <th className="py-2.5">IP Address</th>
                        <th className="py-2.5">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/50">
                      {loginHistory.map((item, idx) => (
                        <tr key={idx} className="hover:bg-zinc-950/30">
                          <td className="py-2.5">
                            {item.status === "success" ? (
                              <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                                <CheckCircle2 size={12} /> Success
                              </span>
                            ) : item.status === "locked" ? (
                              <span className="text-amber-400 font-medium">Locked</span>
                            ) : (
                              <span className="text-red-400 font-medium">Failed</span>
                            )}
                          </td>
                          <td className="py-2.5 text-zinc-200">
                            {item.browser} ({item.os})
                          </td>
                          <td className="py-2.5 font-mono text-[11px]">{item.ip}</td>
                          <td className="py-2.5">{new Date(item.loginAt).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Danger Zone: Account Deletion */}
            <div className="rounded-2xl border border-red-500/30 bg-red-950/20 p-6 backdrop-blur-xl space-y-4">
              <div className="flex items-center gap-2 border-b border-red-500/20 pb-3">
                <AlertTriangle size={20} className="text-red-400" />
                <div>
                  <h3 className="text-base font-bold text-white">Danger Zone</h3>
                  <p className="text-xs text-red-300">Irreversible account operations</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="font-semibold text-sm text-white">Delete Account</h4>
                  <p className="text-xs text-zinc-400">
                    Permanently delete your account, uploaded study documents, flashcards, and quizzes.
                  </p>
                </div>

                <button
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="self-start sm:self-auto rounded-xl bg-red-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-red-600/25 transition hover:bg-red-500"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Account Modal */}
        <AnimatePresence>
          {isDeleteModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="w-full max-w-md rounded-3xl border border-red-500/30 bg-[#0B1528] p-6 shadow-2xl"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/20 text-red-400">
                  <AlertTriangle size={24} />
                </div>

                <h3 className="text-lg font-bold text-white">Confirm Account Deletion</h3>
                <p className="mt-1 text-xs text-slate-300">
                  This action is permanent and cannot be undone. All your notes, AI summaries, and data will be erased immediately.
                </p>

                <form onSubmit={handleDeleteAccount} className="mt-4 space-y-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                      Confirm your password
                    </label>
                    <div className="flex items-center rounded-xl border border-slate-700 bg-slate-900 px-3.5">
                      <Lock size={16} className="text-slate-400" />
                      <input
                        type="password"
                        required
                        value={deletePassword}
                        onChange={(e) => setDeletePassword(e.target.value)}
                        placeholder="Enter password to confirm"
                        className="w-full bg-transparent p-3 text-sm text-white outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsDeleteModalOpen(false)}
                      className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isDeletingAccount}
                      className="flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow-lg transition hover:bg-red-500 disabled:opacity-50"
                    >
                      {isDeletingAccount ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                      <span>Permanently Delete</span>
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

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
