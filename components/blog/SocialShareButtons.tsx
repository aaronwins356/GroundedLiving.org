import type { ReactNode } from "react";

type SocialShareButtonsProps = {
  title: string;
  url: string;
};

type ShareTarget = {
  name: string;
  href: (title: string, url: string) => string;
  icon: ReactNode;
};

const shareTargets: ShareTarget[] = [
  {
    name: "Pinterest",
    href: (title, url) => `https://pinterest.com/pin/create/button/?url=${url}&description=${title}`,
    icon: (
      <svg aria-hidden viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M12.3 2c-5.3 0-9.3 3.9-9.3 8.9 0 3.6 2.2 6.6 5.4 7.8-.1-.7-.1-1.9 0-2.7l1.6-6.8s-.4-.8-.4-2c0-1.9 1.1-3.3 2.4-3.3 1.1 0 1.6.8 1.6 1.8 0 1.1-.7 2.7-1.1 4.1-.3 1.2.6 2.2 1.7 2.2 2 0 3.5-2.1 3.5-5.1 0-2.6-1.9-4.4-4.7-4.4-3.2 0-5.1 2.4-5.1 4.9 0 1 .4 2 .9 2.5.1.1.1.1.1-.1l.3-1.2c.1-.4 0-.6-.2-.9-.3-.4-.5-.9-.5-1.6 0-2 1.5-3.8 4-3.8 2.2 0 3.7 1.4 3.7 3.5 0 2.4-1.2 4.2-2.8 4.2-.9 0-1.6-.7-1.4-1.6.3-1.1.8-2.3 1.1-3.5.2-.8-.1-1.6-.9-1.6-.7 0-1.3.7-1.3 1.6 0 .6.2 1 .2 1.3l-1.1 4.6c-.3 1.2-.1 2.8-.1 3.8 0 .3.2.4.4.3 2-.8 3.6-2.2 4.5-4.2.8-1.5 1-3.2 1-4.9 0-5-3.8-8.6-8.5-8.6" />
      </svg>
    ),
  },
  {
    name: "X",
    href: (title, url) => `https://x.com/intent/tweet?text=${title}&url=${url}`,
    icon: (
      <svg aria-hidden viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M4 3l7.4 9.6L4.4 21h2.6l5.6-6.4L17.8 21H20l-7.6-9.9L19.2 3h-2.6l-5 5.6L6.2 3H4z" />
      </svg>
    ),
  },
  {
    name: "Facebook",
    href: (_title, url) => `https://www.facebook.com/sharer/sharer.php?u=${url}`,
    icon: (
      <svg aria-hidden viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M13 9h3V6h-3c-2.2 0-4 1.8-4 4v2H7v3h2v6h3v-6h3l1-3h-4v-1c0-.6.4-1 1-1z" />
      </svg>
    ),
  },
  {
    name: "Email",
    href: (title, url) => `mailto:?subject=${title}&body=${url}`,
    icon: (
      <svg aria-hidden viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M4 6c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2H4zm0 2l8 4.9L20 8v-.2L12 13 4 7.8V8z" />
      </svg>
    ),
  },
];

export function SocialShareButtons({ title, url }: SocialShareButtonsProps) {
  const encodedTitle = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(url);

  return (
    <section className="rounded-3xl bg-white/90 p-8 shadow-[0_30px_80px_rgba(152,172,160,0.15)] ring-1 ring-emerald-100/80">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-400">Share this story</span>
          <p className="text-lg font-medium text-emerald-950">
            Sprinkle gentle inspiration across your circles.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {shareTargets.map((target) => (
            <a
              key={target.name}
              href={target.href(encodedTitle, encodedUrl)}
              aria-label={`Share on ${target.name}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-12 w-12 items-center justify-center rounded-full border border-emerald-200/70 bg-emerald-50/60 text-emerald-700 transition hover:border-emerald-400 hover:bg-emerald-100"
            >
              {target.icon}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
