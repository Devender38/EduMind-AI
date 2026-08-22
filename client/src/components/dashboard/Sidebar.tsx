import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  CalendarRange,
  BarChart3,
  User,
  Settings,
  LogOut,
  Brain,
  Sparkles,
  Zap,
  X,
} from "lucide-react";
import { NavLink, useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

interface SidebarProps {
  onClose?: () => void;
}

function Sidebar({ onClose }: SidebarProps) {
  const navigate = useNavigate();
  const { user, logout: storeLogout } = useAuthStore();

  const logout = async () => {
    await storeLogout();
    navigate("/login");
  };

  const menuItems = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
      path: "/dashboard",
      badge: "Hub",
      badgeClass: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
    },
    {
      name: "Documents",
      icon: FileText,
      path: "/documents",
    },
    {
      name: "AI Chat",
      icon: MessageSquare,
      path: "/chat",
    },
    {
      name: "Study Planner",
      icon: CalendarRange,
      path: "/planner",
      badge: "New",
      badgeClass: "bg-amber-500/20 text-amber-300 border-amber-500/30 animate-pulse",
    },
    {
      name: "Analyze",
      icon: BarChart3,
      path: "/analytics",
    },
    {
      name: "Profile",
      icon: User,
      path: "/profile",
    },
    {
      name: "Settings",
      icon: Settings,
      path: "/settings",
    },
  ];

  return (
    <aside className="relative flex min-h-screen w-72 flex-col border-r border-white/10 bg-[#07090e]/95 lg:bg-[#07090e]/80 backdrop-blur-2xl">
      {/* Mobile Close Button */}
      {onClose && (
        <button 
          onClick={onClose}
          className="lg:hidden absolute top-4 right-4 p-2 rounded-full bg-white/5 text-slate-400 hover:text-white transition"
        >
          <X size={20} />
        </button>
      )}

      {/* Logo */}
      <div className="border-b border-white/10 p-6">
        <Link to="/dashboard" className="group flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 shadow-lg shadow-cyan-500/25 ring-1 ring-white/20 transition group-hover:scale-105">
            <Brain size={22} className="text-white" />
            <div className="absolute inset-0 rounded-xl bg-cyan-400 opacity-0 blur transition group-hover:opacity-40" />
          </div>

          <div>
            <h1 className="text-lg font-extrabold tracking-tight text-white flex items-center gap-1.5">
              EduMind <span className="text-gradient-cyan">AI</span>
            </h1>
            <p className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
              AI Study Assistant
            </p>
          </div>
        </Link>
      </div>

      {/* User Welcome Card - Clickable to Profile */}
      <div className="border-b border-white/10 p-4">
        <Link
          to="/profile"
          className="group relative flex items-center justify-between overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 p-3.5 backdrop-blur-xl transition-all duration-300 hover:border-cyan-500/40 hover:bg-slate-800/80 hover:shadow-lg hover:shadow-cyan-500/10"
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="relative flex-shrink-0">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name || "User"}
                  className="h-10 w-10 rounded-xl object-cover ring-2 ring-cyan-500/30"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 text-sm font-bold text-white shadow-md">
                  {(user?.name || "S").charAt(0).toUpperCase()}
                </div>
              )}
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-[#07090e]" />
            </div>

            <div className="overflow-hidden">
              <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Welcome,</p>
              <h2 className="truncate text-sm font-bold text-white transition group-hover:text-cyan-300">
                {user?.name || "Student"}
              </h2>
            </div>
          </div>

          <Sparkles size={16} className="text-cyan-400 opacity-60 transition group-hover:opacity-100 group-hover:rotate-12" />
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1.5 p-4">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `group relative flex items-center justify-between rounded-xl px-4 py-3 text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white shadow-lg shadow-cyan-500/25"
                    : "text-slate-400 hover:bg-slate-900/80 hover:text-white hover:border-white/10"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <Icon
                      size={18}
                      className={
                        isActive
                          ? "text-white"
                          : "text-slate-400 transition group-hover:text-cyan-400 group-hover:scale-110"
                      }
                    />
                    <span>{item.name}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${
                        isActive
                          ? "bg-white/20 text-white border-white/30"
                          : item.badgeClass
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Pro Study Assistant Badge */}
      <div className="p-4">
        <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 via-blue-600/5 to-transparent p-3.5 backdrop-blur-xl">
          <div className="flex items-center gap-2 text-cyan-300 text-xs font-bold">
            <Zap size={14} className="text-cyan-400 animate-pulse" />
            <span>Neural RAG 3.0</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400 leading-relaxed">
            Active recall vectors & multi-doc reasoning enabled.
          </p>
        </div>
      </div>

      {/* Logout */}
      <div className="border-t border-white/10 p-4">
        <button
          onClick={logout}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-xs font-bold text-red-400 transition hover:bg-red-600 hover:text-white hover:shadow-lg hover:shadow-red-600/20"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;