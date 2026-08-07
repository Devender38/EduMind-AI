import { useState, useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";
import { resetPassword } from "../api/auth.api";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!token) {
      toast.error("Invalid password reset link. Please request a new one.");
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
      const res = await resetPassword({
        token,
        password,
        confirmPassword,
      });

      setSuccess(true);
      toast.success(res.message || "Password reset successfully!");
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        "Password reset token is invalid or has expired (15-minute limit).";
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#08111F] px-4 py-12 selection:bg-cyan-500 selection:text-white">
      {/* Background Glows */}
      <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-blue-600/25 blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-purple-600/25 blur-[140px] pointer-events-none" />

      {/* Grid Overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#38bdf8 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-md rounded-3xl border border-white/10 bg-[#0B1528]/80 p-8 shadow-2xl backdrop-blur-2xl"
      >
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-3 shadow-lg shadow-cyan-500/25">
            <KeyRound size={28} className="text-white" />
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Reset Password
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            {email ? (
              <>
                Establishing new password for <strong className="text-cyan-400">{email}</strong>
              </>
            ) : (
              "Enter and confirm your new secure password."
            )}
          </p>
        </div>

        {/* Error Alert */}
        <AnimatePresence>
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: "auto", marginBottom: 20 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-sm text-red-300"
            >
              <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-400" />
              <div className="space-y-1">
                <span>{errorMessage}</span>
                <div className="pt-1">
                  <Link
                    to="/forgot-password"
                    className="inline-flex items-center gap-1 font-semibold text-cyan-400 hover:underline"
                  >
                    <RefreshCw size={13} /> Request new reset link
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {success ? (
          <div className="space-y-6 text-center">
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6">
              <CheckCircle2 size={44} className="mx-auto mb-2 text-emerald-400" />
              <h3 className="text-lg font-semibold text-emerald-300">Password Reset Complete</h3>
              <p className="mt-1 text-xs text-slate-300">
                Your password has been successfully updated. All active sessions have been secured.
              </p>
            </div>

            <button
              onClick={() => navigate("/login")}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:opacity-95"
            >
              <span>Sign In with New Password</span>
              <ArrowRight size={16} />
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* New Password */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-300">
                New Password
              </label>
              <div className="group flex items-center rounded-xl border border-slate-700/80 bg-slate-900/80 px-3.5 transition focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-500/20">
                <Lock size={18} className="text-slate-400 group-focus-within:text-cyan-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-transparent p-3.5 text-sm text-white outline-none placeholder:text-slate-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 transition hover:text-slate-200"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Confirm New Password
              </label>
              <div className="group flex items-center rounded-xl border border-slate-700/80 bg-slate-900/80 px-3.5 transition focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-500/20">
                <Lock size={18} className="text-slate-400 group-focus-within:text-cyan-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-transparent p-3.5 text-sm text-white outline-none placeholder:text-slate-500"
                />
              </div>
            </div>

            {/* Password Strength Indicator */}
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
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all duration-300 hover:shadow-blue-500/40 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <>
                  <span>Establish New Password</span>
                  <ArrowRight
                    size={16}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </>
              )}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
