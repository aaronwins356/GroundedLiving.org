"use client";

import { useState } from "react";

import { Link2, Share2, Send } from "lucide-react";

interface SocialShareButtonsProps {
  url: string;
  title: string;
}

export function SocialShareButtons({ url, title }: SocialShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const shareData = { title, url };

  const handleWebShare = async () => {
    if (typeof navigator === "undefined") {
      return;
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.warn("Share cancelled", error);
      }
      return;
    }

    await copyLink();
  };

  const copyLink = async () => {
    if (typeof navigator === "undefined" || !navigator.clipboard) {
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      if (typeof window !== "undefined") {
        window.setTimeout(() => setCopied(false), 1500);
      }
    } catch (error) {
      console.warn("Unable to copy link", error);
    }
  };

  const openWindow = (shareUrl: string) => {
    if (typeof window === "undefined") {
      return;
    }
    const width = 600;
    const height = 540;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    window.open(
      shareUrl,
      "share-window",
      `width=${width},height=${height},left=${left},top=${top},noopener,noreferrer`,
    );
  };

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const shareTo = (network: "pinterest" | "facebook" | "x") => {
    switch (network) {
      case "pinterest":
        openWindow(`https://www.pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedTitle}`);
        break;
      case "facebook":
        openWindow(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`);
        break;
      case "x":
        openWindow(`https://x.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`);
        break;
      default:
        break;
    }
  };

  return (
    <div className="post-share" aria-label="Share this article">
      <div className="post-share__heading">
        <Share2 aria-hidden className="post-share__icon" />
        <span>Share this ritual</span>
      </div>
      <div className="post-share__actions">
        <button
          type="button"
          className="post-share__button"
          onClick={handleWebShare}
          aria-label="Share via your favorite app"
        >
          <Send aria-hidden />
          <span>Quick share</span>
        </button>
        <button type="button" className="post-share__button" onClick={() => shareTo("pinterest")} aria-label="Share on Pinterest">
          <span aria-hidden>P</span>
          <span>Pinterest</span>
        </button>
        <button type="button" className="post-share__button" onClick={() => shareTo("facebook")} aria-label="Share on Facebook">
          <span aria-hidden>f</span>
          <span>Facebook</span>
        </button>
        <button type="button" className="post-share__button" onClick={() => shareTo("x")} aria-label="Share on X">
          <span aria-hidden>X</span>
          <span>Post</span>
        </button>
        <button type="button" className="post-share__button" onClick={copyLink} aria-label="Copy article link">
          <Link2 aria-hidden />
          <span>{copied ? "Link copied" : "Copy link"}</span>
        </button>
      </div>
    </div>
  );
}
