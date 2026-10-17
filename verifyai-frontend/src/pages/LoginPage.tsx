import { Github, Mail } from "lucide-react";
import { BrandMark } from "@/components/brand/BrandMark";
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
    <div className="flex min-h-screen items-center justify-center bg-bg p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center gap-3 text-center">
          <Link to={ROUTES.landing} aria-label="VerifyAI home" className="no-underline">
            <BrandMark />
          </Link>
          <CardTitle className="text-2xl">Sign in</CardTitle>
          <p className="text-[15px] text-muted-foreground">Keep your checks in History and see them on any device.</p>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Button variant="outline" onClick={() => void signIn("google")} disabled={isLoading}>
            <Mail className="h-4 w-4" aria-hidden="true" />
            Continue with Google
          </Button>
          <Button variant="outline" onClick={() => void signIn("github")} disabled={isLoading}>
            <Github className="h-4 w-4" aria-hidden="true" />
            Continue with GitHub
          </Button>
          <Link to={ROUTES.verify} className="mt-2 flex min-h-11 items-center justify-center text-sm text-muted-foreground underline hover:text-ink">
            Continue without signing in
          </Link>
          <Link to={ROUTES.privacy} className="flex min-h-11 items-center justify-center text-sm text-muted-foreground underline hover:text-ink">
            Privacy policy
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
