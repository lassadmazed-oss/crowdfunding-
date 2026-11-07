"use client";

import Image from "next/image";
import { useEffect, useState, useSyncExternalStore } from "react";
import type { Dictionary } from "@/i18n/dictionaries/fr";

// Invites phone visitors to add Lebna to their home screen. iOS Safari has no install prompt, so it
// shows the Share → "Add to Home Screen" steps; Chromium browsers get a real Install button.
// Hidden on large screens, inside the installed app, and for good once closed.

type InstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };
type Platform = "none" | "ios" | "other";

const DISMISSED_KEY = "lebna-install-dismissed";

function readPlatform(): Platform {
  const standalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
  if (standalone || !window.matchMedia("(max-width: 767px)").matches) return "none";
  try {
    if (localStorage.getItem(DISMISSED_KEY) === "1") return "none";
  } catch {
    // Storage blocked (private mode): just show the hint.
  }
  return /iPhone|iPad|iPod/.test(navigator.userAgent) ? "ios" : "other";
}

const noSubscription = () => () => {};

export function InstallHint({ t }: { t: Dictionary["install"] }) {
  const platform = useSyncExternalStore(noSubscription, readPlatform, () => "none" as Platform);
  const [dismissed, setDismissed] = useState(false);
  const [installEvent, setInstallEvent] = useState<InstallPromptEvent | null>(null);

  useEffect(() => {
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as InstallPromptEvent);
    };
    const onInstalled = () => setDismissed(true);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (platform === "none" || dismissed) return null;

  const close = () => {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISSED_KEY, "1");
    } catch {
      // Storage blocked: the hint simply comes back next visit.
    }
  };

  const install = async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    const { outcome } = await installEvent.userChoice;
    if (outcome === "accepted") close();
  };

  const [before, after] = t.ios.split("{share}");

  return (
    <div role="dialog" aria-label={t.title} className="fixed inset-x-0 bottom-0 z-40 safe-x safe-bottom">
      <div className="m-3 flex items-start gap-3 rounded-2xl border border-sand-200 bg-white p-4 shadow-xl">
        <Image src="/icons/icon-192.png" alt="" width={44} height={44} className="shrink-0 rounded-xl" />
        <div className="min-w-0 flex-1 text-sm">
          <p className="font-semibold text-ink">{t.title}</p>
          <p className="mt-1 leading-relaxed text-ink-soft">
            {platform === "ios" ? (
              <>
                {before}
                <ShareIcon />
                {after}
              </>
            ) : installEvent ? (
              t.text
            ) : (
              t.android
            )}
          </p>
          {installEvent ? (
            <button
              type="button"
              onClick={install}
              className="mt-3 rounded-xl bg-azur-700 px-4 py-2 font-semibold text-white hover:bg-azur-800"
            >
              {t.button}
            </button>
          ) : null}
        </div>
        <button
          type="button"
          onClick={close}
          aria-label={t.close}
          className="-me-1 -mt-1 grid size-8 shrink-0 place-items-center rounded-full text-muted hover:bg-sand-100 hover:text-ink"
        >
          <svg viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M5 5l10 10M15 5L5 15" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// The iOS Share glyph (a box with an arrow), so the instruction matches what people see in Safari.
function ShareIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      className="mx-0.5 inline size-4 -translate-y-px align-middle text-azur-600"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden="true"
    >
      <path d="M10 2.5v10M6.5 6 10 2.5 13.5 6M6 9H4.5v8.5h11V9H14" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
