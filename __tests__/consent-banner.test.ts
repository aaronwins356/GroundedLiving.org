import assert from "node:assert/strict";
import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { ConsentBanner } from "../components/consent/ConsentBanner";
import { ConsentProvider, __resetConsentMocks, useConsent } from "../context/ConsentContext";
import { track } from "../lib/analytics";

type TestCase = { name: string; fn: () => Promise<void> | void };

class CookieDocument {
  private store = new Map<string, string>();

  get cookie(): string {
    return Array.from(this.store.entries())
      .map(([key, value]) => `${key}=${value}`)
      .join("; ");
  }

  set cookie(value: string) {
    const [pair] = value.split(";");
    if (!pair) return;
    const [rawKey, rawValue] = pair.split("=");
    if (!rawKey) return;
    const key = rawKey.trim();
    if (!rawValue || /max-age=0/i.test(value)) {
      this.store.delete(key);
      return;
    }
    this.store.set(key, rawValue.trim());
  }
}

function createMemoryStorage(): Storage {
  const map = new Map<string, string>();
  return {
    get length() {
      return map.size;
    },
    clear() {
      map.clear();
    },
    getItem(key) {
      return map.has(key) ? map.get(key)! : null;
    },
    key(index) {
      return Array.from(map.keys())[index] ?? null;
    },
    removeItem(key) {
      map.delete(key);
    },
    setItem(key, value) {
      map.set(key, value);
    },
  } satisfies Storage;
}

let cookieDocument: CookieDocument | null = null;
let storage: Storage | null = null;

function setupWindow() {
  const win = globalThis as unknown as Window & {
    __glConsent?: {
      analytics: boolean;
      ads: boolean;
      necessary: true;
      version: string;
    };
    dataLayer?: unknown[];
  };

  cookieDocument = new CookieDocument();
  storage = createMemoryStorage();

  Object.defineProperty(globalThis, "window", {
    value: win,
    configurable: true,
  });

  Object.defineProperty(globalThis, "localStorage", {
    value: storage,
    configurable: true,
  });

  Object.defineProperty(globalThis, "document", {
    value: cookieDocument as unknown as Document,
    configurable: true,
  });

  __resetConsentMocks();
}

function teardownWindow() {
  Reflect.deleteProperty(globalThis as Record<string, unknown>, "window");
  Reflect.deleteProperty(globalThis as Record<string, unknown>, "localStorage");
  Reflect.deleteProperty(globalThis as Record<string, unknown>, "document");
  cookieDocument = null;
  storage = null;
  __resetConsentMocks();
}

function renderWithConsent(child: ReactNode) {
  setupWindow();
  const markup = renderToStaticMarkup(createElement(ConsentProvider, null, child));
  teardownWindow();
  return markup;
}

function withConsentContext(callback: (context: ReturnType<typeof useConsent>) => void) {
  setupWindow();
  let captured: ReturnType<typeof useConsent> | null = null;

  function Capture() {
    captured = useConsent();
    return null;
  }

  renderToStaticMarkup(createElement(ConsentProvider, null, createElement(Capture)));

  if (!captured) {
    throw new Error("Consent context not initialized");
  }

  callback(captured);
  teardownWindow();
}

export const consentBannerTests: TestCase[] = [
  {
    name: "renders the consent banner copy",
    fn() {
      const markup = renderWithConsent(createElement(ConsentBanner));
      assert.ok(markup.includes("We use cookies"));
    },
  },
  {
    name: "accept all grants analytics consent",
    fn() {
      withConsentContext((context) => {
        context.acceptAll();
        const win = globalThis as unknown as Window & { __glConsent?: { analytics: boolean } };
        assert.equal(win.__glConsent?.analytics, true);
        const stored = storage?.getItem("gl_consent");
        assert.ok(stored && stored.includes("analytics:1"));
        assert.ok(cookieDocument?.cookie.includes("analytics:1"));
      });
    },
  },
  {
    name: "declining analytics prevents tracking",
    fn() {
      withConsentContext((context) => {
        context.declineAnalytics();
        const win = globalThis as unknown as Window & {
          __glConsent?: { analytics: boolean };
          dataLayer?: unknown[];
        };
        win.dataLayer = [];
        track("lead_magnet_downloaded", { test: true });
        assert.equal(win.__glConsent?.analytics, false);
        assert.deepEqual(win.dataLayer, []);
      });
    },
  },
];
