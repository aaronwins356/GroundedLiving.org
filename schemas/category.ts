import { defineField, defineType, type StringRule } from "sanity";

export default defineType({
  name: "category",
  title: "Category",
  type: "document",
  fields: [
    defineField({
      name: "name",
      type: "string",
      title: "Name",
      description: "For example: Lifestyle, Movement, or Nutrition.",
      validation: (rule: StringRule) => rule.required().max(60),
    }),
    defineField({
      name: "slug",
      type: "slug",
      title: "Slug",
      description: "Used in URLs to filter by category.",
      options: {
        source: "name",
        maxLength: 96,
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "description",
      type: "text",
      title: "Description",
      rows: 3,
      description: "Optional summary that appears inside the Studio and future menus.",
      validation: (rule) => rule.max(240),
    }),
    defineField({
      name: "color",
      type: "string",
      title: "Accent color",
      description: "Hex color (example: #A8C1AD) used on category badges.",
      validation: (rule: StringRule) => rule.regex(/^#([0-9a-fA-F]{3}){1,2}$/).warning("Use a valid hex color such as #A8C1AD."),
    }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "description",
    },
  },
});
