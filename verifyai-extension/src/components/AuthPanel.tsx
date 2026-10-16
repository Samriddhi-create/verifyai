import { Github, LogOut, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { OAuthProvider } from "@/hooks/useAuth";
import type { AuthenticatedUser } from "@/types";

interface AuthPanelProps {
  user: AuthenticatedUser | null;
  isLoading: boolean;
  error: string | null;
  signIn: (provider: OAuthProvider) => Promise<void>;
  signOut: () => Promise<void>;
}

export function AuthPanel({ user, isLoading, error, signIn, signOut }: AuthPanelProps) {
  if (user) {
    return (
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="truncate text-muted-foreground">{user.email ?? "Signed in"}</span>
        <Button variant="ghost" size="sm" onClick={signOut} className="h-7 gap-1 px-2">
          <LogOut className="h-3 w-3" aria-hidden="true" />
          Sign out
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => signIn("google")} disabled={isLoading} className="h-7 gap-1 px-2 text-xs">
          <Mail className="h-3 w-3" aria-hidden="true" />
          Google
        </Button>
        <Button variant="outline" size="sm" onClick={() => signIn("github")} disabled={isLoading} className="h-7 gap-1 px-2 text-xs">
          <Github className="h-3 w-3" aria-hidden="true" />
          GitHub
        </Button>
        <span className="ml-auto text-[10px] text-muted-foreground">Sign in to save history</span>
      </div>
      {error && (
        <p role="alert" className="text-[11px] text-red-700 dark:text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}
