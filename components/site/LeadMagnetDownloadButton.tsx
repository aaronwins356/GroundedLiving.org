"use client";

import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils/cn";

interface LeadMagnetDownloadButtonProps {
  href: string;
  magnetKey?: string;
  label?: string;
  className?: string;
}

export function LeadMagnetDownloadButton({
  href,
  magnetKey,
  label = "Download",
  className,
}: LeadMagnetDownloadButtonProps) {
  const handleClick = () => {
    track("lead_magnet_downloaded", { magnet: magnetKey ?? href });
  };

  return (
    <a
      href={href}
      className={cn("btn btn--primary btn--md", className)}
      onClick={handleClick}
      download
    >
      {label}
    </a>
  );
}
