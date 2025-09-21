import type React from "react";
import type { ArrayRule, DatetimeRule, PreviewValue, SlugRule, StringRule } from "sanity";
import { defineField, defineType } from "sanity";

export default defineType({
  name: "post",
  title: "Post",
  type: "document",
  fields: [
    defineField({
      name: "title",
      type: "string",
      title: "Title",
      validation: (rule: StringRule) =>
        rule.required().min(4).error("Posts need a descriptive title."),
    }),
    defineField({
      name: "slug",
      type: "slug",
      title: "Slug",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (rule: SlugRule) => rule.required(),
    }),
    defineField({
      name: "publishedAt",
      type: "datetime",
      title: "Published At",
      validation: (rule: DatetimeRule) => rule.required(),
    }),
    defineField({
      name: "coverImage",
      type: "image",
      title: "Cover Image",
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: "content",
      type: "array",
      title: "Content",
      of: [{ type: "block" }],
      validation: (rule: ArrayRule<unknown[]>) => rule.required(),
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "publishedAt",
      media: "coverImage",
    },
    prepare(selection: { title?: string; subtitle?: string; media?: unknown }): PreviewValue {
      const { title, subtitle, media } = selection;
      return {
        title,
        subtitle,
        // Sanity expects preview media to be a React node, so we cast the configured asset accordingly.
        media: media as React.ReactNode,
      };
    },
  },
});
