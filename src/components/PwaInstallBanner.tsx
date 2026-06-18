import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const STORAGE_KEY = "pwa-never-show";

export default function PwaInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(STORAGE_KEY) === "true") return;

    // Already installed?
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // iOS Safari
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    if (isStandalone) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setVisible(false));

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!visible) return null;

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setVisible(false);
  };

  const handleClose = () => setVisible(false);

  const handleNeverShow = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-live="polite"
      className="fixed bottom-4 left-1/2 z-[9999] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-xl border border-neutral-800 bg-white p-4 shadow-lg sm:left-auto sm:right-4 sm:translate-x-0"
    >
      <p className="mb-3 text-sm font-medium text-neutral-900">
        Install this app for faster access and offline support.
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleInstall}
          className="rounded-lg bg-[#c0392b] px-3 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          Install App
        </button>
        <button
          onClick={handleClose}
          className="rounded-lg border border-neutral-800 bg-white px-3 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-50"
        >
          Close
        </button>
        <button
          onClick={handleNeverShow}
          className="rounded-lg border border-neutral-800 bg-white px-3 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-50"
        >
          Don't show again
        </button>
      </div>
    </div>
  );
}
