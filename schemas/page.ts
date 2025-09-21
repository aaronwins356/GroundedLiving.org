import { defineArrayMember, defineField, defineType } from "sanity";

export default defineType({
  name: "page",
  title: "Page",
  type: "document",
  groups: [
    { name: "settings", title: "Settings" },
    { name: "content", title: "Content" },
  ],
  fields: [
    defineField({
      name: "title",
      type: "string",
      title: "Title",
      description: "Use clear titles like About, Contact, or Services.",
      validation: (rule) => rule.required().min(2),
      group: "settings",
    }),
    defineField({
      name: "slug",
      type: "slug",
      title: "URL slug",
      description: "This becomes the web address (example: about → /about).",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (rule) => rule.required(),
      group: "settings",
    }),
    defineField({
      name: "coverImage",
      type: "image",
      title: "Hero image",
      description: "Optional banner photo shown at the top of the page.",
      options: {
        hotspot: true,
      },
      fields: [
        defineField({
          name: "alt",
          type: "string",
          title: "Alt text",
          description: "Describe the image in one sentence for accessibility.",
          validation: (rule) => rule.max(120),
        }),
      ],
      group: "content",
    }),
    defineField({
      name: "content",
      type: "array",
      title: "Page content",
      description: "Add copy, images, and headings to tell your story.",
      of: [
        defineArrayMember({ type: "block" }),
        defineArrayMember({
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({
              name: "alt",
              type: "string",
              title: "Alt text",
              description: "Explain what’s shown in the image.",
              validation: (rule) => rule.max(120),
            }),
          ],
        }),
      ],
      validation: (rule) => rule.required().min(1),
      group: "content",
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "slug.current",
      media: "coverImage",
    },
  },
});
