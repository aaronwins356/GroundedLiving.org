import type { Rule } from "sanity";
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
      validation: (rule: Rule) => rule.required().min(4).error("Posts need a descriptive title."),
    }),
    defineField({
      name: "slug",
      type: "slug",
      title: "Slug",
      description: "This determines the URL path (e.g. /blog/my-post).",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (rule: Rule) => rule.required(),
    }),
    defineField({
      name: "publishedAt",
      type: "datetime",
      title: "Publish Date",
      validation: (rule: Rule) => rule.required(),
    }),
    defineField({
      name: "excerpt",
      type: "text",
      title: "Excerpt",
      description: "Short description used on list pages and metadata.",
      rows: 3,
    }),
    defineField({
      name: "category",
      type: "string",
      title: "Category",
      description: "Used for filtering on the blog index.",
    }),
    defineField({
      name: "tags",
      type: "array",
      title: "Tags",
      of: [{ type: "string" }],
      options: {
        layout: "tags",
      },
    }),
    defineField({
      name: "coverImage",
      title: "Cover Image",
      type: "image",
      options: {
        hotspot: true,
      },
      fields: [
        defineField({
          name: "alt",
          type: "string",
          title: "Alternative text",
          description: "Important for accessibility and SEO.",
        }),
      ],
    }),
    defineField({
      name: "content",
      title: "Content",
      type: "array",
      of: [
        { type: "block" },
        {
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({
              name: "alt",
              type: "string",
              title: "Alternative text",
            }),
          ],
        },
      ],
      validation: (rule: Rule) => rule.required(),
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "publishedAt",
      media: "coverImage",
    },
    prepare(selection: { title?: string; subtitle?: string; media?: unknown }) {
      const { title, subtitle, media } = selection;
      return {
        title,
        subtitle: subtitle ? new Date(subtitle).toLocaleDateString() : undefined,
        media,
      };
    },
  },
  orderings: [
    {
      title: "Publish date, newest first",
      name: "publishDateDesc",
      by: [
        { field: "publishedAt", direction: "desc" },
        { field: "_createdAt", direction: "desc" },
      ],
    },
    {
      title: "Publish date, oldest first",
      name: "publishDateAsc",
      by: [
        { field: "publishedAt", direction: "asc" },
        { field: "_createdAt", direction: "asc" },
      ],
    },
  ],
});
