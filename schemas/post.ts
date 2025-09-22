import {
  defineArrayMember,
  defineField,
  defineType,
  type ArrayRule,
  type DatetimeRule,
  type SlugRule,
  type StringRule,
  type TextRule,
  type UrlRule,
} from "sanity";

export default defineType({
  name: "post",
  title: "Post",
  type: "document",
  groups: [
    { name: "settings", title: "Settings" },
    { name: "content", title: "Content" },
  ],
  initialValue: () => ({
    publishedAt: new Date().toISOString(),
  }),
  fields: [
    defineField({
      name: "title",
      type: "string",
      title: "Title",
      description: "Give the article a descriptive, welcoming headline.",
      validation: (rule: StringRule) => rule.required().min(4),
      group: "settings",
    }),
    defineField({
      name: "slug",
      type: "slug",
      title: "URL slug",
      description: "Click Generate to create the link from the title.",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (rule: SlugRule) => rule.required(),
      group: "settings",
    }),
    defineField({
      name: "publishedAt",
      type: "datetime",
      title: "Publish date",
      description: "Choose when the story goes live. Future dates schedule posts automatically.",
      validation: (rule: DatetimeRule) => rule.required(),
      group: "settings",
    }),
    defineField({
      name: "category",
      type: "string",
      title: "Category",
      description: "Organize posts by theme such as Mindfulness, Recipes, or Rituals.",
      validation: (rule: StringRule) => rule.max(60),
      group: "settings",
    }),
    defineField({
      name: "excerpt",
      type: "text",
      title: "Intro snippet",
      description: "1–2 sentence teaser used on cards and social previews.",
      rows: 3,
      validation: (rule: TextRule) => rule.max(280),
      group: "settings",
    }),
    defineField({
      name: "coverImage",
      type: "image",
      title: "Cover image",
      description: "Landscape images feel best for the hero and cards.",
      options: {
        hotspot: true,
      },
      fields: [
        defineField({
          name: "alt",
          type: "string",
          title: "Alt text",
          description: "Describe the image in a short sentence for accessibility.",
          validation: (rule: StringRule) => rule.max(120),
        }),
      ],
      group: "content",
    }),
    defineField({
      name: "content",
      type: "array",
      title: "Post body",
      description: "Write or paste your story. Use headings, quotes, and images to add flow.",
      of: [
        defineArrayMember({
          type: "block",
          styles: [
            { title: "Normal", value: "normal" },
            { title: "Heading", value: "h2" },
            { title: "Subheading", value: "h3" },
            { title: "Quote", value: "blockquote" },
          ],
          lists: [
            { title: "Bulleted list", value: "bullet" },
            { title: "Numbered list", value: "number" },
          ],
          marks: {
            decorators: [
              { title: "Strong", value: "strong" },
              { title: "Emphasis", value: "em" },
              { title: "Underline", value: "underline" },
            ],
            annotations: [
              {
                name: "link",
                type: "object",
                title: "Link",
                fields: [
                  defineField({
                    name: "href",
                    type: "url",
                    title: "URL",
                    description: "Paste a full link including https://",
                    validation: (rule: UrlRule) => rule.uri({ allowRelative: false }).required(),
                  }),
                ],
              },
            ],
          },
          options: {
            spellCheck: true,
          },
        }),
        defineArrayMember({
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({
              name: "alt",
              type: "string",
              title: "Alt text",
              description: "Explain what’s happening in the photo.",
              validation: (rule: StringRule) => rule.max(120),
            }),
          ],
        }),
      ],
      validation: (rule: ArrayRule<unknown[]>) => rule.required().min(1),
      group: "content",
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "publishedAt",
      media: "coverImage",
    },
    prepare(selection) {
      const { title, subtitle, media } = selection as { title?: string; subtitle?: string; media?: unknown };
      return {
        title,
        subtitle: subtitle ? new Date(subtitle).toLocaleDateString() : "Publish date not set",
        media: media as any,
      };
    },
  },
});
