"use client";

import { useEffect, useMemo, useState } from "react";
import type { SanityDocument } from "sanity";

type PostPreviewPaneProps = {
  document: {
    displayed?: SanityDocument & { slug?: { current?: string } };
  };
};

function resolveBaseUrl() {
  if (typeof window !== "undefined") {
    return window.location.origin.replace(/\/studio$/, "");
  }
  return process.env.NEXT_PUBLIC_SITE_URL ?? "https://groundedlivingorg.vercel.app";
}

export function PostPreviewPane({ document }: PostPreviewPaneProps) {
  const [baseUrl, setBaseUrl] = useState(resolveBaseUrl);
  const slug = document.displayed?.slug?.current;

  useEffect(() => {
    setBaseUrl(resolveBaseUrl());
  }, []);

  const previewUrl = useMemo(() => {
    if (!slug) {
      return null;
    }
    return `${baseUrl}/blog/${slug}`;
  }, [baseUrl, slug]);

  if (!slug) {
    return (
      <div style={{ padding: "1.5rem" }}>
        <p style={{ fontSize: "0.95rem", color: "#5f6761", lineHeight: 1.6 }}>
          Add a slug to generate a live preview. Once saved, the post will appear below.
        </p>
      </div>
    );
  }

  return (
    <iframe
      title="Post preview"
      src={previewUrl ?? undefined}
      style={{ width: "100%", height: "100%", border: 0 }}
    />
  );
}
