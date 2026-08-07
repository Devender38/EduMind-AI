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
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/authStore";

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
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  // Real-time password strength calculation
  const strength = useMemo(() => {
    let score = 0;
    if (!password) return { score: 0, label: "None", color: "bg-slate-700", text: "text-slate-500" };

    if (password.length >= 6) score += 1;
    if (password.length >= 10) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 1) return { score: 20, label: "Weak", color: "bg-red-500", text: "text-red-400" };
    if (score === 2 || score === 3)
      return { score: 60, label: "Fair", color: "bg-amber-500", text: "text-amber-400" };
    if (score === 4)
      return { score: 85, label: "Good", color: "bg-blue-500", text: "text-blue-400" };
    return { score: 100, label: "Strong", color: "bg-emerald-500", text: "text-emerald-400" };
  }, [password]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!termsAccepted) {
      toast.error("Please agree to the Terms of Service & Privacy Policy.");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#08111F] px-4 py-12 selection:bg-cyan-500 selection:text-white">
      {/* Background Glows */}
      <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-blue-600/20 blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-purple-600/20 blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-cyan-600/10 blur-[160px] pointer-events-none" />

      {/* Grid Overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#38bdf8 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
        }}
      />

      {/* Success Registration Modal */}
      <AnimatePresence>
        {isSuccessModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0B1528] p-8 text-center shadow-2xl"
            >
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400">
                <CheckCircle2 size={36} />
              </div>
              <h2 className="text-2xl font-bold text-white">Account Created!</h2>
              <p className="mt-2 text-sm text-slate-300">
                We've sent a verification email to{" "}
                <strong className="text-cyan-400">{email}</strong>.
              </p>
              <p className="mt-1 text-xs text-slate-400">
                You can now start learning or verify your email at your convenience.
              </p>
              <div className="mt-6 flex flex-col gap-3">
                <button
                  onClick={() => navigate("/dashboard")}
                  className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:opacity-95"
                >
                  Continue to Dashboard
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Register Form Card */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-lg rounded-3xl border border-white/10 bg-[#0B1528]/80 p-8 shadow-2xl backdrop-blur-2xl"
      >
        {/* Brand Header */}
        <div className="mb-6 flex flex-col items-center text-center">
          <Link
            to="/"
            className="group mb-4 flex items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 p-3.5 shadow-lg shadow-blue-500/25 transition-transform duration-300 group-hover:scale-105"
          >
            <BrainCircuit size={32} className="text-white" />
          </Link>

          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Create Your Account
          </h1>
          <p className="mt-1.5 text-sm text-slate-400">
            Supercharge your cognitive learning with AI
          </p>
        </div>

        {/* Error Alert */}
        <AnimatePresence>
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-sm text-red-300"
            >
              <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleRegister} className="space-y-4">
          {/* Row 1: Full Name & Username */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Full Name <span className="text-red-400">*</span>
              </label>
              <div className="group flex items-center rounded-xl border border-slate-700/80 bg-slate-900/80 px-3.5 transition focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-500/20">
                <UserIcon size={17} className="text-slate-400 group-focus-within:text-cyan-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Devender"
                  className="w-full bg-transparent p-3 text-sm text-white outline-none placeholder:text-slate-500"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Username <span className="text-slate-500">(Optional)</span>
              </label>
              <div className="group flex items-center rounded-xl border border-slate-700/80 bg-slate-900/80 px-3.5 transition focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-500/20">
                <AtSign size={17} className="text-slate-400 group-focus-within:text-cyan-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="devender_ai"
                  className="w-full bg-transparent p-3 text-sm text-white outline-none placeholder:text-slate-500"
                />
              </div>
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Email Address <span className="text-red-400">*</span>
            </label>
            <div className="group flex items-center rounded-xl border border-slate-700/80 bg-slate-900/80 px-3.5 transition focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-500/20">
              <Mail size={17} className="text-slate-400 group-focus-within:text-cyan-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@example.com"
                className="w-full bg-transparent p-3 text-sm text-white outline-none placeholder:text-slate-500"
              />
            </div>
          </div>

          {/* Password & Confirm Password */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Password <span className="text-red-400">*</span>
              </label>
              <div className="group flex items-center rounded-xl border border-slate-700/80 bg-slate-900/80 px-3.5 transition focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-500/20">
                <Lock size={17} className="text-slate-400 group-focus-within:text-cyan-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-transparent p-3 text-sm text-white outline-none placeholder:text-slate-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 transition hover:text-slate-200"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Confirm Password <span className="text-red-400">*</span>
              </label>
              <div className="group flex items-center rounded-xl border border-slate-700/80 bg-slate-900/80 px-3.5 transition focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-500/20">
                <Lock size={17} className="text-slate-400 group-focus-within:text-cyan-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-transparent p-3 text-sm text-white outline-none placeholder:text-slate-500"
                />
              </div>
            </div>
          </div>

          {/* Password Strength Meter */}
          {password && (
            <div className="space-y-1.5 rounded-xl border border-slate-800 bg-slate-900/40 p-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Password Strength:</span>
                <span className={`font-semibold ${strength.text}`}>{strength.label}</span>
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
                <span className={password.length >= 6 ? "text-emerald-400" : ""}>
                  • Min 6 characters
                </span>
                <span className={/[A-Z]/.test(password) ? "text-emerald-400" : ""}>
                  • Uppercase letter
                </span>
                <span className={/[0-9]/.test(password) ? "text-emerald-400" : ""}>
                  • Number (0-9)
                </span>
                <span className={/[^A-Za-z0-9]/.test(password) ? "text-emerald-400" : ""}>
                  • Special character (!@#$)
                </span>
              </div>
            </div>
          )}

          {/* Terms & Conditions Checkbox */}
          <div className="flex items-start gap-2.5 pt-1">
            <input
              type="checkbox"
              id="terms"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-slate-700 bg-slate-900 text-cyan-500 accent-cyan-500 focus:ring-0 cursor-pointer"
            />
            <label htmlFor="terms" className="text-xs text-slate-400 leading-relaxed cursor-pointer">
              I agree to the{" "}
              <span className="text-cyan-400 hover:underline">Terms of Service</span> and{" "}
              <span className="text-cyan-400 hover:underline">Privacy Policy</span>.
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all duration-300 hover:shadow-blue-500/40 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Creating Account...</span>
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
          <div className="pt-1 text-center text-sm text-slate-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-cyan-400 transition hover:text-cyan-300 hover:underline"
            >
              Sign In
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
}