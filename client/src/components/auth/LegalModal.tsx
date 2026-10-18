import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  FileText,
  Shield,
  Check,
  Lock,
  Sparkles,
  Scale,
  Clock,
  ExternalLink,
} from "lucide-react";

export type LegalTab = "terms" | "privacy";

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: LegalTab;
  onAccept?: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  onClose,
  defaultTab = "terms",
  onAccept,
}) => {
  const [activeTab, setActiveTab] = useState<LegalTab>(defaultTab);

  // Sync defaultTab when opened
  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab);
    }
  }, [isOpen, defaultTab]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 flex flex-col h-[88vh] max-h-[820px] w-full max-w-3xl overflow-hidden rounded-3xl border border-white/10 bg-[#0A101D] shadow-2xl shadow-cyan-950/40"
        >
          {/* Header */}
          <div className="flex flex-shrink-0 items-center justify-between border-b border-white/10 bg-slate-950/80 px-5 py-4 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-500/20 text-cyan-400 ring-1 ring-cyan-500/30">
                {activeTab === "terms" ? <Scale size={20} /> : <Shield size={20} />}
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <span>EduMind AI Legal Center</span>
                  <span className="rounded-full bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-cyan-300">
                    Updated Sept 2026
                  </span>
                </h2>
                <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                  <Clock size={12} />
                  <span>Effective Date: September 1, 2026</span>
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition"
              title="Close modal"
            >
              <X size={20} />
            </button>
          </div>

          {/* Tab Navigation Buttons */}
          <div className="flex flex-shrink-0 border-b border-white/10 bg-slate-900/60 px-5 py-2.5 gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("terms")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
                activeTab === "terms"
                  ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-600/20 ring-1 ring-cyan-400/40"
                  : "bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <FileText size={15} />
              <span>Terms of Service</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("privacy")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
                activeTab === "privacy"
                  ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-600/20 ring-1 ring-cyan-400/40"
                  : "bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Shield size={15} />
              <span>Privacy Policy</span>
            </button>
          </div>

          {/* Scrollable Document Content */}
          <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-8 space-y-6 text-slate-300 text-xs sm:text-sm leading-relaxed">
            {activeTab === "terms" ? (
              /* TERMS OF SERVICE CONTENT */
              <div className="space-y-6">
                <div className="rounded-2xl border border-cyan-500/20 bg-cyan-950/20 p-4 text-xs text-cyan-200">
                  <div className="flex items-center gap-2 font-bold text-cyan-300 mb-1">
                    <Sparkles size={14} />
                    <span>Welcome to EduMind AI</span>
                  </div>
                  Please read these Terms of Service carefully before using our platform. By registering an account or accessing EduMind AI, you agree to be bound by these terms.
                </div>

                <section className="space-y-2">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span className="text-cyan-400">1.</span> Acceptance of Terms
                  </h3>
                  <p>
                    By creating an account, accessing, or using EduMind AI (&quot;the Platform&quot;), you confirm that you are at least 13 years of age, or have parent/guardian consent, and agree to abide by these Terms of Service and all applicable local, national, and international laws.
                  </p>
                </section>

                <section className="space-y-2">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span className="text-cyan-400">2.</span> Purpose of the Platform
                  </h3>
                  <p>
                    EduMind AI is an interactive educational assistant designed to assist students, educators, and lifelong learners in organizing, summarizing, and testing their knowledge on uploaded study materials. The AI tutoring system provides guidance and explanations grounded in your documents.
                  </p>
                  <p>
                    While we strive for maximum accuracy, AI-generated explanations are provided for educational and revision support, not as legal, medical, or authoritative certification advice.
                  </p>
                </section>

                <section className="space-y-2">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span className="text-cyan-400">3.</span> User Accounts & Security
                  </h3>
                  <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
                    <li>You are responsible for maintaining the confidentiality of your login credentials and password.</li>
                    <li>You must provide accurate, current, and complete registration information.</li>
                    <li>You agree to notify us immediately of any unauthorized use or security breach of your account.</li>
                  </ul>
                </section>

                <section className="space-y-2">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span className="text-cyan-400">4.</span> Uploaded Documents & Intellectual Property
                  </h3>
                  <p>
                    <strong>You retain 100% ownership of your study materials, notes, and uploaded PDFs.</strong> We claim no ownership rights over your intellectual property. By uploading documents, you grant EduMind AI only the technical license to process, parse, index, and generate study resources exclusively for your account.
                  </p>
                  <p>
                    You agree not to upload materials that infringe on third-party copyrights, proprietary secrets, or violate academic honor codes.
                  </p>
                </section>

                <section className="space-y-2">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span className="text-cyan-400">5.</span> Acceptable Use Policy
                  </h3>
                  <p>You agree not to:</p>
                  <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
                    <li>Use the platform for any unlawful, abusive, harassing, or fraudulent purpose.</li>
                    <li>Attempt to reverse-engineer, decompile, or bypass security features of the API.</li>
                    <li>Upload malicious scripts, viruses, or harmful binary files.</li>
                    <li>Engage in automated scraping or denial-of-service activities against EduMind AI infrastructure.</li>
                  </ul>
                </section>

                <section className="space-y-2">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span className="text-cyan-400">6.</span> Service Availability & Modifications
                  </h3>
                  <p>
                    We continuously improve EduMind AI. We reserve the right to modify, suspend, or discontinue any feature, AI model, or study tool at any time with or without prior notice. We shall not be liable for any temporary downtime during maintenance windows.
                  </p>
                </section>

                <section className="space-y-2">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span className="text-cyan-400">7.</span> Termination
                  </h3>
                  <p>
                    You may delete your account and associated documents at any time. We reserve the right to suspend or terminate accounts that violate these terms or engage in disruptive behavior.
                  </p>
                </section>

                <section className="space-y-2">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span className="text-cyan-400">8.</span> Contact Us
                  </h3>
                  <p>
                    If you have any questions regarding these Terms of Service, please contact our support team at <span className="text-cyan-400 font-mono">support@edumind-ai.com</span>.
                  </p>
                </section>
              </div>
            ) : (
              /* PRIVACY POLICY CONTENT */
              <div className="space-y-6">
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/20 p-4 text-xs text-emerald-200">
                  <div className="flex items-center gap-2 font-bold text-emerald-300 mb-1">
                    <Lock size={14} />
                    <span>Your Privacy Matters to Us</span>
                  </div>
                  EduMind AI is built with privacy-first principles. We do not sell your personal data or use your private textbooks and notes to train public AI models.
                </div>

                <section className="space-y-2">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span className="text-emerald-400">1.</span> Information We Collect
                  </h3>
                  <p>We collect only the information necessary to provide and enhance our educational services:</p>
                  <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
                    <li><strong>Account Data:</strong> Name, username, and email address provided during registration.</li>
                    <li><strong>Study Materials:</strong> PDF documents, notes, and study titles you upload to generate summaries and quizzes.</li>
                    <li><strong>Voice Audio Inputs:</strong> Audio clips captured when you speak into the Voice Tutor microphone, used only for immediate transcription.</li>
                    <li><strong>Usage & Learning Metrics:</strong> Quiz scores, flashcard completions, study streaks, and interaction timestamps.</li>
                  </ul>
                </section>

                <section className="space-y-2">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span className="text-emerald-400">2.</span> How We Use Your Information
                  </h3>
                  <p>Your data is used strictly for:</p>
                  <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
                    <li>Delivering personalized AI study answers, quizzes, and voice tutoring.</li>
                    <li>Authenticating your account and synchronizing your study progress across devices.</li>
                    <li>Aggregating real-time analytics to visualize your subject mastery and learning progress.</li>
                    <li>Preventing fraud, platform abuse, and maintaining cybersecurity integrity.</li>
                  </ul>
                </section>

                <section className="space-y-2">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span className="text-emerald-400">3.</span> AI Processing & Zero Training Guarantee
                  </h3>
                  <p>
                    When you query your documents, context snippets are passed via secure encrypted HTTPS connections to our AI inference partners (OpenRouter / Google Gemini).
                  </p>
                  <p className="font-semibold text-slate-200 bg-slate-900/60 p-3 rounded-xl border border-white/5">
                    🔒 <strong>Zero Training Guarantee:</strong> Your uploaded documents and personal questions are strictly confidential and are NEVER used by EduMind AI or our model providers to train commercial base models.
                  </p>
                </section>

                <section className="space-y-2">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span className="text-emerald-400">4.</span> Storage & Data Security
                  </h3>
                  <p>
                    We employ industry-standard security safeguards:
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
                    <li><strong>Encryption in Transit:</strong> All web traffic is strictly encrypted using TLS/HTTPS.</li>
                    <li><strong>Encrypted Cloud Storage:</strong> Documents are hosted on secure, isolated Cloudinary cloud storage with access control tokens.</li>
                    <li><strong>Password Security:</strong> Passwords are cryptographically salted and hashed using bcrypt; plain-text passwords are never stored.</li>
                  </ul>
                </section>

                <section className="space-y-2">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span className="text-emerald-400">5.</span> Voice Audio & Microphone Rights
                  </h3>
                  <p>
                    Voice Tutor recording activates ONLY when you explicitly press the microphone button and terminates immediately when stopped. Audio data is used exclusively to generate real-time transcription and is discarded after processing.
                  </p>
                </section>

                <section className="space-y-2">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span className="text-emerald-400">6.</span> Your Data Rights & Account Deletion
                  </h3>
                  <p>
                    You have complete control over your educational data. You may delete individual documents, clear chat conversations, or request full account deletion at any time from your settings panel.
                  </p>
                </section>

                <section className="space-y-2">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span className="text-emerald-400">7.</span> Contact Privacy Officer
                  </h3>
                  <p>
                    For privacy inquiries or data removal requests, please contact our data protection officer at <span className="text-emerald-400 font-mono">privacy@edumind-ai.com</span>.
                  </p>
                </section>
              </div>
            )}
          </div>

          {/* Footer Action Bar */}
          <div className="flex flex-shrink-0 items-center justify-between border-t border-white/10 bg-slate-950/90 px-5 py-3.5 backdrop-blur-md">
            <span className="text-xs text-slate-400 hidden sm:inline">
              Reading {activeTab === "terms" ? "Terms of Service" : "Privacy Policy"}
            </span>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-white/10 bg-slate-800/80 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition"
              >
                Close
              </button>

              {onAccept && (
                <button
                  type="button"
                  onClick={() => {
                    onAccept();
                    onClose();
                  }}
                  className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-cyan-600/30 hover:brightness-110 active:scale-95 transition"
                >
                  <Check size={14} />
                  <span>I Agree & Accept</span>
                </button>
              )}
            </div>
          </div>
        </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
