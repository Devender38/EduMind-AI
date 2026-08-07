import type { ReactNode } from "react";
import Sidebar from "../components/dashboard/Sidebar";
import Topbar from "../components/dashboard/Topbar";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {
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

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Navigation */}
        <Topbar />

        {/* Page Content with Glassmorphic feel */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}