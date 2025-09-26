type AnalyticsParams = Record<string, unknown>;

type WindowWithAnalytics = Window &
  typeof globalThis & {
    __glConsent?: { analytics?: boolean };
    gtag?: (...args: unknown[]) => void;
    dataLayer?: Array<Record<string, unknown>>;
  };

function getAnalyticsWindow(): WindowWithAnalytics | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window as WindowWithAnalytics;
}

function isAnalyticsEnabled(): boolean {
  const analyticsWindow = getAnalyticsWindow();
  if (!analyticsWindow) {
    return false;
  }

  const consent = analyticsWindow.__glConsent;
  return Boolean(consent?.analytics);
}

export function track(event: string, params: AnalyticsParams = {}): void {
  const analyticsWindow = getAnalyticsWindow();
  if (!analyticsWindow || !isAnalyticsEnabled()) {
    return;
  }

  if (typeof analyticsWindow.gtag === "function") {
    analyticsWindow.gtag("event", event, params);
    return;
  }

  if (Array.isArray(analyticsWindow.dataLayer)) {
    analyticsWindow.dataLayer.push({ event, ...params });
  }
}

export function analyticsEnabled(): boolean {
  return isAnalyticsEnabled();
}
