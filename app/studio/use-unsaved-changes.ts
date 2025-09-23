"use client";

import { useEffect } from "react";

export function useUnsavedChanges(active: boolean) {
  useEffect(() => {
    if (!active) {
      return;
    }

    const beforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "You have unsaved changes. Are you sure you want to leave?";
      return event.returnValue;
    };

    const handlePopState = (event: PopStateEvent) => {
      if (window.confirm("You have unsaved changes. Do you want to discard them?")) {
        return;
      }
      event.preventDefault();
      window.history.pushState(null, "", window.location.href);
    };

    window.addEventListener("beforeunload", beforeUnload);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [active]);
}
