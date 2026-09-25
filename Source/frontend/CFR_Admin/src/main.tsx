import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { ToastProvider } from "@shared/app/components/ToastProvider";
import { UserProvider } from "@shared/app/context/UserContext";
import { AuthProvider } from "@/modules/authentication";
import "@shared/designSystem/styles.css";

const baseUrl = import.meta.env.BASE_URL;
const routerBasename = baseUrl === "/" ? undefined : baseUrl.replace(/\/$/, "");

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter basename={routerBasename}>
      <AuthProvider>
        <UserProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </UserProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);

// Dismisses the inline boot preloader from index.html once the app shell has actually painted —
// a double rAF (not a fixed timeout) waits for one real paint after React's render() call
// returns, since render() finishing doesn't guarantee the browser has drawn the frame yet.
requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    const preloader = document.getElementById("app-preloader");
    if (!preloader) return;
    preloader.dataset.hide = "true";
    preloader.addEventListener("transitionend", () => preloader.remove(), {
      once: true,
    });
  });
});
