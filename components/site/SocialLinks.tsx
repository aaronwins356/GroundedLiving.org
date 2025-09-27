"use client";

import Link from "next/link";
import { useMemo } from "react";

import { Instagram, Youtube, Mail } from "lucide-react";

import { cn } from "@/lib/utils/cn";

interface SocialLinksProps {
  className?: string;
  variant?: "compact" | "stacked";
  showLabels?: boolean;
}

interface SocialLinkItem {
  key: string;
  label: string;
  href: string;
  icon: typeof Instagram;
}

const DEFAULT_LINKS: SocialLinkItem[] = [
  {
    key: "instagram",
    label: "Instagram",
    href: "https://www.instagram.com/groundedlivingjournal",
    icon: Instagram,
  },
  {
    key: "youtube",
    label: "YouTube",
    href: "https://www.youtube.com/@groundedliving",
    icon: Youtube,
  },
  {
    key: "email",
    label: "Email",
    href: `mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "hello@groundedliving.org"}`,
    icon: Mail,
  },
];

function resolveSocialLinks(): SocialLinkItem[] {
  return DEFAULT_LINKS.map((item) => {
    const envKey = `NEXT_PUBLIC_SOCIAL_${item.key.toUpperCase()}` as keyof NodeJS.ProcessEnv;
    const envValue = process.env[envKey];
    if (typeof envValue === "string" && envValue.trim().length > 0) {
      return { ...item, href: envValue.trim() };
    }
    return item;
  });
}

export function SocialLinks({ className, variant = "compact", showLabels = variant === "stacked" }: SocialLinksProps) {
  const links = useMemo(() => resolveSocialLinks(), []);
  if (links.length === 0) {
    return null;
  }

  return (
    <ul className={cn("social-links", `social-links--${variant}`, className)}>
      {links.map(({ key, label, href, icon: Icon }) => (
        <li key={key} className="social-links__item">
          <Link
            href={href}
            className="social-links__link"
            aria-label={showLabels ? undefined : label}
            target={href.startsWith("mailto:") ? undefined : "_blank"}
            rel={href.startsWith("mailto:") ? undefined : "noreferrer noopener"}
          >
            <Icon aria-hidden className="social-links__icon" />
            {showLabels ? <span className="social-links__label">{label}</span> : null}
          </Link>
        </li>
      ))}
    </ul>
  );
}
