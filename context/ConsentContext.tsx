"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const CONSENT_COOKIE = "gl_consent";
const CONSENT_VERSION = "v1";
const CONSENT_STORAGE_KEY = "gl_consent";
const CONSENT_MAX_AGE_SECONDS = 60 * 60 * 24 * 180; // 180 days

interface ConsentPreferences {
  analytics: boolean;
  ads: boolean;
}

interface ConsentContextValue {
  preferences: ConsentPreferences;
  status: "loading" | "ready";
  hasStoredValue: boolean;
  acceptAll: () => void;
  declineAnalytics: () => void;
  save: (preferences: ConsentPreferences) => void;
  reset: () => void;
}

type StoredConsent = `${typeof CONSENT_VERSION}.analytics:${0 | 1},ads:${0 | 1}`;

interface WindowWithConsent extends Window {
  __glConsent?: {
    analytics: boolean;
    ads: boolean;
    necessary: true;
    version: string;
  };
}

const defaultPreferences: ConsentPreferences = { analytics: false, ads: false };

const ConsentContext = createContext<ConsentContextValue | undefined>(undefined);

function encodeConsent(preferences: ConsentPreferences): StoredConsent {
  const analytics = preferences.analytics ? 1 : 0;
  const ads = preferences.ads ? 1 : 0;
  return `${CONSENT_VERSION}.analytics:${analytics},ads:${ads}` as StoredConsent;
}

function parseStoredConsent(value: string | null | undefined): ConsentPreferences | null {
  if (!value) {
    return null;
  }

  const [version, payload] = value.split(".");
  if (version !== CONSENT_VERSION || !payload) {
    return null;
  }

  const entries = payload.split(",");
  const map = new Map<string, string>();
  entries.forEach((entry) => {
    const [key, raw] = entry.split(":");
    if (key && raw) {
      map.set(key, raw);
    }
  });

  const analytics = map.get("analytics") === "1";
  const ads = map.get("ads") === "1";
  return { analytics, ads } satisfies ConsentPreferences;
}

function readCookieConsent(): ConsentPreferences | null {
  if (typeof document === "undefined") {
    return null;
  }

  const cookies = document.cookie?.split(";") ?? [];
  for (const cookie of cookies) {
    const [rawKey, ...rawValue] = cookie.trim().split("=");
    if (rawKey === CONSENT_COOKIE) {
      const parsed = parseStoredConsent(rawValue.join("="));
      if (parsed) {
        return parsed;
      }
    }
  }

  return null;
}

function readLocalStorageConsent(): ConsentPreferences | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const stored = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    return parseStoredConsent(stored ?? undefined);
  } catch (error) {
    console.warn("Failed to read consent from localStorage", error);
    return null;
  }
}

function persistConsent(preferences: ConsentPreferences) {
  if (typeof document !== "undefined") {
    const value = encodeConsent(preferences);
    document.cookie = `${CONSENT_COOKIE}=${value}; Path=/; Max-Age=${CONSENT_MAX_AGE_SECONDS}; SameSite=Lax`;
  }

  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(CONSENT_STORAGE_KEY, encodeConsent(preferences));
    } catch (error) {
      console.warn("Failed to persist consent to localStorage", error);
    }
  }

  updateWindowConsent(preferences);
}

function updateWindowConsent(preferences: ConsentPreferences) {
  if (typeof window === "undefined") {
    return;
  }

  const win = window as WindowWithConsent;
  win.__glConsent = {
    analytics: preferences.analytics,
    ads: preferences.ads,
    necessary: true,
    version: CONSENT_VERSION,
  };
}

function clearStoredConsent() {
  if (typeof document !== "undefined") {
    document.cookie = `${CONSENT_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
  }

  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(CONSENT_STORAGE_KEY);
    } catch (error) {
      console.warn("Failed to clear consent from localStorage", error);
    }
  }

  updateWindowConsent(defaultPreferences);
}

function getInitialConsent(): { preferences: ConsentPreferences; hasStored: boolean } {
  if (typeof document === "undefined") {
    return { preferences: defaultPreferences, hasStored: false };
  }

  const stored = readCookieConsent() ?? readLocalStorageConsent();
  if (stored) {
    updateWindowConsent(stored);
    return { preferences: stored, hasStored: true };
  }

  updateWindowConsent(defaultPreferences);
  return { preferences: defaultPreferences, hasStored: false };
}

export function ConsentProvider({ children }: { children: ReactNode }) {
  const initial = getInitialConsent();
  const [preferences, setPreferences] = useState<ConsentPreferences>(initial.preferences);
  const [status, setStatus] = useState<"loading" | "ready">(
    typeof window === "undefined" ? "loading" : "ready",
  );
  const [hasStoredValue, setHasStoredValue] = useState(initial.hasStored);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setStatus("ready");
    }
  }, []);

  const save = useCallback((next: ConsentPreferences) => {
    setPreferences(next);
    persistConsent(next);
    setHasStoredValue(true);
  }, []);

  const acceptAll = useCallback(() => {
    save({ analytics: true, ads: true });
  }, [save]);

  const declineAnalytics = useCallback(() => {
    save({ analytics: false, ads: false });
  }, [save]);

  const reset = useCallback(() => {
    clearStoredConsent();
    setPreferences(defaultPreferences);
    setHasStoredValue(false);
  }, []);

  const value = useMemo<ConsentContextValue>(
    () => ({
      preferences,
      status,
      hasStoredValue,
      acceptAll,
      declineAnalytics,
      save,
      reset,
    }),
    [acceptAll, declineAnalytics, hasStoredValue, preferences, save, status, reset],
  );

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
}

export function useConsent(): ConsentContextValue {
  const context = useContext(ConsentContext);
  if (!context) {
    throw new Error("useConsent must be used within a ConsentProvider");
  }

  return context;
}

export function __resetConsentMocks() {
  clearStoredConsent();
}
