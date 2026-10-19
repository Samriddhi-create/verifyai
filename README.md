# VerifyAI

A browser extension that fact-checks AI-generated text. Paste (or select) the text and VerifyAI gives it a 0–100 trust score, green when the claims hold up and red when they don't, and raises a hallucination alert for any claim the web contradicts or can't confirm. Works in Chrome, Edge, Brave, Opera, Vivaldi, Arc and Firefox, and can be switched off at any time.

## Project layout

- **verifyai-extension/** — Browser extension (Manifest V3; Chromium and Firefox builds), React + TypeScript + Vite, Tailwind CSS
- **verifyai-backend/** — FastAPI backend: claim extraction (Groq), web search (Tavily), auth/history (Supabase)
- **verifyai-frontend/** — Optional web dashboard (React + TypeScript + Vite): run verifications and browse history from a browser tab, using standard Supabase OAuth (not `chrome.identity`)

## How it works

1. Paste text into the popup or floating card, or select text on any page and click "Check with VerifyAI".
2. The backend chunks long text, then uses an LLM to extract discrete factual claims.
3. Each claim is searched via Tavily and analyzed against the results.
4. A trust score, a verdict and hallucination alerts render in the popup or the floating card, with per-claim status (supported / partial / contradicted / unverified) and evidence links behind them.
5. Signed-in users get their reports saved to history in Supabase.

## Prerequisites

- Python 3.11+
- Node.js 20+
- A [Supabase](https://supabase.com) project (Auth + Postgres)
- A [Groq](https://console.groq.com) API key (free tier available)
- A [Tavily](https://tavily.com) API key

## 1. Set up Supabase

1. Create a Supabase project.
2. In **Authentication → Providers**, enable Google and GitHub OAuth (add their client IDs/secrets).
3. In **Authentication → URL Configuration**, add redirect URLs for both clients: `https://<your-extension-id>.chromiumapp.org/` (you'll get the extension ID after loading it unpacked — see step 3 below, then come back and add this) and, if you're running the web dashboard, `http://localhost:5174/auth/callback` (plus your production dashboard URL later).
4. In the SQL editor, run [`verifyai-backend/supabase/schema.sql`](verifyai-backend/supabase/schema.sql) to create the `verifications` table and its RLS policies.
5. From **Project Settings → API Keys**, copy the project URL, the publishable key (used as `SUPABASE_ANON_KEY`) and the secret key (`SUPABASE_SERVICE_ROLE_KEY`). There is no JWT secret to copy: the backend verifies session tokens against your project's public JWKS endpoint.

## 2. Run the backend

```bash
cd verifyai-backend
python3.11 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # fill in your Groq / Tavily / Supabase keys
uvicorn app.main:app --reload --port 8000
```

Verify it's up: `curl http://localhost:8000/health` → `{"status":"ok"}`. Interactive API docs are at `http://localhost:8000/docs`. Endpoints: `POST /api/verify`, `POST /api/chat` (follow-up questions about a report), `GET /api/history`, `/api/auth/*`.

## 3. Run the extension

```bash
cd verifyai-extension
npm install
cp .env.example .env   # set VITE_API_BASE_URL and your Supabase URL + publishable key
npm run build          # type-checks, then builds dist/chrome and dist/firefox
```

`npm run dev` rebuilds on save (Chrome build); reload the extension card after a rebuild.

### Install it

| Browser | Build | Steps |
|---|---|---|
| Chrome, Brave, Edge, Opera, Vivaldi, Arc | `dist/chrome` | Open `chrome://extensions` (`brave://extensions`, `edge://extensions`, …), enable **Developer mode**, **Load unpacked**, pick `verifyai-extension/dist/chrome` |
| Firefox 115+ | `dist/firefox` | Open `about:debugging#/runtime/this-firefox`, **Load Temporary Add-on**, pick `dist/firefox/manifest.json` |

Safari isn't covered: it needs Apple's converter (`xcrun safari-web-extension-converter`) and an Xcode project.

### Use it

1. **Copy** the AI text, click the VerifyAI toolbar icon, **paste** into the box (it's focused already) and press **Check facts** (or ⌘/Ctrl+Enter).
2. Or press **Alt+Shift+V** on any page to open the same check as a small floating card you can drag, minimize (the coloured top edge keeps showing the verdict) and close with Esc. Change the shortcut at `chrome://extensions/shortcuts`.
3. Or **select text** on a page and click the "Check with VerifyAI" button that appears (or use the right-click menu): it opens the card and checks the selection straight away.

The card shows a 0–100 trust score with a verdict (green *Looks accurate*, amber *Some claims need review*, red *Likely inaccurate*) and a **possible hallucination** alert listing each claim the sources contradict (red) or can't confirm (amber). Expand *Show all claims* for the evidence behind each one. Under the report, **Ask a follow-up** lets you question the results ("Why was this flagged?"); answers use the report as context and the conversation so far, and start fresh with each new check.

### Turn it on or off

The switch in the popup header pauses everything on every page: the selection button, right-click menu, shortcut and floating card. The toolbar icon shows an **OFF** badge while it's paused.

### Accounts and permissions

- Signing in is optional and only needed for History. Add `https://<extension-id>.chromiumapp.org/` (Chromium browsers; the ID is on the extensions page) and, for Firefox, the URL from `browser.identity.getRedirectURL()` as redirect URLs under Supabase → Authentication → URL Configuration.
- The extension calls the API from its background script, so the backend does **not** need the extension in `ALLOWED_ORIGINS` (only the web dashboard does).

## 4. Run the web dashboard (optional)

```bash
cd verifyai-frontend
npm install
cp .env.example .env   # set VITE_API_BASE_URL and your Supabase URL/anon key
npm run dev             # http://localhost:5174
```

Sign in with Google/GitHub, run verifications, and browse history from a regular browser tab — useful for demoing the API without loading the extension, or for users who'd rather not install it.

## 5. Deploying to production

These steps touch your GitHub, Render, and Vercel accounts, so they have to be run by you (or with you present to approve the browser-based logins) — they can't be automated end-to-end. `gh`, `vercel`, and `railway` CLIs are already installed locally if you want to use them instead of the dashboards.

### 5a. Push to GitHub

```bash
gh auth login              # opens a one-time browser/device-code flow
gh repo create verifyai --private --source=. --remote=origin
git add -A && git commit -m "Initial commit"
git push -u origin main
```

### 5b. Backend → Render

A [`render.yaml`](render.yaml) blueprint is already at the repo root, pointed at `verifyai-backend/`.

1. Go to the [Render dashboard](https://dashboard.render.com) → **New → Blueprint** → connect the `verifyai` repo you just pushed.
2. Render reads `render.yaml` and creates the `verifyai-backend` web service. When prompted, fill in the secret env vars it left blank: `GROQ_API_KEY`, `TAVILY_API_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
3. Deploy. Once it's live, note the URL (e.g. `https://verifyai-backend.onrender.com`) and confirm `curl https://<that-url>/health` → `{"status":"ok"}`.
4. Update the `ALLOWED_ORIGINS` env var on the Render service once you know your Vercel URL and extension ID (step 5c/5d), then redeploy.

### 5c. Web dashboard → Vercel

```bash
cd verifyai-frontend
vercel login               # opens a one-time browser flow
vercel link                # first time only
vercel env add VITE_API_BASE_URL production      # your Render URL from 5b
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_ANON_KEY production
vercel --prod
```

Note the deployed URL, add `<that-url>/auth/callback` as a Supabase redirect URL (step 1.3), and add the bare origin to the backend's `ALLOWED_ORIGINS` on Render.

### 5d. Extension → Chrome Web Store (or private/unpacked use)

```bash
cd verifyai-extension
# point .env at the production backend and Supabase project first
npm run build
```

- **Personal/team use**: zip `dist/chrome` (or `dist/firefox`), share it, and load it unpacked as described in step 3 — no store review needed.
- **Public listing**: the Chrome build goes to the [Chrome Web Store](https://chrome.google.com/webstore/devconsole) (one-time $5 fee; also accepted by Edge Add-ons and Opera), the Firefox build to [addons.mozilla.org](https://addons.mozilla.org/developers/). Both review submissions manually (days), which nobody can skip. Point `VITE_API_BASE_URL` at the production backend and add its origin to the manifest's `host_permissions` first.

Either way, once you have the final (or a stable dev) extension ID, add its `chromiumapp.org` redirect URL to Supabase as described in step 3.

## Testing

```bash
# Backend
cd verifyai-backend && source .venv/bin/activate && pytest

# Extension
cd verifyai-extension && npm run type-check && npm run lint

# Web dashboard
cd verifyai-frontend && npm run type-check && npm run lint
```

## Team
Team KS: Karambir Singh and Samriddhi.
Live app: https://verifyai-app-alpha.vercel.app
## AI assistance
Built with help from Claude for design and coding. The team decided what to build and checked the results.
