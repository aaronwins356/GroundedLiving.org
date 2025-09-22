import type { ReactNode } from "react";

type SocialShareButtonsProps = {
  title: string;
  url: string;
};

/**
 * Hard-code the core share networks so editors get copy/paste friendly buttons without
 * adding a heavyweight social sharing dependency.
 */
const shareTargets = [
  {
    name: "Pinterest",
    href: (title: string, url: string) =>
      `https://pinterest.com/pin/create/button/?url=${url}&description=${title}`,
    icon: (
      <svg aria-hidden className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.3 2c-5.3 0-9.3 3.9-9.3 8.9 0 3.6 2.2 6.6 5.4 7.8-.1-.7-.1-1.9 0-2.7l1.6-6.8s-.4-.8-.4-2c0-1.9 1.1-3.3 2.4-3.3 1.1 0 1.6.8 1.6 1.8 0 1.1-.7 2.7-1.1 4.1-.3 1.2.6 2.2 1.7 2.2 2 0 3.5-2.1 3.5-5.1 0-2.6-1.9-4.4-4.7-4.4-3.2 0-5.1 2.4-5.1 4.9 0 1 .4 2 .9 2.5.1.1.1.1.1-.1l.3-1.2c.1-.4 0-.6-.2-.9-.3-.4-.5-.9-.5-1.6 0-2 1.5-3.8 4-3.8 2.2 0 3.7 1.4 3.7 3.5 0 2.4-1.2 4.2-2.8 4.2-.9 0-1.6-.7-1.4-1.6.3-1.1.8-2.3 1.1-3.5.2-.8-.1-1.6-.9-1.6-.7 0-1.3.7-1.3 1.6 0 .6.2 1 .2 1.3l-1.1 4.6c-.3 1.2-.1 2.8-.1 3.8 0 .3.2.4.4.3 2-.8 3.6-2.2 4.5-4.2.8-1.5 1-3.2 1-4.9 0-5-3.8-8.6-8.5-8.6" />
      </svg>
    ),
  },
  {
    name: "X",
    href: (title: string, url: string) => `https://x.com/intent/tweet?text=${title}&url=${url}`,
    icon: (
      <svg aria-hidden className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M4 3l7.4 9.6L4.4 21h2.6l5.6-6.4L17.8 21H20l-7.6-9.9L19.2 3h-2.6l-5 5.6L6.2 3H4z" />
      </svg>
    ),
  },
  {
    name: "Facebook",
    href: (_title: string, url: string) => `https://www.facebook.com/sharer/sharer.php?u=${url}`,
    icon: (
      <svg aria-hidden className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M13 9h3V6h-3c-2.2 0-4 1.8-4 4v2H7v3h2v6h3v-6h3l1-3h-4v-1c0-.6.4-1 1-1z" />
      </svg>
    ),
  },
  {
    name: "Email",
    href: (title: string, url: string) => `mailto:?subject=${title}&body=${url}`,
    icon: (
      <svg aria-hidden className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M4 6c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2H4zm0 2l8 4.9L20 8v-.2L12 13 4 7.8V8z" />
      </svg>
    ),
  },
] satisfies Array<{
  name: string;
  href: (title: string, url: string) => string;
  icon: ReactNode;
}>;

export function SocialShareButtons({ title, url }: SocialShareButtonsProps) {
  const encodedTitle = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(url);

  return (
    <section className="flex flex-wrap items-center justify-between gap-4 rounded-[2rem] border border-brand-100 bg-white/80 p-6 shadow-soft-lg">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-brand-500">Share this story</p>
        <p className="mt-2 text-sm text-accent-soft">Inspire a friend with gentle rituals and grounded encouragement.</p>
      </div>
      <div className="flex items-center gap-2">
        {shareTargets.map((target) => (
          <a
            key={target.name}
            href={target.href(encodedTitle, encodedUrl)}
            aria-label={`Share on ${target.name}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-full border border-brand-200 bg-white/90 p-3 text-brand-700 transition hover:-translate-y-0.5 hover:border-brand-400 hover:text-brand-800"
          >
            {target.icon}
          </a>
        ))}
      </div>
    </section>
  );
}
