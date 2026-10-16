import { create } from "zustand";
import type { ChatMessage, VerificationReport } from "@/types";
import { ApiError, askFollowUp, verifyText } from "@/utils/api";
import { getCachedVerification, setCachedVerification } from "@/utils/storage";

interface VerificationState {
  inputText: string;
  report: VerificationReport | null;
  isLoading: boolean;
  error: string | null;
  chatMessages: ChatMessage[];
  isChatLoading: boolean;
  chatError: string | null;
  setInputText: (text: string) => void;
  runVerification: (text: string, sourceUrl?: string) => Promise<void>;
  askFollowUpQuestion: (question: string) => Promise<void>;
  reset: () => void;
}

// Incremented by reset() so a check that finishes after the panel was closed
// can't write its result into the next session.
let generation = 0;

export const useVerificationStore = create<VerificationState>((set, get) => ({
  inputText: "",
  report: null,
  isLoading: false,
  error: null,
  chatMessages: [],
  isChatLoading: false,
  chatError: null,

  setInputText: (text) => set({ inputText: text }),

  runVerification: async (text, sourceUrl) => {
    if (get().isLoading) return;
    const current = generation;
    set({ isLoading: true, error: null, report: null, chatMessages: [], chatError: null, isChatLoading: false });
    try {
      const cached = await getCachedVerification(text);
      if (cached) {
        if (current === generation) set({ report: cached, isLoading: false });
        return;
      }

      const report = await verifyText(text, sourceUrl);
      await setCachedVerification(text, report);
      if (current === generation) set({ report, isLoading: false });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Something went wrong while checking this text.";
      if (current === generation) set({ error: message, isLoading: false });
    }
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
