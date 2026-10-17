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
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account and preferences.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          {user ? (
            <>
              <div>
                <p className="text-sm font-medium">{user.email}</p>
                <p className="text-xs text-muted-foreground">Signed in via {formatProviders(user.app_metadata)}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => void signOut()}>
                Sign out
              </Button>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">Not signed in. Sign in to save your history.</p>
              <Button asChild variant="outline" size="sm">
                <Link to={ROUTES.login}>Sign in</Link>
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2">
          {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setTheme(value)}
              aria-pressed={preference === value}
              className={cn(
                "flex flex-1 flex-col items-center gap-1.5 rounded-md border border-input p-3 text-xs font-medium transition-colors",
                preference === value ? "border-primary bg-secondary text-secondary-foreground" : "text-muted-foreground hover:bg-accent"
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
