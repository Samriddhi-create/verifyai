import { History, LogIn, LogOut, Menu, SlidersHorizontal, Sparkles, X } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { BrandMark } from "@/components/brand/BrandMark";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/cn";
import { env } from "@/lib/env";
import { ROUTES } from "@/lib/routes";

const NAV_ITEMS = [
  { to: ROUTES.verify, label: "Verify", icon: Sparkles, end: true },
  { to: ROUTES.history, label: "History", icon: History, end: false },
  { to: ROUTES.settings, label: "Settings", icon: SlidersHorizontal, end: false },
];

function DemoDataLabel() {
  if (!env.mockApi) return null;
  return (
    <span
      className="rounded-sm border border-dashed border-line-strong px-2 py-0.5 text-sm font-semibold text-muted-foreground"
      title="VITE_MOCK_API is on: results are invented sample data, not real verifications."
    >
      Demo data
    </span>
  );
}

function NavItems() {
  return (
    <>
      {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            cn(
              "flex h-11 items-center gap-3 rounded-md px-3 text-[15px] no-underline transition-colors",
              isActive
                ? "bg-surface-2 font-semibold text-ink shadow-[inset_0_0_0_1px_var(--line)]"
                : "font-medium text-muted-foreground hover:bg-surface-2 hover:text-ink"
            )
          }
        >
          <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
          {label}
        </NavLink>
      ))}
    </>
  );
}

function AccountArea() {
  const { user, signOut } = useAuth();

  if (user) {
    return (
      <>
        <p className="truncate text-sm text-muted-foreground">{user.email}</p>
        <Button variant="outline" onClick={() => void signOut()}>
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Sign out
        </Button>
      </>
    );
  }
  return (
    <>
      <p className="text-sm leading-normal text-muted-foreground">Sign in to keep your checks in History.</p>
      <Button asChild variant="outline">
        <Link to={ROUTES.login}>
          <LogIn className="h-4 w-4" aria-hidden="true" />
          Sign in
        </Link>
      </Button>
    </>
  );
}

export function AppShell() {
  const { user } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();

  // Close the mobile menu after navigating, and on Escape.
  useEffect(() => setMenuOpen(false), [location.pathname]);
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <div className="flex min-h-screen flex-col bg-bg text-ink sm:flex-row">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col gap-7 border-r border-line bg-surface px-3.5 py-5 sm:flex">
        <div className="flex flex-wrap items-center gap-2 px-2 py-1">
          <Link to={ROUTES.landing} className="no-underline" aria-label="VerifyAI home">
            <BrandMark />
          </Link>
          <DemoDataLabel />
        </div>
        <nav aria-label="Main" className="flex flex-col gap-1">
          <NavItems />
        </nav>
        <div className="mt-auto flex flex-col gap-3 border-t border-line px-2 pt-4">
          <AccountArea />
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 border-b border-line bg-surface sm:hidden">
        <div className="flex h-14 items-center gap-2 pl-4 pr-2">
          <Link to={ROUTES.landing} className="no-underline" aria-label="VerifyAI home">
            <BrandMark />
          </Link>
          <DemoDataLabel />
          <div className="ml-auto flex items-center gap-1">
            {!user && (
              <Button asChild variant="outline" size="sm">
                <Link to={ROUTES.login}>Sign in</Link>
              </Button>
            )}
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls={menuId}
              aria-label={menuOpen ? "Close menu" : "Open menu: Verify, History, Settings"}
              className="grid h-11 w-11 place-items-center rounded-md text-ink hover:bg-surface-2"
            >
              {menuOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
            </button>
          </div>
        </div>
        <div id={menuId} hidden={!menuOpen} className="border-t border-line px-3 pb-4 pt-2">
          <nav aria-label="Main" className="flex flex-col gap-1">
            <NavItems />
          </nav>
          {user && (
            <div className="mt-3 flex flex-col gap-3 border-t border-line px-2 pt-3">
              <AccountArea />
            </div>
          )}
        </div>
      </header>

      <main className="min-w-0 flex-1 px-4 pb-14 pt-6 sm:px-10 sm:pt-7">
        <Outlet />
      </main>
    </div>
  );
}
