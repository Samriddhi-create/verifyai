export const HOST_ID = "verifyai-extension-root";

/** True when a DOM event came from inside the extension's own shadow tree. */
export function isFromExtensionUi(event: Event): boolean {
  const host = document.getElementById(HOST_ID);
  return host !== null && event.composedPath().includes(host);
}
