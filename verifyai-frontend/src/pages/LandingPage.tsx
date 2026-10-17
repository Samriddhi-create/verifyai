import { CircleAlert, CircleX, Gauge, Github, Link2, Menu, MessageCircleQuestion, Puzzle, ShieldCheck, Sparkles, X, type LucideIcon } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { Link } from "react-router-dom";
import { BrandMark } from "@/components/brand/BrandMark";
import { ScoreRing } from "@/components/report/ScoreRing";
import { SearchTrail } from "@/components/report/SearchTrail";
import { AgentSteps } from "@/components/StateViews";
import { Button } from "@/components/ui/button";
import { EXAMPLE_RESULT } from "@/landing/exampleResult";
import { GITHUB_URL, ROUTES } from "@/lib/routes";
import { percent, verdictLine } from "@/lib/status";
import type { AgentAttempt } from "@/types";

const SECTION_LINKS = [
  { href: "#how", label: "How it works" },
  { href: "#features", label: "What you get" },
  { href: "#stack", label: "Built with" },
];

const STEPS = [
  { title: "Extract claims", body: "The text is split into individual factual claims." },
  { title: "Search the web", body: "Each claim is searched on the live web." },
  { title: "Judge the evidence", body: "Sources are read and the claim is marked supported, partial, contradicted or unverified." },
  { title: "Retry if weak", body: "If the evidence is weak, the agent rewrites the query and searches again, up to 3 attempts." },
];

const FEATURES: { icon: LucideIcon; title: string; body: React.ReactNode }[] = [
  { icon: Gauge, title: "Trust score", body: "A score from 0 to 100 with a plain verdict: reliable, mixed or unreliable." },
  { icon: CircleAlert, title: "Possible-hallucination alerts", body: "Contradicted claims are flagged High. Claims with no evidence are flagged Medium." },
  { icon: Link2, title: "Sources behind every claim", body: "Each verdict links to the pages it was based on, with every search attempt shown." },
  { icon: MessageCircleQuestion, title: "Follow-up questions", body: "Ask why a claim was flagged, right below the report." },
  {
    icon: Puzzle,
    title: "Browser extension",
    body: (
      <>
        Check AI answers in your browser without copying them into another tab. It isn’t in an extension store: install
        it from the{" "}
        <a href={GITHUB_URL} className="text-violet underline hover:text-ink">
          GitHub repository
        </a>
        .
      </>
    ),
  },
];

const STACK = [
  { name: "React", role: "Web app" },
  { name: "FastAPI", role: "Agent API" },
  { name: "gpt-oss-120b", role: "Open-weight model on Groq" },
  { name: "Tavily", role: "Web search" },
  { name: "Supabase", role: "Accounts and history" },
];

// The trail component takes API-shaped attempts. Unverified attempts never
// display their confidence, so the 0 used for a missing value is not shown.
const EXAMPLE_TRACE: AgentAttempt[] = EXAMPLE_RESULT.attempts.map((attempt) => ({
  attempt: attempt.attempt,
  query: attempt.query,
  sources_found: attempt.sourcesFound,
  status: attempt.status,
  confidence_score: attempt.confidence ?? 0,
}));
const KEPT = EXAMPLE_RESULT.attempts.find((attempt) => attempt.attempt === EXAMPLE_RESULT.keptAttempt)!;

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="m-0 text-[15px] font-semibold text-muted-foreground">{children}</p>;
}

function SectionHeading({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="m-0 font-display text-[32px] font-bold leading-[1.1] tracking-[-0.02em] md:text-[40px]">
      {children}
    </h2>
  );
}

function GithubButton({ size = "lg" }: { size?: "lg" | "default" }) {
  return (
    <Button asChild variant="outline" size={size} className="text-base">
      <a href={GITHUB_URL}>
        <Github className="h-[18px] w-[18px]" aria-hidden="true" />
        View on GitHub
      </a>
    </Button>
  );
}

function LandingHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <header className="border-b border-line">
      <div className="mx-auto flex h-[60px] max-w-[1160px] items-center gap-2 pl-4 pr-2 md:h-[72px] md:gap-3 md:px-10">
        <a href="#top" className="mr-auto no-underline" aria-label="VerifyAI, back to top">
          <BrandMark />
        </a>
        <nav aria-label="Main" className="hidden gap-1 md:flex">
          {SECTION_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="inline-flex h-11 items-center px-2.5 text-[15px] font-medium text-muted-foreground no-underline hover:text-ink">
              {link.label}
            </a>
          ))}
        </nav>
        <Button asChild variant="outline" className="hidden md:inline-flex">
          <a href={GITHUB_URL}>
            <Github className="h-4 w-4" aria-hidden="true" />
            GitHub
          </a>
        </Button>
        <Button asChild>
          <Link to={ROUTES.verify}>Try VerifyAI</Link>
        </Button>
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-controls={menuId}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          className="grid h-11 w-11 place-items-center rounded-md text-ink hover:bg-surface-2 md:hidden"
        >
          {menuOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
        </button>
      </div>
      <nav id={menuId} hidden={!menuOpen} aria-label="Sections" className="border-t border-line px-3 pb-3 pt-2 md:hidden">
        {[...SECTION_LINKS, { href: GITHUB_URL, label: "GitHub" }].map((link) => (
          <a
            key={link.href}
            href={link.href}
            onClick={() => setMenuOpen(false)}
            className="flex h-11 items-center rounded-md px-3 text-[15px] font-medium text-muted-foreground no-underline hover:bg-surface-2 hover:text-ink"
          >
            {link.label}
          </a>
        ))}
      </nav>
    </header>
  );
}

function ExampleCard() {
  return (
    <figure className="m-0 mt-5 flex w-full max-w-[860px] flex-col items-center gap-5 rounded-lg border border-line-strong bg-surface px-4 pb-4 pt-6 text-left md:mt-10 md:flex-row md:flex-wrap md:gap-12 md:p-8">
      <ScoreRing score={EXAMPLE_RESULT.trustScore} />
      <div className="flex w-full min-w-0 flex-[1_1_360px] flex-col gap-3.5">
        <div className="flex items-center gap-2.5 text-contradicted-ink">
          <CircleX className="h-6 w-6" aria-hidden="true" />
          <strong className="font-display text-[28px] font-bold">Unreliable</strong>
        </div>
        <div className="flex flex-col gap-2.5 rounded-lg border border-contradicted bg-contradicted-soft px-4 py-3.5">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[15px] font-bold">Possible hallucination</span>
            <span className="inline-flex h-[26px] items-center rounded-sm bg-severity-high px-2.5 text-sm font-bold text-severity-on">
              <span className="sr-only">Severity: </span>
              {EXAMPLE_RESULT.hallucination.severity}
            </span>
          </div>
          <p className="m-0 text-base font-semibold leading-snug md:text-[17px]">{EXAMPLE_RESULT.claim}</p>
          <p className="m-0 text-[15px] text-muted-foreground">
            Contradicted by sources at {percent(EXAMPLE_RESULT.hallucination.confidence)}% confidence.
          </p>
        </div>
      </div>
      <figcaption className="w-full basis-full text-center text-sm text-muted-foreground md:text-left">{EXAMPLE_RESULT.label}</figcaption>
    </figure>
  );
}

export function LandingPage() {
  return (
    <div className="min-h-screen bg-bg text-ink">
      <LandingHeader />

      <main id="top">
        <section className="mx-auto flex max-w-[1160px] flex-col items-center gap-6 px-4 pb-16 pt-10 text-center md:px-10 md:pb-24 md:pt-[88px]">
          <h1 className="m-0 font-display text-[42px] font-extrabold leading-[1.05] tracking-[-0.03em] md:text-[64px]">
            Know when AI is making things up.
          </h1>
          <p className="m-0 max-w-[680px] text-[17px] leading-relaxed text-muted-foreground md:text-lg">
            VerifyAI splits AI-generated text into claims, checks each one against live web sources, and shows you a
            trust score with the evidence behind it.
          </p>
          <div className="flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row sm:flex-wrap">
            <Button asChild size="lg" className="text-base">
              <Link to={ROUTES.verify}>
                <Sparkles className="h-[18px] w-[18px]" aria-hidden="true" />
                Try VerifyAI
              </Link>
            </Button>
            <GithubButton />
          </div>
          <ExampleCard />
        </section>

        <section aria-labelledby="problem-heading" className="border-t border-line bg-surface">
          <div className="mx-auto grid max-w-[1160px] items-start gap-6 px-4 py-16 md:grid-cols-2 md:gap-12 md:px-10 md:py-24">
            <div className="flex flex-col gap-3">
              <Eyebrow>The problem</Eyebrow>
              <SectionHeading id="problem-heading">Confident is not the same as correct.</SectionHeading>
            </div>
            <p className="m-0 text-[17px] leading-relaxed text-muted-foreground md:pt-[34px] md:text-xl">
              AI chatbots write invented details in the same confident tone as real facts. Without checking the sources
              yourself, there is no way to tell which is which.
            </p>
          </div>
        </section>

        <section id="how" aria-labelledby="how-heading" className="border-t border-line">
          <div className="mx-auto flex max-w-[1160px] flex-col gap-10 px-4 py-16 md:px-10 md:py-24">
            <div className="flex max-w-[640px] flex-col gap-3">
              <Eyebrow>How the agent works</Eyebrow>
              <SectionHeading id="how-heading">Four steps, and a second look when evidence is weak.</SectionHeading>
            </div>
            <AgentSteps steps={STEPS} />
            <div className="flex flex-col gap-[22px] rounded-lg border border-line bg-surface p-4 md:p-7">
              <div className="flex flex-col gap-1.5">
                <Eyebrow>{EXAMPLE_RESULT.label}</Eyebrow>
                <h3 className="m-0 text-lg font-semibold leading-snug md:text-xl">“{EXAMPLE_RESULT.claim}”</h3>
              </div>
              <SearchTrail
                trace={EXAMPLE_TRACE}
                keptAttempt={EXAMPLE_RESULT.keptAttempt}
                verdict={verdictLine(KEPT.status, KEPT.confidence ?? 0, EXAMPLE_RESULT.keptAttempt)}
              />
            </div>
          </div>
        </section>

        <section id="features" aria-labelledby="features-heading" className="border-t border-line bg-surface">
          <div className="mx-auto flex max-w-[1160px] flex-col gap-10 px-4 py-16 md:px-10 md:py-24">
            <div className="flex flex-col gap-3">
              <Eyebrow>What you get</Eyebrow>
              <SectionHeading id="features-heading">A report you can act on.</SectionHeading>
            </div>
            <ul className="m-0 grid list-none gap-2.5 p-0 md:grid-cols-3 md:gap-4">
              {FEATURES.map(({ icon: Icon, title, body }) => (
                <li key={title} className="flex gap-3.5 rounded-lg border border-line bg-bg p-4 md:flex-col md:gap-3 md:p-[22px]">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-line bg-surface-2 text-ink">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div className="flex flex-col gap-1 md:gap-3">
                    <h3 className="m-0 text-[17px] font-semibold md:text-lg">{title}</h3>
                    <p className="m-0 text-[15px] leading-normal text-muted-foreground md:text-base">{body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="stack" aria-labelledby="stack-heading" className="border-t border-line">
          <div className="mx-auto flex max-w-[1160px] flex-col gap-8 px-4 py-16 md:px-10 md:py-24">
            <div className="flex flex-wrap items-end justify-between gap-5">
              <div className="flex flex-col gap-3">
                <Eyebrow>Built with</Eyebrow>
                <SectionHeading id="stack-heading">Open source, on open tools.</SectionHeading>
              </div>
              <div className="hidden md:block">
                <GithubButton />
              </div>
            </div>
            <ul className="m-0 grid list-none grid-cols-2 gap-2.5 p-0 md:grid-cols-5 md:gap-3">
              {STACK.map((item) => (
                <li key={item.name} className="flex flex-col gap-1.5 rounded-lg border border-line bg-surface p-[18px]">
                  <span className="font-mono text-base font-medium">{item.name}</span>
                  <span className="text-[15px] text-muted-foreground">{item.role}</span>
                </li>
              ))}
            </ul>
            <div className="md:hidden">
              <GithubButton />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-line bg-surface">
        <div className="mx-auto flex max-w-[1160px] flex-wrap items-center gap-4 px-4 py-7 md:px-10">
          <span className="mr-auto flex items-center gap-2.5">
            <span className="grid h-[26px] w-[26px] place-items-center rounded-[7px] bg-violet text-violet-on" aria-hidden="true">
              <ShieldCheck className="h-3.5 w-3.5" strokeWidth={2.4} />
            </span>
            {/* TODO: replace [Team name] with the team's name. */}
            <span className="text-[15px] text-muted-foreground">Built by [Team name]</span>
          </span>
          <Link to={ROUTES.privacy} className="inline-flex h-11 items-center px-2.5 text-[15px] font-medium text-muted-foreground no-underline hover:text-ink">
            Privacy
          </Link>
          <a href={GITHUB_URL} className="inline-flex h-11 items-center px-2.5 text-[15px] font-medium text-muted-foreground no-underline hover:text-ink">
            GitHub
          </a>
        </div>
      </footer>
    </div>
  );
}
