export type PolitenessSetting = "polite" | "assertive";

export interface AnnounceEventDetail {
  message: string;
  politeness: PolitenessSetting;
}

export const ANNOUNCE_EVENT_NAME = "gl:announce";

export function announce(message: string, politeness: PolitenessSetting = "polite"): void {
  if (typeof document === "undefined") {
    return;
  }

  const event = new CustomEvent<AnnounceEventDetail>(ANNOUNCE_EVENT_NAME, {
    detail: { message, politeness },
  });

  document.dispatchEvent(event);
}
