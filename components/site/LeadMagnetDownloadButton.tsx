"use client";

import { track } from "@/lib/analytics";
import { buttonClassNames } from "@/components/ui/Button";

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
    <a href={href} className={buttonClassNames({ className })} onClick={handleClick} download>
      {label}
    </a>
  );
}
