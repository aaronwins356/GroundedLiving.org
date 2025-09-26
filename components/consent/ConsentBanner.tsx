"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { useConsent } from "@/context/ConsentContext";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

interface DraftPreferences {
  analytics: boolean;
  ads: boolean;
}

export function ConsentBanner() {
  const { status, hasStoredValue, preferences, acceptAll, declineAnalytics, save } = useConsent();
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [draft, setDraft] = useState<DraftPreferences>(preferences);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    setDraft(preferences);
  }, [preferences.analytics, preferences.ads]);

  const shouldRender = status === "ready" && (!hasStoredValue || (hasInteracted && isCustomizing));
  if (!shouldRender) {
    return null;
  }

  const handleAcceptAll = () => {
    acceptAll();
    setHasInteracted(true);
    setIsCustomizing(false);
  };

  const handleDecline = () => {
    declineAnalytics();
    setHasInteracted(true);
    setIsCustomizing(false);
  };

  const handleSave = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    save(draft);
    setHasInteracted(true);
    setIsCustomizing(false);
  };

  return (
    <div className={cn("consent-banner", isCustomizing && "consent-banner--expanded")} role="dialog" aria-live="polite">
      <div className="consent-banner__content">
        <div>
          <p className="consent-banner__message">
            We use cookies to keep necessary site features running and, with your permission, learn which stories resonate.
          </p>
          <p className="consent-banner__link">
            <Link href="/privacy">Privacy &amp; Cookies</Link>
          </p>
        </div>
        <div className="consent-banner__actions">
          <Button size="sm" type="button" onClick={handleAcceptAll}>
            Accept all
          </Button>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => {
              setIsCustomizing((value) => !value);
              setHasInteracted(true);
            }}
            aria-expanded={isCustomizing}
            aria-controls="consent-preferences"
          >
            Customize
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={handleDecline}>
            Decline analytics
          </Button>
        </div>
      </div>
      {isCustomizing ? (
        <form id="consent-preferences" className="consent-banner__preferences" onSubmit={handleSave}>
          <fieldset>
            <legend className="consent-banner__legend">Manage preferences</legend>
            <div className="consent-banner__option">
              <div>
                <span className="consent-banner__option-title">Necessary</span>
                <p className="consent-banner__option-description">Always on to keep the site secure.</p>
              </div>
              <span className="consent-banner__toggle" aria-live="polite">
                Required
              </span>
            </div>
            <div className="consent-banner__option">
              <label htmlFor="consent-analytics">
                <span className="consent-banner__option-title">Analytics</span>
                <p className="consent-banner__option-description">
                  Allow privacy-friendly GA4 tracking so we can improve the experience.
                </p>
              </label>
              <input
                id="consent-analytics"
                type="checkbox"
                checked={draft.analytics}
                onChange={(event) => setDraft((prev) => ({ ...prev, analytics: event.target.checked }))}
              />
            </div>
            <div className="consent-banner__option">
              <label htmlFor="consent-ads">
                <span className="consent-banner__option-title">Ads</span>
                <p className="consent-banner__option-description">Future sponsored placements and partnerships.</p>
              </label>
              <input
                id="consent-ads"
                type="checkbox"
                checked={draft.ads}
                onChange={(event) => setDraft((prev) => ({ ...prev, ads: event.target.checked }))}
              />
            </div>
          </fieldset>
          <div className="consent-banner__preferences-actions">
            <Button size="sm" type="submit">
              Save preferences
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setIsCustomizing(false)}>
              Cancel
            </Button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
