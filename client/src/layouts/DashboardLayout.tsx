import { useState, type ReactNode } from "react";
import { NavLink } from "react-router-dom";
import Sidebar from "../components/dashboard/Sidebar";
import Topbar from "../components/dashboard/Topbar";
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  CalendarRange,
  User,
} from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const mobileNavItems = [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { label: "Documents", path: "/documents", icon: FileText },
    { label: "AI Chat", path: "/chat", icon: MessageSquare },
    { label: "Planner", path: "/planner", icon: CalendarRange },
    { label: "Profile", path: "/profile", icon: User },
  ];

  return (
    <div className="relative flex min-h-screen bg-[#07090e] text-slate-100 selection:bg-cyan-500 selection:text-white">
      {/* Ambient Animated Mesh & Glow Background */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-25" />
        <div className="absolute inset-0 bg-radial-vignette" />

        {/* Floating Glowing Orbs */}
        <div className="animate-mesh-drift-1 absolute -top-32 left-1/4 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-cyan-500/15 via-blue-600/10 to-transparent blur-[120px]" />
        <div className="animate-mesh-drift-2 absolute top-1/2 -right-20 h-[550px] w-[550px] rounded-full bg-gradient-to-bl from-indigo-500/15 via-purple-600/10 to-transparent blur-[130px]" />
        <div className="animate-pulse-glow absolute -bottom-32 left-1/3 h-[450px] w-[450px] rounded-full bg-gradient-to-tr from-teal-500/10 via-cyan-600/10 to-transparent blur-[110px]" />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Drawer */}
      <div className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-out lg:relative lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <Sidebar onClose={() => setIsSidebarOpen(false)} />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden w-full">
        {/* Top Navigation */}
        <Topbar onMenuClick={() => setIsSidebarOpen(true)} />

        {/* Page Content with safe padding for mobile bottom bar */}
        <main className="flex-1 overflow-y-auto p-3.5 sm:p-6 md:p-8 pb-24 lg:pb-8">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (iOS & Android) */}
      <nav
        aria-label="Mobile Navigation"
        className="fixed bottom-0 inset-x-0 z-30 flex items-center justify-around border-t border-white/10 bg-[#07090e]/95 px-2 py-2 backdrop-blur-2xl lg:hidden shadow-[0_-8px_30px_rgba(0,0,0,0.5)]"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom, 0px), 0.5rem)" }}
      >
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 rounded-xl px-2.5 py-1 text-[10px] font-semibold transition-all duration-200 ${
                  isActive
                    ? "text-cyan-400 font-bold"
                    : "text-slate-400 hover:text-slate-200"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-xl transition-all ${
                      isActive
                        ? "bg-cyan-500/15 text-cyan-400 ring-1 ring-cyan-500/30 shadow-sm shadow-cyan-500/20"
                        : "text-slate-400"
                    }`}
                  >
                    <Icon size={18} />
                  </div>
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}