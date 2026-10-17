import { ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/lib/routes";

export function PrivacyPage() {
  return (
    <div className="flex min-h-screen justify-center bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="gap-2">
          <ShieldCheck className="h-8 w-8 text-primary" aria-hidden="true" />
          <CardTitle className="text-lg">Privacy</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm leading-relaxed">
          <p>You can use VerifyAI without an account.</p>
          <p>
            If you sign in with Google or GitHub, we only use your name and email to keep your check history, and we
            save the text you check so it shows up in your History.
          </p>
          <p>
            Text you check is sent to Groq and Tavily to do the fact-check. We never sell your data or use it for ads.
          </p>
          <Link to={ROUTES.landing} className="text-primary underline">
            Back to VerifyAI
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
