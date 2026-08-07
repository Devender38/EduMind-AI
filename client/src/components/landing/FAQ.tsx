import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

const faqs = [
  {
    q: "How does EduMind AI prevent AI hallucinations?",
    a: "EduMind AI uses advanced RAG 3.0 vector search with FAISS and cross-document ranking. Every single response is strictly grounded in your uploaded documents and references exact page numbers and paragraphs with confidence scores.",
  },
  {
    q: "Can I upload large 500+ page textbook PDFs?",
    a: "Yes! EduMind AI supports high-density academic textbooks, slide decks, research papers, and syllabi up to 100MB with automated OCR, hierarchical chunking, and math formula preservation.",
  },
  {
    q: "How does the 1-Day Exam Cram Study Planner work?",
    a: "Our neural planner scans your document's chapter structure, identifies high-yield exam topics, calculates concept difficulty, and crafts an hour-by-hour active recall timetable with scheduled flashcard drills, formula reviews, and practice questions.",
  },
  {
    q: "Are the 3D flashcards and quizzes generated automatically?",
    a: "Yes! With a single click, our AI synthesizes 20–30 high-yield flashcard decks with spaced-repetition memory rating and 15–20 multiple-choice questions with thorough step-by-step explanations.",
  },
  {
    q: "Is my personal research and textbook data secure?",
    a: "Your files are encrypted in an isolated Cloudinary vault with SHA-256 tokens and TLS 1.3 encryption. Your data is never used to train public foundation models and can be permanently deleted at any time.",
  },
  {
    q: "Can I use the AI Voice Tutor to practice speaking?",
    a: "Yes! The integrated Voice Tutor listens to your questions in real-time, speaks back conversational explanations with natural intonation, and tracks your active comprehension.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-24 px-6 relative bg-gradient-to-b from-[#07090e] via-slate-950 to-[#07090e] border-t border-white/10">
      <div className="max-w-4xl mx-auto">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3.5 py-1 text-xs font-semibold text-purple-300">
            <HelpCircle size={14} />
            <span>Got Questions?</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Everything you need to know about our RAG 3.0 cognitive study engine.
          </p>
        </div>

        <div className="mt-12 space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl transition duration-200"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="flex w-full items-center justify-between p-5 text-left text-sm font-bold text-white transition hover:text-cyan-300"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    size={18}
                    className={`text-slate-400 transition-transform duration-300 ${
                      isOpen ? "rotate-180 text-cyan-400" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="p-5 pt-0 text-xs sm:text-sm leading-relaxed text-slate-300 border-t border-white/5 animate-in fade-in duration-200">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}