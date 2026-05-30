import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  Bot,
  Settings,
  History,
  LogOut,
  FileText,
  Code2,
  Sparkles,
  Award,
  Map,
  Menu,
  X,
  Landmark,
  Compass,
  AwardIcon,
  Users,
  Mic,
} from "lucide-react";

export default function Sidebar() {
  const { currentUser, logout, userProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const displayName =
    userProfile?.displayName || currentUser?.email?.split("@")[0] || "User";
  const xp = userProfile?.xp || 0;
  const level = userProfile?.level || 1;
  const streak = userProfile?.streak || 0;
  const badges = userProfile?.badges || [];

  const xpProgress = xp % 300;
  const xpPercent = Math.min(100, Math.floor((xpProgress / 300) * 100));

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  const isActive = (path) => location.pathname === path;

  const links = [
    { name: "Dashboard", path: "/dashboard", icon: History },
    { name: "Mock Interview", path: "/setup", icon: Mic },
    { name: "Resume Analyzer", path: "/resume-analyzer", icon: FileText },
    { name: "CodeHub", path: "/coding-arena", icon: Code2 },
    { name: "Settings", path: "/settings", icon: Settings },
  ];

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between py-6">
      <div className="space-y-6">
        {/* Brand */}
        <Link
          to="/dashboard"
          className="px-6 flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <Bot className="w-8 h-8 text-primary-500" />
          <span className="font-display text-xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            InterviewAI
          </span>
        </Link>

        {/* Gamification Status Bar */}
        <div className="mx-4 p-4 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1.5 text-amber-400">
              <Award className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">
                Level {level}
              </span>
            </div>
            <span className="text-xs text-primary-400 font-mono font-medium">
              {xpProgress}/300 XP
            </span>
          </div>

          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-primary-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${xpPercent}%` }}
            />
          </div>

          <div className="flex justify-between items-center pt-1 border-t border-slate-800/50 text-[11px] text-slate-400">
            <div className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-primary-400" />
              <span>
                Streak:{" "}
                <strong className="text-slate-200">{streak} days</strong>
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span>
                Badges:{" "}
                <strong className="text-slate-200">{badges.length}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="px-4 space-y-1.5">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 group relative ${
                  isActive(link.path)
                    ? "bg-primary-600/10 text-primary-400 border border-primary-500/20"
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent"
                }`}
              >
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${
                    isActive(link.path)
                      ? "text-primary-400"
                      : "text-slate-400 group-hover:text-slate-200"
                  }`}
                />
                <span>{link.name}</span>
                {isActive(link.path) && (
                  <div className="absolute left-0 w-1 h-1/2 bg-primary-500 rounded-r-full" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Logout Footer */}
      <div className="px-4 space-y-4">
        {/* Mobile-only Level badge overlay */}
        {badges.length > 0 && (
          <div className="flex flex-wrap gap-1 px-2">
            {badges.slice(0, 3).map((badge, i) => (
              <span
                key={i}
                className="text-[9px] bg-slate-800 border border-slate-700/50 px-2 py-0.5 rounded-full text-slate-300 font-medium truncate max-w-[120px]"
                title={badge}
              >
                🏆 {badge}
              </span>
            ))}
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl w-full transition-all duration-200 font-medium border border-transparent hover:border-red-500/10"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Top Navbar */}
      <header className="md:hidden w-full h-16 glassmorphism border-b border-slate-800 flex items-center justify-between px-6 fixed top-0 left-0 z-30">
        <div className="flex items-center gap-2">
          <Bot className="w-6 h-6 text-primary-500" />
          <span className="font-display text-lg font-bold">InterviewAI</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-slate-800/80 px-2.5 py-1 rounded-full text-xs font-mono text-amber-400 font-semibold flex items-center gap-1">
            🔥 {streak}d
          </div>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-20"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Drawer Panel */}
      <aside
        className={`md:hidden fixed top-0 left-0 h-screen w-64 glassmorphism border-r border-slate-800 z-30 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Desktop Persistent Sidebar */}
      <aside className="w-64 glassmorphism border-r border-slate-800 h-screen hidden md:block flex-shrink-0 sticky top-0">
        {sidebarContent}
      </aside>
    </>
  );
}
