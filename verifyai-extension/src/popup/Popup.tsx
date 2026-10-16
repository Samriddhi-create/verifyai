import { ShieldCheck, ShieldOff } from "lucide-react";
import { useEffect } from "react";
import { AuthPanel } from "@/components/AuthPanel";
import { HistoryPanel } from "@/components/HistoryPanel";
import { VerifyPanel } from "@/components/VerifyPanel";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useSettings } from "@/hooks/useSettings";
import { useVerificationStore } from "@/store/useVerificationStore";
import { takePendingText } from "@/utils/storage";

function useSystemTheme() {
  useEffect(() => {
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const applyTheme = () => document.documentElement.classList.toggle("dark", query.matches);
    applyTheme();
    query.addEventListener("change", applyTheme);
    return () => query.removeEventListener("change", applyTheme);
  }, []);
}

// Text handed over by the right-click menu on pages that can't host the widget.
function usePendingText(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    void takePendingText().then((text) => {
      if (!text) return;
      const { setInputText, runVerification } = useVerificationStore.getState();
      setInputText(text);
      void runVerification(text);
    });
  }, [enabled]);
}

export function Popup() {
  useSystemTheme();
  const auth = useAuth();
  const { settings, isLoaded, setEnabled } = useSettings();
  usePendingText(isLoaded && settings.enabled);

  return (
    <div className="flex max-h-[600px] min-h-[220px] w-[380px] flex-col overflow-y-auto bg-background text-foreground">
      <header className="flex flex-col gap-2 border-b border-border p-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" />
            <h1 className="text-sm font-bold">VerifyAI</h1>
          </div>
          {isLoaded && (
            <label className="flex cursor-pointer items-center gap-2 text-xs font-medium">
              <span aria-hidden="true">{settings.enabled ? "On" : "Off"}</span>
              <Switch
                checked={settings.enabled}
                onCheckedChange={(checked) => void setEnabled(checked)}
                aria-label="Turn VerifyAI on or off"
              />
            </label>
          )}
        </div>
        <AuthPanel {...auth} />
      </header>

      {isLoaded && !settings.enabled ? (
        <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
          <ShieldOff className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
          <p className="text-sm font-medium">VerifyAI is off</p>
          <p className="text-xs text-muted-foreground">
            The selection button, right-click menu and keyboard shortcut are paused on every page.
          </p>
          <Button size="sm" onClick={() => void setEnabled(true)} className="mt-1">
            Turn on
          </Button>
        </div>
      ) : (
        <Tabs defaultValue="verify" className="flex flex-1 flex-col">
          <div className="px-3 pt-3">
            <TabsList className="w-full">
              <TabsTrigger value="verify" className="flex-1">
                Check
              </TabsTrigger>
              <TabsTrigger value="history" className="flex-1">
                History
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="verify" className="px-3 pb-3">
            <VerifyPanel autoFocus />
          </TabsContent>

          <TabsContent value="history" className="px-3 pb-3">
            <HistoryPanel isAuthenticated={Boolean(auth.user)} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
