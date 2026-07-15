import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Upload,
  Clock,
  Star,
  Trash2,
  Settings,
  FileText,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/upload", label: "Upload PDF", icon: Upload },
  { to: "/recent", label: "Recent", icon: Clock },
  { to: "/starred", label: "Starred", icon: Star },
  { to: "/trash", label: "Trash", icon: Trash2 },
];

function NavItems({ onNavigate }) {
  const { pathname } = useLocation();
  return (
    <nav className="flex flex-col gap-0.5 px-3">
      {nav.map((item) => {
        const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
        const Icon = item.icon;
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={cn(
              "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-sidebar-accent text-primary"
                : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-foreground",
            )}
          >
            <Icon className={cn("h-4 w-4 shrink-0", active && "text-primary")} strokeWidth={2} />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarInner({ onNavigate }) {
  const { pathname } = useLocation();
  const settingsActive = pathname.startsWith("/settings");
  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <Link
        to="/dashboard"
        onClick={onNavigate}
        className="flex items-center gap-2.5 px-6 pt-6 pb-8"
      >
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg gradient-primary shadow-glow">
          <FileText className="h-4 w-4 text-primary-foreground" strokeWidth={2.5} />
        </div>
        <span className="text-base font-semibold tracking-tight text-foreground">DocTalk</span>
      </Link>

      <div className="mb-2 px-6 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        Workspace
      </div>
      <NavItems onNavigate={onNavigate} />

      <div className="mt-auto border-t border-sidebar-border px-3 py-3">
        <Link
          to="/settings"
          onClick={onNavigate}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            settingsActive
              ? "bg-sidebar-accent text-primary"
              : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-foreground",
          )}
        >
          <Settings className="h-4 w-4 shrink-0" strokeWidth={2} />
          <span>Settings</span>
        </Link>
      </div>
    </div>
  );
}

export function AppSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden shrink-0 border-r border-sidebar-border lg:block lg:w-64">
        <div className="fixed inset-y-0 left-0 w-64">
          <SidebarInner />
        </div>
      </aside>

      {/* Mobile hamburger */}
      <button
        aria-label="Open menu"
        onClick={() => setMobileOpen(true)}
        className="fixed left-3 top-3 z-40 grid h-9 w-9 place-items-center rounded-md border border-border bg-surface text-foreground lg:hidden"
      >
        <Menu className="h-4 w-4" />
      </button>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Close menu"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-72 border-r border-sidebar-border shadow-soft">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:text-foreground"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
            <SidebarInner onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
