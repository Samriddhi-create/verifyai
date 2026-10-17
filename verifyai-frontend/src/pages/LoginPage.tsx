import { Github, Mail, ShieldCheck } from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/lib/routes";

export function LoginPage() {
  const { user, isLoading, signIn } = useAuth();

  if (!isLoading && user) {
    return <Navigate to={ROUTES.verify} replace />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center gap-2 text-center">
          <ShieldCheck className="h-8 w-8 text-primary" aria-hidden="true" />
          <CardTitle className="text-lg">Sign in to VerifyAI</CardTitle>
          <p className="text-xs text-muted-foreground">Save your verification history and access it anywhere.</p>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Button variant="outline" className="gap-2" onClick={() => void signIn("google")} disabled={isLoading}>
            <Mail className="h-4 w-4" aria-hidden="true" />
            Continue with Google
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => void signIn("github")} disabled={isLoading}>
            <Github className="h-4 w-4" aria-hidden="true" />
            Continue with GitHub
          </Button>
          <Link to={ROUTES.verify} className="mt-2 text-center text-xs text-muted-foreground underline">
            Continue without signing in
          </Link>
          <Link to={ROUTES.privacy} className="text-center text-xs text-muted-foreground underline">
            Privacy policy
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
