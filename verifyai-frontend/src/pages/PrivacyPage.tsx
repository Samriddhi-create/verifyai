import { Link } from "react-router-dom";
import { BrandMark } from "@/components/brand/BrandMark";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/lib/routes";

export function PrivacyPage() {
  return (
    <div className="flex min-h-screen justify-center bg-bg px-4 py-10">
      <Card className="w-full max-w-2xl">
        <CardHeader className="gap-2">
          <Link to={ROUTES.landing} aria-label="VerifyAI home" className="mb-2 no-underline">
            <BrandMark />
          </Link>
          <CardTitle className="text-2xl">Privacy</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-[15px] leading-relaxed">
          <p>You can use VerifyAI without an account.</p>
          <p>
            If you sign in with Google or GitHub, we only use your name and email to keep your check history, and we
            save the text you check so it shows up in your History.
          </p>
          <p>
            Text you check is sent to Groq and Tavily to do the fact-check. We never sell your data or use it for ads.
          </p>
          <Link to={ROUTES.landing} className="inline-flex min-h-11 items-center text-violet underline hover:text-ink">
            Back to VerifyAI
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
