import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  BrainCircuit,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  KeyRound,
  Sun,
  Moon,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/authStore";
import { useTheme } from "../context/ThemeContext";

export default function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const { isDark, toggleTheme } = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email || !password) {
      toast.error("Please fill in both email and password.");
      return;
    }

    try {
      setLoading(true);
      await login({
        email: email.trim(),
        password,
        rememberMe,
      });

      toast.success("Welcome back to EduMind AI!");
      navigate("/dashboard");
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        (err.code === "ECONNABORTED"
          ? "Request timed out. Please try again."
          : "Invalid credentials. Please verify your email and password.");
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo Auto-fill for evaluators
  const handleDemoFill = () => {
    setEmail("devender2005kumar@gmail.com");
    setPassword("password123");
    toast("Demo credentials filled!", { icon: "✨" });
  };

  return (
    <div
      className={`relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12 transition-colors duration-300 selection:bg-cyan-500 selection:text-white ${
        isDark ? "bg-[#050b14] text-slate-100" : "bg-[#f8fafc] text-slate-900"
      }`}
    >
      
      {/* =============================
          Ambient Mesh Aurora Background
          ============================= */}
      <div
        className={`pointer-events-none absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full bg-gradient-to-tr from-blue-600/30 to-cyan-500/20 blur-[150px] animate-pulse transition-opacity duration-300 ${
          isDark ? "opacity-100" : "opacity-35"
        }`}
      />
      <div
        className={`pointer-events-none absolute -bottom-40 -right-40 h-[520px] w-[520px] rounded-full bg-gradient-to-tr from-purple-600/30 to-indigo-600/25 blur-[150px] animate-pulse transition-opacity duration-300 ${
          isDark ? "opacity-100" : "opacity-35"
        }`}
      />
      <div
        className={`pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-cyan-600/10 blur-[180px] transition-opacity duration-300 ${
          isDark ? "opacity-100" : "opacity-30"
        }`}
      />

      {/* Subtle Futuristic Radial Dots Pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `radial-gradient(#38bdf8 1.2px, transparent 1.2px)`,
          backgroundSize: "28px 28px",
        }}
      />

      {/* Back to Home Link */}
      <Link
        to="/"
        className={`absolute top-6 left-6 z-20 flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-semibold backdrop-blur-md transition shadow-lg ${
          isDark
            ? "border-white/10 bg-slate-900/60 text-slate-300 hover:border-cyan-500/40 hover:bg-slate-800 hover:text-white"
            : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 shadow-sm"
        }`}
      >
        <ArrowLeft size={14} className="text-cyan-400" />
        <span>Back to Home</span>
      </Link>

      {/* Day / Night Theme Toggle */}
      <button
        type="button"
        onClick={toggleTheme}
        title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        className={`absolute top-6 right-6 z-20 flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition shadow-lg ${
          isDark
            ? "border-amber-400/30 bg-amber-400/10 text-amber-300 hover:bg-amber-400/20"
            : "border-indigo-200 bg-white text-indigo-700 hover:bg-indigo-50 shadow-sm"
        }`}
      >
        {isDark ? (
          <>
            <Sun size={14} className="text-amber-400 animate-spin-slow" />
            <span className="hidden sm:inline">Light Mode</span>
          </>
        ) : (
          <>
            <Moon size={14} className="text-indigo-600" />
            <span className="hidden sm:inline">Dark Mode</span>
          </>
        )}
      </button>

      {/* =============================
          Glassmorphic Login Card
          ============================= */}
      <motion.div
        initial={{ opacity: 0, y: 22, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-[440px] overflow-hidden rounded-[2.25rem] border border-white/10 bg-slate-950/70 p-7 sm:p-9 shadow-[0_0_60px_-15px_rgba(59,130,246,0.25)] backdrop-blur-2xl ring-1 ring-white/5"
      >
        {/* Top Decorative Ambient Glow Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500" />

        {/* Brand Header */}
        <div className="mb-7 flex flex-col items-center text-center">
          
          {/* Logo Badge with Aura Ring */}
          <Link
            to="/"
            title="EduMind AI Home"
            className="group relative mb-4 flex items-center justify-center"
          >
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 opacity-60 blur-md transition duration-500 group-hover:opacity-100 group-hover:blur-lg" />
            <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 shadow-xl shadow-indigo-600/30 ring-1 ring-white/20 transition-transform duration-300 group-hover:scale-105">
              <BrainCircuit size={28} className="text-white drop-shadow" />
            </div>
          </Link>

          {/* Micro AI Badge */}
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-0.5 text-[11px] font-semibold text-cyan-300 shadow-sm">
            <Sparkles size={11} className="text-cyan-400 animate-spin" />
            <span>AI-Powered Study Platform</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Welcome Back
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-400 max-w-xs">
            Sign in to continue your personalized intelligent study workflow
          </p>
        </div>

        {/* Error Alert Box */}
        <AnimatePresence>
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: "auto", marginBottom: 18 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="flex items-start gap-2.5 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-300 shadow-sm"
            >
              <AlertCircle size={16} className="mt-0.5 shrink-0 text-rose-400" />
              <span className="leading-relaxed">{errorMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form Body */}
        <form onSubmit={handleLogin} className="space-y-4">
          
          {/* Email Address */}
          <div>
            <label className="mb-1.5 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-300">
              <span>Email Address</span>
              {isEmailValid && (
                <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400 lowercase">
                  <CheckCircle2 size={12} /> valid
                </span>
              )}
            </label>
            <div className="group relative flex items-center rounded-2xl border border-slate-700/80 bg-slate-900/70 px-3.5 transition-all duration-200 focus-within:border-cyan-400 focus-within:bg-slate-900/90 focus-within:shadow-[0_0_20px_rgba(6,182,212,0.18)]">
              <Mail
                size={18}
                className="text-slate-400 transition-colors group-focus-within:text-cyan-400"
              />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-transparent px-3 py-3.5 text-xs sm:text-sm text-white outline-none placeholder:text-slate-500"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-medium text-cyan-400 transition hover:text-cyan-300 hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="group relative flex items-center rounded-2xl border border-slate-700/80 bg-slate-900/70 px-3.5 transition-all duration-200 focus-within:border-cyan-400 focus-within:bg-slate-900/90 focus-within:shadow-[0_0_20px_rgba(6,182,212,0.18)]">
              <Lock
                size={18}
                className="text-slate-400 transition-colors group-focus-within:text-cyan-400"
              />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-transparent px-3 py-3.5 text-xs sm:text-sm text-white outline-none placeholder:text-slate-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 transition hover:text-slate-200 p-1 focus:outline-none"
                tabIndex={-1}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Remember Me & Security Badge */}
          <div className="flex items-center justify-between pt-0.5">
            <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-slate-300 select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded-md border-slate-700 bg-slate-900 text-cyan-500 accent-cyan-500 focus:ring-0 cursor-pointer"
              />
              <span>Remember me for 30 days</span>
            </label>

            <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>256-bit Encrypted</span>
            </span>
          </div>

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={loading}
            className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 py-3.5 text-xs sm:text-sm font-bold text-white shadow-xl shadow-indigo-600/30 transition-all duration-300 hover:shadow-cyan-500/40 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 cursor-pointer"
          >
            {/* Shimmer Light Reflection on Hover */}
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full pointer-events-none" />

            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin text-white" />
                <span>Authenticating with AI...</span>
              </>
            ) : (
              <>
                <span>Sign In to EduMind</span>
                <ArrowRight
                  size={16}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </>
            )}
          </button>

          {/* Quick Demo Credentials Autofill Chip */}
          <div className="pt-1 text-center">
            <button
              type="button"
              onClick={handleDemoFill}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1 text-[11px] font-medium text-slate-400 hover:border-cyan-500/40 hover:text-cyan-300 hover:bg-slate-800/80 transition shadow-sm"
              title="One-click demo login credentials for quick testing"
            >
              <KeyRound size={12} className="text-cyan-400" />
              <span>One-Click Demo Fill</span>
            </button>
          </div>

          {/* Switch to Register */}
          <div className="border-t border-white/5 pt-3 text-center text-xs text-slate-400">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-bold text-cyan-400 transition hover:text-cyan-300 hover:underline"
            >
              Create Account
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
}