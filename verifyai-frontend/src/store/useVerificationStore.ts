import { create } from "zustand";
import type { ChatMessage, VerificationReport } from "@/types";
import { ApiError, askFollowUp, verifyText } from "@/lib/api";
import { getCachedVerification, setCachedVerification } from "@/lib/cache";
import { env } from "@/lib/env";

interface VerificationState {
  inputText: string;
  report: VerificationReport | null;
  isLoading: boolean;
  error: string | null;
  chatMessages: ChatMessage[];
  isChatLoading: boolean;
  chatError: string | null;
  setInputText: (text: string) => void;
  runVerification: (text: string) => Promise<void>;
  cancelVerification: () => void;
  askFollowUpQuestion: (question: string) => Promise<void>;
  reset: () => void;
}

// Incremented whenever a new check starts or the state is reset, so a follow-up
// answer for an old report can't land in the conversation about a new one.
let generation = 0;
// Aborts the in-flight check's request when it is cancelled or replaced.
let verifyController: AbortController | null = null;

export const useVerificationStore = create<VerificationState>((set, get) => ({
  inputText: "",
  report: null,
  isLoading: false,
  error: null,
  chatMessages: [],
  isChatLoading: false,
  chatError: null,

  setInputText: (text) => set({ inputText: text }),

  runVerification: async (text) => {
    generation += 1;
    const current = generation;
    verifyController?.abort();
    const controller = new AbortController();
    verifyController = controller;
    set({ isLoading: true, report: null, error: null, chatMessages: [], isChatLoading: false, chatError: null });
    try {
      // Mock reports are never read from or written to the cache, so invented
      // sample data can't be served as a real result once mock mode is off.
      const cached = env.mockApi ? null : getCachedVerification(text);
      if (cached) {
        set({ report: cached, isLoading: false });
        return;
      }

      const report = await verifyText(text, undefined, controller.signal);
      if (current !== generation) return;
      if (!env.mockApi) setCachedVerification(text, report);
      set({ report, isLoading: false });
    } catch (err) {
      // A cancelled or replaced check has nothing left to report.
      if (current !== generation) return;
      const message = err instanceof ApiError ? err.message : "Something went wrong while verifying this text.";
      set({ error: message, isLoading: false });
    }
  },

  // The page stops waiting, but a request the backend already received still runs there.
  cancelVerification: () => {
    generation += 1;
    verifyController?.abort();
    verifyController = null;
    set({ isLoading: false });
  },

  askFollowUpQuestion: async (question) => {
    const { report, chatMessages, isChatLoading } = get();
    if (!report || isChatLoading) return;

    const current = generation;
    const withQuestion: ChatMessage[] = [...chatMessages, { role: "user", content: question }];
    set({ chatMessages: withQuestion, chatError: null, isChatLoading: true });
    try {
      const { answer } = await askFollowUp(report, chatMessages, question);
      if (current === generation) {
        set({ chatMessages: [...withQuestion, { role: "assistant", content: answer }], isChatLoading: false });
      }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Couldn't get an answer. Try asking again.";
      if (current === generation) set({ chatError: message, isChatLoading: false });
    }
  },

  reset: () => {
    generation += 1;
    verifyController?.abort();
    verifyController = null;
    set({
      inputText: "",
      report: null,
      isLoading: false,
      error: null,
      chatMessages: [],
      isChatLoading: false,
      chatError: null,
    });
  },
}));
