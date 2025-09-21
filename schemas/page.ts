const page = {
  name: "page",
  title: "Page",
  type: "document",
  fields: [
    {
      name: "title",
      type: "string",
      title: "Title",
      description: "Give the page a clear name like About, Contact, or Offerings.",
      validation: (rule: any) => rule.required().min(2),
    },
    {
      name: "slug",
      type: "slug",
      title: "URL slug",
      description: "This becomes the web address (example: about → groundedliving.org/about).",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (rule: any) => rule.required(),
    },
    {
      name: "coverImage",
      type: "image",
      title: "Hero image",
      description: "Optional — add a welcoming banner image to set the tone of the page.",
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: "alt",
          type: "string",
          title: "Alt text",
          description: "Describe the image for accessibility.",
          validation: (rule: any) => rule.max(120),
        },
      ],
    },
    {
      name: "content",
      type: "array",
      title: "Page content",
      description: "Write the story or information that belongs on this page. Use headings to keep it skimmable.",
      of: [
        { type: "block" },
        {
          type: "image",
          options: { hotspot: true },
          fields: [
            {
              name: "alt",
              type: "string",
              title: "Alt text",
              description: "Explain what’s shown in the image.",
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
      subtitle: "slug.current",
      media: "coverImage",
    },
  },
} as const;

export default page;
