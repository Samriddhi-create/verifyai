import { useCallback, useEffect, useState } from "react";
import { isFromExtensionUi } from "@/content-scripts/constants";
import { FloatingTrigger } from "@/content-scripts/FloatingTrigger";
import { FloatingWidget } from "@/content-scripts/FloatingWidget";
import { useSettings } from "@/hooks/useSettings";
import { useVerificationStore } from "@/store/useVerificationStore";
import { isContentMessage } from "@/utils/messages";

const MIN_SELECTION_LENGTH = 12;

interface Trigger {
  top: number;
  left: number;
  text: string;
}

function selectedText(): string {
  return window.getSelection()?.toString().trim() ?? "";
}

export function App() {
  const { settings, isLoaded } = useSettings();
  const enabled = isLoaded && settings.enabled;
  const [trigger, setTrigger] = useState<Trigger | null>(null);
  const [widgetOpen, setWidgetOpen] = useState(false);

  // Every opening starts a fresh check; text that's already selected is checked straight away.
  const openWidget = useCallback((text: string | null) => {
    const store = useVerificationStore.getState();
    store.reset();
    setWidgetOpen(true);
    setTrigger(null);
    if (text) {
      store.setInputText(text);
      void store.runVerification(text, window.location.href);
    }
  }, []);

  const closeWidget = useCallback(() => {
    useVerificationStore.getState().reset();
    setWidgetOpen(false);
  }, []);

  useEffect(() => {
    if (!enabled) {
      setTrigger(null);
      closeWidget();
      return;
    }

    const handleMouseUp = (event: MouseEvent) => {
      if (isFromExtensionUi(event)) return;
      const selection = window.getSelection();
      const text = selectedText();
      if (text.length < MIN_SELECTION_LENGTH || !selection || selection.rangeCount === 0) {
        setTrigger(null);
        return;
      }
      const rect = selection.getRangeAt(0).getBoundingClientRect();
      setTrigger({ top: rect.bottom + 8, left: Math.min(rect.left, window.innerWidth - 220), text });
    };

    const handleMouseDown = (event: MouseEvent) => {
      if (!isFromExtensionUi(event)) setTrigger(null);
    };

    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mousedown", handleMouseDown);
    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, [enabled, closeWidget]);

  useEffect(() => {
    if (!enabled) return;

    const handleMessage = (message: unknown) => {
      if (!isContentMessage(message)) return;
      if (message.type === "VERIFYAI_VERIFY_SELECTION") {
        openWidget(message.text);
        return;
      }
      const text = selectedText();
      openWidget(text.length >= MIN_SELECTION_LENGTH ? text : null);
    };

    chrome.runtime.onMessage.addListener(handleMessage);
    return () => chrome.runtime.onMessage.removeListener(handleMessage);
  }, [enabled, openWidget]);

  if (!enabled) return null;

  return (
    <>
      {trigger && !widgetOpen && <FloatingTrigger position={trigger} onClick={() => openWidget(trigger.text)} />}
      {widgetOpen && <FloatingWidget onClose={closeWidget} />}
    </>
  );
}
