import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  ArrowLeft,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";
import { forgotPassword } from "../api/auth.api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email) {
      toast.error("Please provide your email address.");
      return;
    }

    try {
      setLoading(true);
      const res = await forgotPassword(email.trim());
      setSubmitted(true);
      toast.success(res.message || "Password reset email sent!");
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        "Failed to send reset link. Please try again.";
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
        {/* Brand Icon */}
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-red-500 p-3 shadow-lg shadow-amber-500/25">
            <KeyRound size={28} className="text-white" />
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Forgot Password?
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            {submitted
              ? "We've dispatched recovery instructions to your email."
              : "No worries! Enter your email and we'll send you a 15-minute reset link."}
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
              <span>{errorMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {submitted ? (
          <div className="space-y-6">
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-center">
              <CheckCircle2 size={40} className="mx-auto mb-2 text-emerald-400" />
              <h3 className="font-semibold text-emerald-300">Email Dispatched</h3>
              <p className="mt-1 text-xs text-slate-300">
                If an account exists with <strong className="text-white">{email}</strong>, you will receive a secure password reset link shortly.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-700 hover:text-white"
              >
                <RefreshCw size={15} /> Try another email
              </button>

              <Link
                to="/login"
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:opacity-95"
              >
                <ArrowLeft size={16} /> Return to Login
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Email Address
              </label>
              <div className="group flex items-center rounded-xl border border-slate-700/80 bg-slate-900/80 px-3.5 transition focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-500/20">
                <Mail size={18} className="text-slate-400 group-focus-within:text-cyan-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@example.com"
                  className="w-full bg-transparent p-3.5 text-sm text-white outline-none placeholder:text-slate-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all duration-300 hover:shadow-blue-500/40 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Sending Reset Link...</span>
                </>
              ) : (
                <>
                  <span>Send Reset Link</span>
                  <ArrowRight
                    size={16}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </>
              )}
            </button>

            <div className="pt-2 text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-400 transition hover:text-white"
              >
                <ArrowLeft size={16} /> Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
