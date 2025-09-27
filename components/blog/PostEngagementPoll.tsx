"use client";

import { useEffect, useState } from "react";

import { MessageCircle } from "lucide-react";

interface PostEngagementPollProps {
  slug: string;
}

const POLL_KEY_PREFIX = "gl:post-poll:";

const POLL_OPTIONS: { value: string; label: string }[] = [
  { value: "try", label: "I’m trying this ritual this week" },
  { value: "adapt", label: "I’ll adapt it to my routine" },
  { value: "share", label: "Sending to a friend who needs it" },
];

export function PostEngagementPoll({ slug }: PostEngagementPollProps) {
  const storageKey = `${POLL_KEY_PREFIX}${slug}`;
  const [selection, setSelection] = useState<string | null>(null);
  const [message, setMessage] = useState("Help us tailor future guides—how will you use this piece?");

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const stored = window.localStorage.getItem(storageKey);
      if (stored) {
        setSelection(stored);
        setMessage("Thanks for letting us know! Your response shapes future rituals.");
      }
    } catch (error) {
      console.warn("Unable to read poll selection", error);
    }
  }, [storageKey]);

  const handleSelect = (value: string) => {
    setSelection(value);
    setMessage("Thanks for letting us know! Your response shapes future rituals.");

    if (typeof window === "undefined") {
      return;
    }

    try {
      window.localStorage.setItem(storageKey, value);
    } catch (error) {
      console.warn("Unable to persist poll selection", error);
    }
  };

  return (
    <section className="post-poll" aria-labelledby="post-poll-title">
      <div className="post-poll__header">
        <MessageCircle aria-hidden className="post-poll__icon" />
        <div>
          <h3 id="post-poll-title">Join the conversation</h3>
          <p aria-live="polite">{message}</p>
        </div>
      </div>
      <div className="post-poll__options">
        {POLL_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`post-poll__option${selection === option.value ? " post-poll__option--selected" : ""}`}
            onClick={() => handleSelect(option.value)}
            aria-pressed={selection === option.value}
          >
            {option.label}
          </button>
        ))}
      </div>
    </section>
  );
}
