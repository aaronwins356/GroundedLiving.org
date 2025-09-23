import React from "react";

import { FileText, Image, LayoutDashboard, LogOut, Moon, SunMedium, Users } from "lucide-react";

interface SidebarNavProps {
  active: "overview" | "posts" | "authors" | "assets";
  onChange: (section: SidebarNavProps["active"]) => void;
  onLogout: () => void;
  theme: "light" | "dark";
  onThemeToggle: () => void;
}

const NAV_ITEMS: Array<{
  id: SidebarNavProps["active"];
  label: string;
  description: string;
  icon: React.ComponentType<{ size?: number }>;
}> = [
  { id: "overview", label: "Overview", description: "Snapshot & analytics", icon: LayoutDashboard },
  { id: "posts", label: "Blog posts", description: "Drafts, edits, scheduling", icon: FileText },
  { id: "authors", label: "Authors", description: "Voices & collaborators", icon: Users },
  { id: "assets", label: "Assets", description: "Photography & art", icon: Image },
];

export const SidebarNav = ({ active, onChange, onLogout, theme, onThemeToggle }: SidebarNavProps) => (
  <aside className="hidden min-h-screen w-72 flex-col justify-between border-r border-slate-800/80 bg-slate-950/70 px-6 py-8 md:flex">
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Grounded Studio</p>
        <h1 className="mt-3 text-2xl font-semibold text-slate-100">Contentful Control</h1>
      </div>
      <nav className="space-y-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = item.id === active;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={`flex w-full flex-col rounded-2xl border px-4 py-3 text-left transition ${
                isActive
                  ? "border-emerald-400/60 bg-emerald-500/20 text-emerald-200 shadow-lg"
                  : "border-transparent bg-transparent text-slate-300 hover:border-slate-700 hover:bg-slate-900/60"
              }`}
            >
              <span className="flex items-center gap-3 text-sm font-semibold">
                <Icon size={18} />
                {item.label}
              </span>
              <span className="mt-1 text-xs text-slate-500">{item.description}</span>
            </button>
          );
        })}
      </nav>
    </div>
    <div className="space-y-3">
      <button
        type="button"
        onClick={onThemeToggle}
        className="flex w-full items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/40 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-emerald-400/50 hover:bg-slate-900/80"
      >
        <span>Toggle {theme === "dark" ? "light" : "dark"} mode</span>
        {theme === "dark" ? <SunMedium size={18} /> : <Moon size={18} />}
      </button>
      <button
        type="button"
        onClick={onLogout}
        className="flex w-full items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/40 px-4 py-2 text-sm font-semibold text-rose-300 transition hover:border-rose-400/50 hover:bg-rose-500/20"
      >
        Sign out
        <LogOut size={18} />
      </button>
    </div>
  </aside>
);
