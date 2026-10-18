import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  BrainCircuit,
  Mail,
  Lock,
  User as UserIcon,
  AtSign,
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowLeft,
  ShieldCheck,
  Check,
  X as XIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/authStore";
import { LegalModal, type LegalTab } from "../components/auth/LegalModal";

export default function Register() {
  const navigate = useNavigate();
  const register = useAuthStore((s) => s.register);

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [legalModalTab, setLegalModalTab] = useState<LegalTab>("terms");

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const passwordsMatch =
    confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch =
    confirmPassword.length > 0 && password !== confirmPassword;

  const handleOpenTerms = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLegalModalTab("terms");
    setIsLegalModalOpen(true);
  };

  const handleOpenPrivacy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLegalModalTab("privacy");
    setIsLegalModalOpen(true);
  };

  // Real-time password strength calculation
  const strength = useMemo(() => {
    let score = 0;
    if (!password)
      return {
        score: 0,
        label: "None",
        color: "bg-slate-700",
        text: "text-slate-500",
      };

    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 1)
      return {
        score: 20,
        label: "Weak",
        color: "bg-rose-500",
        text: "text-rose-400",
      };
    if (score === 2 || score === 3)
      return {
        score: 60,
        label: "Fair",
        color: "bg-amber-500",
        text: "text-amber-400",
      };
    if (score === 4)
      return {
        score: 85,
        label: "Good",
        color: "bg-blue-500",
        text: "text-blue-400",
      };
    return {
      score: 100,
      label: "Strong",
      color: "bg-emerald-500",
      text: "text-emerald-400",
    };
  }, [password]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!termsAccepted) {
      toast.error("Please agree to the Terms of Service & Privacy Policy.");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }

    if (
      !/[A-Za-z]/.test(password) ||
      !/[0-9]/.test(password) ||
      !/[^A-Za-z0-9]/.test(password)
    ) {
      toast.error(
        "Password must contain letters, numbers, and a special character."
      );
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      await register({
        name: name.trim(),
        username: username.trim() ? username.trim() : undefined,
        email: email.trim(),
        password,
        confirmPassword,
      });

      setIsSuccessModalOpen(true);
      toast.success("Account created successfully!");
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        (err.code === "ECONNABORTED"
          ? "Request timed out. Please try again."
          : "Registration failed. Please check your details.");
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050b14] px-4 py-12 selection:bg-cyan-500 selection:text-white">
      {/* =============================
          Ambient Mesh Aurora Background
          ============================= */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full bg-gradient-to-tr from-blue-600/30 to-cyan-500/20 blur-[150px] animate-pulse" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[520px] w-[520px] rounded-full bg-gradient-to-tr from-purple-600/30 to-indigo-600/25 blur-[150px] animate-pulse" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-cyan-600/10 blur-[180px]" />

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
        className="absolute top-6 left-6 z-20 flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900/60 px-3.5 py-2 text-xs font-semibold text-slate-300 backdrop-blur-md transition hover:border-cyan-500/40 hover:bg-slate-800 hover:text-white shadow-lg"
      >
        <ArrowLeft size={14} className="text-cyan-400" />
        <span>Back to Home</span>
      </Link>

      {/* =============================
          Success Modal
          ============================= */}
      <AnimatePresence>
        {isSuccessModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 px-4 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md rounded-[2rem] border border-white/10 bg-slate-950/90 p-8 text-center shadow-2xl backdrop-blur-2xl ring-1 ring-white/10"
            >
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/40">
                <CheckCircle2 size={36} />
              </div>
              <h2 className="text-2xl font-extrabold text-white">
                Account Created!
              </h2>
              <p className="mt-2 text-sm text-slate-300">
                Welcome to EduMind AI. Your account is active for{" "}
                <strong className="text-cyan-400">{email}</strong>.
              </p>
              <p className="mt-1 text-xs text-slate-400">
                You can now start learning, upload study notes, and chat with AI.
              </p>
              <div className="mt-6 flex flex-col gap-3">
                <button
                  onClick={() => navigate("/dashboard")}
                  className="flex items-center justify-center gap-2 w-full rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 transition hover:brightness-110 active:scale-95"
                >
                  <span>Continue to Dashboard</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =============================
          Glassmorphic Register Card
          ============================= */}
      <motion.div
        initial={{ opacity: 0, y: 22, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-xl overflow-hidden rounded-[2.25rem] border border-white/10 bg-slate-950/70 p-7 sm:p-9 shadow-[0_0_60px_-15px_rgba(59,130,246,0.25)] backdrop-blur-2xl ring-1 ring-white/5"
      >
        {/* Top Decorative Ambient Glow Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500" />

        {/* Brand Header */}
        <div className="mb-6 flex flex-col items-center text-center">
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
            <span>Join 10,000+ Smart Students</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Create Your Account
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-400 max-w-sm">
            Supercharge your cognitive learning with AI-powered study workflows
          </p>
        </div>

        {/* Error Alert Box */}
        <AnimatePresence>
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="flex items-start gap-2.5 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-300 shadow-sm"
            >
              <AlertCircle size={16} className="mt-0.5 shrink-0 text-rose-400" />
              <span className="leading-relaxed">{errorMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <form onSubmit={handleRegister} className="space-y-4">
          
          {/* Row 1: Full Name & Username */}
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Full Name <span className="text-cyan-400">*</span>
              </label>
              <div className="group relative flex items-center rounded-2xl border border-slate-700/80 bg-slate-900/70 px-3.5 transition-all duration-200 focus-within:border-cyan-400 focus-within:bg-slate-900/90 focus-within:shadow-[0_0_20px_rgba(6,182,212,0.18)]">
                <UserIcon
                  size={17}
                  className="text-slate-400 transition-colors group-focus-within:text-cyan-400"
                />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Devender"
                  className="w-full bg-transparent px-3 py-3 text-xs sm:text-sm text-white outline-none placeholder:text-slate-500"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Username <span className="text-slate-500 text-[10px]">(Optional)</span>
              </label>
              <div className="group relative flex items-center rounded-2xl border border-slate-700/80 bg-slate-900/70 px-3.5 transition-all duration-200 focus-within:border-cyan-400 focus-within:bg-slate-900/90 focus-within:shadow-[0_0_20px_rgba(6,182,212,0.18)]">
                <AtSign
                  size={17}
                  className="text-slate-400 transition-colors group-focus-within:text-cyan-400"
                />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="devender_ai"
                  className="w-full bg-transparent px-3 py-3 text-xs sm:text-sm text-white outline-none placeholder:text-slate-500"
                />
              </div>
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label className="mb-1.5 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-300">
              <span>
                Email Address <span className="text-cyan-400">*</span>
              </span>
              {isEmailValid && (
                <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400 lowercase">
                  <CheckCircle2 size={12} /> valid
                </span>
              )}
            </label>
            <div className="group relative flex items-center rounded-2xl border border-slate-700/80 bg-slate-900/70 px-3.5 transition-all duration-200 focus-within:border-cyan-400 focus-within:bg-slate-900/90 focus-within:shadow-[0_0_20px_rgba(6,182,212,0.18)]">
              <Mail
                size={17}
                className="text-slate-400 transition-colors group-focus-within:text-cyan-400"
              />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-transparent px-3 py-3 text-xs sm:text-sm text-white outline-none placeholder:text-slate-500"
              />
            </div>
          </div>

          {/* Password & Confirm Password Row */}
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Password <span className="text-cyan-400">*</span>
              </label>
              <div className="group relative flex items-center rounded-2xl border border-slate-700/80 bg-slate-900/70 px-3.5 transition-all duration-200 focus-within:border-cyan-400 focus-within:bg-slate-900/90 focus-within:shadow-[0_0_20px_rgba(6,182,212,0.18)]">
                <Lock
                  size={17}
                  className="text-slate-400 transition-colors group-focus-within:text-cyan-400"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-transparent px-3 py-3 text-xs sm:text-sm text-white outline-none placeholder:text-slate-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 transition hover:text-slate-200 p-1 focus:outline-none"
                  tabIndex={-1}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Confirm Password <span className="text-cyan-400">*</span>
                </label>
                {passwordsMatch && (
                  <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400">
                    <Check size={12} /> Match
                  </span>
                )}
                {passwordsMismatch && (
                  <span className="flex items-center gap-1 text-[11px] font-medium text-rose-400">
                    <XIcon size={12} /> Differ
                  </span>
                )}
              </div>
              <div
                className={`group relative flex items-center rounded-2xl border bg-slate-900/70 px-3.5 transition-all duration-200 focus-within:bg-slate-900/90 ${
                  passwordsMatch
                    ? "border-emerald-500/50 focus-within:border-emerald-400 focus-within:shadow-[0_0_20px_rgba(16,185,129,0.18)]"
                    : passwordsMismatch
                    ? "border-rose-500/50 focus-within:border-rose-400"
                    : "border-slate-700/80 focus-within:border-cyan-400 focus-within:shadow-[0_0_20px_rgba(6,182,212,0.18)]"
                }`}
              >
                <Lock
                  size={17}
                  className={`transition-colors ${
                    passwordsMatch
                      ? "text-emerald-400"
                      : passwordsMismatch
                      ? "text-rose-400"
                      : "text-slate-400 group-focus-within:text-cyan-400"
                  }`}
                />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-transparent px-3 py-3 text-xs sm:text-sm text-white outline-none placeholder:text-slate-500"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-slate-400 transition hover:text-slate-200 p-1 focus:outline-none"
                  tabIndex={-1}
                  title={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          {/* Password Strength Meter */}
          {password && (
            <div className="space-y-1.5 rounded-2xl border border-slate-800/80 bg-slate-900/50 p-3.5 backdrop-blur-sm">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Password Strength:</span>
                <span className={`font-bold ${strength.text}`}>
                  {strength.label}
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${strength.score}%` }}
                  transition={{ duration: 0.3 }}
                  className={`h-full ${strength.color}`}
                />
              </div>
              <div className="grid grid-cols-2 gap-1 pt-1 text-[11px] text-slate-400">
                <span
                  className={
                    password.length >= 8
                      ? "text-emerald-400 font-medium"
                      : "text-slate-500"
                  }
                >
                  • Min 8 characters
                </span>
                <span
                  className={
                    /[A-Z]/.test(password)
                      ? "text-emerald-400 font-medium"
                      : "text-slate-500"
                  }
                >
                  • Uppercase letter
                </span>
                <span
                  className={
                    /[0-9]/.test(password)
                      ? "text-emerald-400 font-medium"
                      : "text-slate-500"
                  }
                >
                  • Number (0-9)
                </span>
                <span
                  className={
                    /[^A-Za-z0-9]/.test(password)
                      ? "text-emerald-400 font-medium"
                      : "text-slate-500"
                  }
                >
                  • Special symbol (!@#$)
                </span>
              </div>
            </div>
          )}

          {/* Terms & Privacy Checkbox */}
          <div className="flex items-start gap-2.5 pt-1">
            <input
              type="checkbox"
              id="terms"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded-md border-slate-700 bg-slate-900 text-cyan-500 accent-cyan-500 focus:ring-0 cursor-pointer"
            />
            <div className="text-xs text-slate-400 leading-relaxed select-none">
              <label htmlFor="terms" className="cursor-pointer inline">
                I agree to the{" "}
              </label>
              <button
                type="button"
                onClick={handleOpenTerms}
                className="font-bold text-cyan-400 hover:text-cyan-300 underline underline-offset-2 transition cursor-pointer"
              >
                Terms of Service
              </button>{" "}
              and{" "}
              <button
                type="button"
                onClick={handleOpenPrivacy}
                className="font-bold text-cyan-400 hover:text-cyan-300 underline underline-offset-2 transition cursor-pointer"
              >
                Privacy Policy
              </button>
              .
            </div>
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
                <span>Creating Account with AI...</span>
              </>
            ) : (
              <>
                <span>Create Free Account</span>
                <ArrowRight
                  size={16}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </>
            )}
          </button>

          {/* Switch to Login */}
          <div className="border-t border-white/5 pt-3 text-center text-xs text-slate-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-bold text-cyan-400 transition hover:text-cyan-300 hover:underline"
            >
              Sign In
            </Link>
          </div>
        </form>
      </motion.div>

      {/* Terms & Privacy Legal Modal */}
      <LegalModal
        isOpen={isLegalModalOpen}
        onClose={() => setIsLegalModalOpen(false)}
        defaultTab={legalModalTab}
        onAccept={() => {
          setTermsAccepted(true);
          toast.success("Terms & Privacy Policy accepted!");
        }}
      />
    </div>
  );
}