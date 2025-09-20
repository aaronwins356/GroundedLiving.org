import { AnchorHTMLAttributes, DetailedHTMLProps, ReactNode } from "react";

type AnchorProps = DetailedHTMLProps<AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>;

type AffiliateLinkProps = AnchorProps & { children: ReactNode };

export function AffiliateLink({ children, className = "", ...props }: AffiliateLinkProps) {
  return (
    <a
      {...props}
      target="_blank"
      rel="sponsored noopener noreferrer"
      className={`font-medium text-primary underline decoration-primary/50 underline-offset-4 hover:text-primary-dark ${className}`.trim()}
    >
      {children}
    </a>
  );
}
