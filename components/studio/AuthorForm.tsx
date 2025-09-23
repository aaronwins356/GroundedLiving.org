import React, { useEffect, useMemo, useState } from "react";

import { StudioAuthor } from "./types";

interface AuthorFormProps {
  initialAuthor?: StudioAuthor | null;
  onSubmit: (payload: AuthorFormState) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export interface AuthorFormState {
  name: string;
  bio: string;
}

const createStateFromAuthor = (author?: StudioAuthor | null): AuthorFormState => ({
  name: author?.name ?? "",
  bio: author?.bio ?? "",
});

export const AuthorForm = ({ initialAuthor, onSubmit, onCancel, isSubmitting }: AuthorFormProps) => {
  const [state, setState] = useState<AuthorFormState>(() => createStateFromAuthor(initialAuthor));

  useEffect(() => {
    setState(createStateFromAuthor(initialAuthor));
  }, [initialAuthor]);

  const canSubmit = useMemo(() => state.name.trim(), [state.name]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setState((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit || isSubmitting) {
      return;
    }

    await onSubmit(state);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <label className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-slate-200">Name</span>
        <input
          required
          name="name"
          value={state.name}
          onChange={handleChange}
          placeholder="Wilder Kinsey"
          className="rounded-2xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/40"
        />
      </label>
      <label className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-slate-200">Bio</span>
        <textarea
          name="bio"
          value={state.bio}
          onChange={handleChange}
          rows={6}
          placeholder="Share the story, credentials, and voice of the author"
          className="rounded-2xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/40"
        />
      </label>
      <div className="mt-2 flex flex-col gap-3 md:flex-row md:justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center justify-center rounded-2xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:bg-slate-800/60"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!canSubmit || isSubmitting}
          className="inline-flex items-center justify-center rounded-2xl bg-emerald-500 px-5 py-2 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Saving..." : initialAuthor ? "Update author" : "Create author"}
        </button>
      </div>
    </form>
  );
};
