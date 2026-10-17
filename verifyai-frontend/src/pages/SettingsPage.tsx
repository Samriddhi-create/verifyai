import { Laptop, Moon, Sun } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useTheme, type ThemePreference } from "@/hooks/useTheme";
import { cn } from "@/lib/cn";
import { ROUTES } from "@/lib/routes";

const THEME_OPTIONS: { value: ThemePreference; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Laptop },
];

// One account can be linked to several providers (e.g. GitHub and Google with the same email).
function formatProviders(metadata: { provider?: string; providers?: string[] } | undefined): string {
  const providers = metadata?.providers?.length ? metadata.providers : metadata?.provider ? [metadata.provider] : [];
  const names = providers.map((name) => name.charAt(0).toUpperCase() + name.slice(1));
  return names.length ? names.join(" and ") : "OAuth";
}

export function SettingsPage() {
  const { user, signOut } = useAuth();
  const { preference, setTheme } = useTheme();

  return (
    <div className="mx-auto flex max-w-[860px] flex-col gap-6 sm:pt-7">
      <header className="flex flex-col gap-2.5">
        <h1 className="font-display text-[32px] font-bold leading-[1.1] tracking-[-0.02em] sm:text-[40px]">Settings</h1>
        <p className="m-0 text-[17px] text-muted-foreground">Manage your account and how VerifyAI looks.</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-between gap-3">
          {user ? (
            <>
              <div>
                <p className="text-[15px] font-semibold">{user.email}</p>
                <p className="text-sm text-muted-foreground">Signed in via {formatProviders(user.app_metadata)}</p>
              </div>
              <Button variant="outline" onClick={() => void signOut()}>
                Sign out
              </Button>
            </>
          ) : (
            <>
              <p className="text-[15px] text-muted-foreground">Sign in to keep your checks in History.</p>
              <Button asChild variant="outline">
                <Link to={ROUTES.login}>Sign in</Link>
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Theme</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2" role="group" aria-label="Theme">
          {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setTheme(value)}
              aria-pressed={preference === value}
              className={cn(
                "flex min-h-11 min-w-[96px] flex-1 flex-col items-center gap-1.5 rounded-lg border p-3 text-sm font-semibold transition-colors",
                preference === value ? "border-line-strong bg-surface-2 text-ink" : "border-line text-muted-foreground hover:text-ink"
              )}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {label}
            </button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
