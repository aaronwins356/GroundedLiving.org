const post = {
  name: "post",
  title: "Post",
  type: "document",
  fields: [
    {
      name: "title",
      type: "string",
      title: "Title",
      description: "Give the article a warm, descriptive name that readers will immediately connect with.",
      validation: (rule: any) => rule.required().min(4),
    },
    {
      name: "slug",
      type: "slug",
      title: "URL slug",
      description: "Click “Generate” to create the link from the title. You can edit it to be shorter if you prefer.",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (rule: any) => rule.required(),
    },
    {
      name: "publishedAt",
      type: "datetime",
      title: "Publish date",
      description: "Choose the date the post goes live. Future dates let you schedule upcoming stories.",
      validation: (rule: any) => rule.required(),
    },
    {
      name: "excerpt",
      type: "text",
      title: "Intro snippet",
      description: "A short teaser that appears on cards and social previews (1–2 sentences).",
      rows: 3,
      validation: (rule: any) => rule.max(280),
    },
    {
      name: "category",
      type: "string",
      title: "Category",
      description: "Group posts by theme such as Mindfulness, Nourishing Recipes, or Gentle Movement.",
      validation: (rule: any) => rule.max(60),
    },
    {
      name: "coverImage",
      type: "image",
      title: "Cover image",
      description: "Upload a calming photo that represents the feeling of the post. Landscape images work best.",
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: "alt",
          type: "string",
          title: "Alt text",
          description: "Describe the image in a sentence for screen readers (e.g. 'Woman meditating with morning light').",
          validation: (rule: any) => rule.max(120),
        },
      ],
    },
    {
      name: "content",
      type: "array",
      title: "Post body",
      description: "Write or paste your story here. Use headings, lists, and images to create flow.",
      of: [
        { type: "block" },
        {
          type: "image",
          options: {
            hotspot: true,
          },
          fields: [
            {
              name: "alt",
              type: "string",
              title: "Alt text",
              description: "Explain what’s happening in the image for accessibility.",
              validation: (rule: any) => rule.max(120),
            },
          ],
        },
      ],
      validation: (rule: any) => rule.required().min(1),
    },
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
        subtitle: subtitle ? new Date(subtitle).toLocaleDateString() : "Publish date not set",
        media,
      };
    },
  },
} as const;

export default post;
