import { useState, useEffect } from "react";
import { Search, LogOut, Sparkles, Download, Command } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import CommandPalette from "./CommandPalette";
import ExportCenterModal from "./ExportCenterModal";
import { useAuthStore } from "../../store/authStore";

interface Props {
  selectedDocument?: any;
}

function Topbar({ selectedDocument }: Props) {
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const navigate = useNavigate();

  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsCommandOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/10 bg-[#07090e]/70 px-6 py-3.5 backdrop-blur-xl md:px-8">
        {/* Universal Search Command Bar */}
        <button
          onClick={() => setIsCommandOpen(true)}
          className="group relative flex w-80 max-w-full items-center justify-between rounded-xl border border-white/10 bg-slate-900/80 px-3.5 py-2 text-xs text-slate-400 transition hover:border-cyan-500/50 hover:bg-slate-900 hover:text-slate-200 hover:shadow-lg hover:shadow-cyan-500/10"
        >
          <div className="flex items-center gap-2.5">
            <Search size={14} className="text-cyan-400" />
            <span>Search anything in EduMind...</span>
          </div>

          <span className="flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400">
            <Command size={10} /> K
          </span>
        </button>

        {/* Right Side Status & User Info */}
        <div className="flex items-center gap-3">
          {/* Universal Export Center Trigger */}
          <button
            onClick={() => setIsExportOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-xs font-bold text-cyan-300 shadow-md shadow-cyan-500/10 transition hover:bg-cyan-500/20 active:scale-95"
          >
            <Download size={13} />
            <span className="hidden sm:inline">Export Center</span>
          </button>

          {/* Live Engine Status Badge */}
          <div className="hidden lg:flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-300">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-semibold">RAG 3.0 Active</span>
          </div>

          {/* User Card - Link to Profile */}
          <Link
            to="/profile"
            className="group flex items-center gap-3 rounded-xl border border-white/10 bg-slate-900/60 p-1.5 pr-3.5 backdrop-blur-xl transition hover:border-cyan-500/40 hover:bg-slate-800/80"
          >
            <div className="relative">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name || "User"}
                  className="h-8 w-8 rounded-lg object-cover ring-2 ring-cyan-500/30"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-cyan-600 to-indigo-600 text-xs font-bold text-white ring-1 ring-white/20">
                  {(user?.name || "G").charAt(0).toUpperCase()}
                </div>
              )}
              <Sparkles size={10} className="absolute -bottom-1 -right-1 text-cyan-400" />
            </div>

            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-white group-hover:text-cyan-300 transition">
                {user?.name || "Guest"}
              </p>
              <p className="text-[10px] text-slate-400">
                {user?.email || "Student"}
              </p>
            </div>
          </Link>

          {/* Logout */}
          <button
            onClick={handleLogout}
            title="Logout"
            className="flex items-center gap-1.5 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-400 transition hover:bg-red-600 hover:text-white"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Modals */}
      <CommandPalette
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
      />

      <ExportCenterModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        document={selectedDocument || null}
      />
    </>
  );
}

export default Topbar;