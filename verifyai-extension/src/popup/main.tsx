import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Popup } from "@/popup/Popup";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import "@/index.css";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");

createRoot(rootElement).render(
  <StrictMode>
    <ErrorBoundary>
      <Popup />
    </ErrorBoundary>
  </StrictMode>
);
