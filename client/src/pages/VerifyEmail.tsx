import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  Mail,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";
import { verifyEmail, resendVerificationEmail } from "../api/auth.api";
import { useAuthStore } from "../store/authStore";

export default function VerifyEmail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const emailParam = searchParams.get("email") || "";

  const { user, updateUser } = useAuthStore();
  const [emailInput, setEmailInput] = useState(emailParam || user?.email || "");

  const [status, setStatus] = useState<"loading" | "success" | "error" | "idle">(
    token ? "loading" : "idle"
  );
  const [message, setMessage] = useState("");
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (token) {
      verifyEmail(token)
        .then((res) => {
          setStatus("success");
          setMessage(res.message || "Your email address has been verified successfully!");
          updateUser({ isVerified: true });
          toast.success("Email verified!");
        })
        .catch((err) => {
          setStatus("error");
          setMessage(
            err?.response?.data?.message ||
              "The verification token is invalid or has expired."
          );
        });
    }
  }, [token]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput) {
      toast.error("Please enter your email address.");
      return;
    }

    try {
      setIsResending(true);
      const res = await resendVerificationEmail(emailInput.trim());
      toast.success(res.message || "Verification email resent!");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to resend verification email."
      );
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#08111F] px-4 py-12 selection:bg-cyan-500 selection:text-white">
      {/* Background Glows */}
      <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-blue-600/25 blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-emerald-600/20 blur-[140px] pointer-events-none" />

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
        className="relative w-full max-w-md rounded-3xl border border-white/10 bg-[#0B1528]/80 p-8 shadow-2xl backdrop-blur-2xl text-center"
      >
        {status === "loading" && (
          <div className="py-8 space-y-4">
            <Loader2 size={48} className="mx-auto animate-spin text-cyan-400" />
            <h2 className="text-2xl font-bold text-white">Verifying Email</h2>
            <p className="text-sm text-slate-400">
              Validating your security verification token...
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="py-4 space-y-6">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-500/20 text-emerald-400 ring-8 ring-emerald-500/10">
              <CheckCircle2 size={44} />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white">Email Verified!</h2>
              <p className="mt-2 text-sm text-slate-300">{message}</p>
            </div>

            <button
              onClick={() => navigate("/dashboard")}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:opacity-95"
            >
              <span>Explore Dashboard</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {status === "error" && (
          <div className="py-4 space-y-6">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-red-500/20 text-red-400 ring-8 ring-red-500/10">
              <XCircle size={44} />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white">Verification Failed</h2>
              <p className="mt-2 text-sm text-red-300">{message}</p>
            </div>

            <form onSubmit={handleResend} className="space-y-4 text-left">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Request New Verification Link
                </label>
                <div className="group flex items-center rounded-xl border border-slate-700 bg-slate-900 px-3.5 transition focus-within:border-cyan-500">
                  <Mail size={17} className="text-slate-400 group-focus-within:text-cyan-400" />
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="student@example.com"
                    className="w-full bg-transparent p-3 text-sm text-white outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isResending}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 text-sm font-semibold text-white shadow-lg transition hover:opacity-95 disabled:opacity-60"
              >
                {isResending ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <RefreshCw size={16} />
                )}
                <span>Resend Verification Link</span>
              </button>
            </form>
          </div>
        )}

        {status === "idle" && (
          <div className="space-y-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500/20 text-cyan-400">
              <Mail size={32} />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white">Verify Your Email</h2>
              <p className="mt-2 text-sm text-slate-300">
                Please confirm your email address to unlock full features.
              </p>
            </div>

            <form onSubmit={handleResend} className="space-y-4 text-left">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Your Email
                </label>
                <div className="group flex items-center rounded-xl border border-slate-700 bg-slate-900 px-3.5 transition focus-within:border-cyan-500">
                  <Mail size={17} className="text-slate-400 group-focus-within:text-cyan-400" />
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="student@example.com"
                    className="w-full bg-transparent p-3 text-sm text-white outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isResending}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:opacity-95 disabled:opacity-60"
              >
                {isResending ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <RefreshCw size={16} />
                )}
                <span>Send Verification Link</span>
              </button>
            </form>

            <Link
              to="/dashboard"
              className="inline-block text-xs font-medium text-slate-400 hover:text-slate-200"
            >
              Skip for now & go to Dashboard →
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
}
