/** Every in-app path in one place, so links can't drift from the route table. */
export const ROUTES = {
  landing: "/",
  verify: "/app",
  history: "/app/history",
  settings: "/app/settings",
  login: "/login",
  authCallback: "/auth/callback",
  privacy: "/privacy",
} as const;

export const GITHUB_URL = "https://github.com/Samriddhi-create/verifyai";
