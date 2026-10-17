export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000",
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL ?? "",
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY ?? "",
  // Serves invented sample data instead of calling the API, for UI work without spending quota.
  mockApi: import.meta.env.VITE_MOCK_API === "true",
};
