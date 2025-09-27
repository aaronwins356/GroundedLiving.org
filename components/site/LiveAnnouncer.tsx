"use client";

import { useEffect, useState } from "react";

import { ANNOUNCE_EVENT_NAME, type AnnounceEventDetail } from "@/lib/a11y/announcer";

type ActiveMessage = {
  message: string;
  politeness: AnnounceEventDetail["politeness"];
};

const CLEAR_TIMEOUT = 4000;

export function LiveAnnouncer() {
  const [active, setActive] = useState<ActiveMessage>({ message: "", politeness: "polite" });

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<AnnounceEventDetail>).detail;
      if (!detail?.message) {
        return;
      }
      setActive({ message: detail.message, politeness: detail.politeness ?? "polite" });
    };

    document.addEventListener(ANNOUNCE_EVENT_NAME, handler as EventListener);
    return () => document.removeEventListener(ANNOUNCE_EVENT_NAME, handler as EventListener);
  }, []);

  useEffect(() => {
    if (!active.message) {
      return undefined;
    }
    const timeout = window.setTimeout(() => {
      setActive((current) => ({ ...current, message: "" }));
    }, CLEAR_TIMEOUT);

    return () => window.clearTimeout(timeout);
  }, [active.message]);

  return (
    <>
      <div className="sr-only" aria-live="polite" aria-atomic role="status">
        {active.politeness === "polite" ? active.message : ""}
      </div>
      <div className="sr-only" aria-live="assertive" aria-atomic role="alert">
        {active.politeness === "assertive" ? active.message : ""}
      </div>
    </>
  );
}
