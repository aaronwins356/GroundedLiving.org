"use client";

import { useEffect, useMemo } from "react";

import { track } from "@/lib/analytics";

type TrackEventProps = {
  event: string;
  params?: Record<string, unknown>;
};

/**
 * Triggers a GA4 event once the component mounts. We memoize the payload so repeated renders
 * from parent server components do not double-fire the event.
 */
export function TrackEvent({ event, params }: TrackEventProps) {
  const serialized = useMemo(() => JSON.stringify(params ?? {}), [params]);

  useEffect(() => {
    if (!event) {
      return;
    }

    try {
      const payload = serialized ? (JSON.parse(serialized) as Record<string, unknown>) : {};
      track(event, payload);
    } catch (error) {
      console.warn("Failed to serialize analytics payload", error);
    }
    // We intentionally only react to the serialized payload; the memoization keeps it stable.
  }, [event, serialized]);

  return null;
}
