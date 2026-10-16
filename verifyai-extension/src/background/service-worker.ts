import { fetchChat, fetchHistory, fetchVerification } from "@/background/apiClient";
import { isBackgroundRequest, type BackgroundResponse, type ContentMessage } from "@/utils/messages";
import { getSettings, subscribeToSettings } from "@/utils/settings";
import { setPendingText } from "@/utils/storage";

const CONTEXT_MENU_ID = "verifyai-verify-selection";
const OFF_BADGE_COLOR = "#71717a";

// The toolbar badge and right-click menu mirror the on/off switch.
function applyEnabledState(enabled: boolean): void {
  void chrome.action.setBadgeText({ text: enabled ? "" : "OFF" });
  void chrome.action.setBadgeBackgroundColor({ color: OFF_BADGE_COLOR });
  chrome.contextMenus.update(CONTEXT_MENU_ID, { visible: enabled }, () => {
    void chrome.runtime.lastError; // The menu doesn't exist until it has been created below.
  });
}

// Recreated on every start instead of only on install: Firefox drops menus when
// the browser restarts, and removing first keeps this safe to run repeatedly.
function createContextMenu(enabled: boolean): void {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: CONTEXT_MENU_ID,
      title: "Check with VerifyAI",
      contexts: ["selection"],
      visible: enabled,
    });
  });
}

async function activeTabId(): Promise<number | undefined> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab?.id;
}

// Shows the widget on the page. Some pages can't host it (browser-internal pages,
// the extension store, tabs opened before the extension was installed), so fall
// back to the toolbar popup, carrying any selected text along.
async function showOnPage(tabId: number | undefined, message: ContentMessage): Promise<void> {
  const { enabled } = await getSettings();
  if (!enabled) return;

  try {
    const target = tabId ?? (await activeTabId());
    if (target === undefined) throw new Error("No active tab");
    await chrome.tabs.sendMessage(target, message);
  } catch {
    if (message.type === "VERIFYAI_VERIFY_SELECTION") {
      await setPendingText(message.text);
    }
    try {
      await chrome.action.openPopup();
    } catch {
      // Opening the popup needs a focused browser window; nothing else to try.
    }
  }
}

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId !== CONTEXT_MENU_ID || !info.selectionText) return;
  void showOnPage(tab?.id, { type: "VERIFYAI_VERIFY_SELECTION", text: info.selectionText });
});

chrome.commands.onCommand.addListener((command, tab) => {
  if (command !== "open-widget") return;
  void showOnPage(tab?.id, { type: "VERIFYAI_OPEN_WIDGET" });
});

chrome.runtime.onMessage.addListener((message: unknown, _sender, sendResponse: (response: BackgroundResponse) => void) => {
  if (!isBackgroundRequest(message)) return false;

  const pending: Promise<BackgroundResponse> = (() => {
    switch (message.type) {
      case "VERIFYAI_VERIFY":
        return fetchVerification(message.text, message.sourceUrl);
      case "VERIFYAI_HISTORY":
        return fetchHistory(message.limit, message.offset);
      case "VERIFYAI_CHAT":
        return fetchChat(message.originalText, message.claims, message.history, message.question);
    }
  })();
  void pending.then(sendResponse);
  return true; // Keeps the channel open for the async response.
});

subscribeToSettings((settings) => applyEnabledState(settings.enabled));

void getSettings().then(({ enabled }) => {
  createContextMenu(enabled);
  applyEnabledState(enabled);
});
