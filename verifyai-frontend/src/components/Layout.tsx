import { History, LogIn, LogOut, Settings, ShieldCheck, Sparkles } from "lucide-react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/cn";
import { env } from "@/lib/env";

const NAV_ITEMS = [
  { to: "/", label: "Verify", icon: Sparkles, end: true },
  { to: "/history", label: "History", icon: History, end: false },
  { to: "/settings", label: "Settings", icon: Settings, end: false },
];

export function Layout() {
  const { user, signOut } = useAuth();

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="flex w-56 shrink-0 flex-col border-r border-border p-4">
        <div className="mb-6 flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" />
          <span className="text-sm font-bold">VerifyAI</span>
          {env.mockApi && (
            <span
              className="rounded-full border border-dashed border-border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground"
              title="VITE_MOCK_API is on: results are invented sample data, not real verifications."
            >
              Demo data
            </span>
          )}
        </div>

        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )
              }
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-2 border-t border-border pt-4">
          {user ? (
            <>
              <span className="truncate text-xs text-muted-foreground">{user.email}</span>
              <button
                type="button"
                onClick={() => void signOut()}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Sign out
              </button>
            </>
          ) : (
            <>
              <span className="text-xs text-muted-foreground">Sign in to save your history.</span>
              <Link
                to="/login"
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <LogIn className="h-4 w-4" aria-hidden="true" />
                Sign in
              </Link>
            </>
          )}
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  );
}
