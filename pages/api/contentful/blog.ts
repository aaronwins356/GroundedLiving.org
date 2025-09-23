import type { NextApiRequest, NextApiResponse } from "next";

import { getContentfulEnvironment, withDefaultLocale } from "@/lib/contentfulClient";
import { requireStudioAuthorization } from "@/lib/studioAuth";

const DEFAULT_LOCALE = "en-US";

interface BlogPayload {
  id?: string;
  title?: string;
  slug?: string;
  excerpt?: string;
  body?: string;
  authorId?: string;
}

const mapBlogEntry = (entry: any) => {
  const authorField = entry?.fields?.author?.[DEFAULT_LOCALE];
  const authorEntry = authorField?.fields;

  return {
    id: entry?.sys?.id ?? "",
    title: entry?.fields?.title?.[DEFAULT_LOCALE] ?? "",
    slug: entry?.fields?.slug?.[DEFAULT_LOCALE] ?? "",
    excerpt: entry?.fields?.excerpt?.[DEFAULT_LOCALE] ?? "",
    body: entry?.fields?.body?.[DEFAULT_LOCALE] ?? "",
    authorId: authorField?.sys?.id ?? "",
    authorName: authorEntry?.name?.[DEFAULT_LOCALE] ?? "",
    status: entry?.sys?.publishedVersion ? "published" : "draft",
    updatedAt: entry?.sys?.updatedAt ?? "",
  };
};

const handleGet = async (req: NextApiRequest, res: NextApiResponse) => {
  const search = typeof req.query.search === "string" ? req.query.search : undefined;
  const environment = await getContentfulEnvironment();
  const entries = await environment.getEntries({
    content_type: "blogPost",
    include: 1,
    order: "-sys.updatedAt",
  });

  const posts = entries.items.map(mapBlogEntry);

  const filtered = search
    ? posts.filter((post) =>
        [post.title, post.slug, post.authorName]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(search.toLowerCase()))
      )
    : posts;

  res.status(200).json({ posts: filtered });
};

const buildBlogFields = ({ title, slug, excerpt, body, authorId }: BlogPayload) => {
  const fields: Record<string, ReturnType<typeof withDefaultLocale>> = {};

  if (title !== undefined) {
    fields.title = withDefaultLocale(title);
  }

  if (slug !== undefined) {
    fields.slug = withDefaultLocale(slug);
  }

  if (excerpt !== undefined) {
    fields.excerpt = withDefaultLocale(excerpt);
  }

  if (body !== undefined) {
    fields.body = withDefaultLocale(body);
  }

  if (authorId !== undefined) {
    fields.author = withDefaultLocale({
      sys: { type: "Link", linkType: "Entry", id: authorId },
    });
  }

  return fields;
};

const handlePost = async (req: NextApiRequest, res: NextApiResponse) => {
  const { title, slug, excerpt = "", body = "", authorId }: BlogPayload = req.body;

  if (!title || !slug) {
    res.status(400).json({ error: "Title and slug are required" });
    return;
  }

  const environment = await getContentfulEnvironment();
  const entry = await environment.createEntry("blogPost", {
    fields: {
      title: withDefaultLocale(title),
      slug: withDefaultLocale(slug),
      excerpt: withDefaultLocale(excerpt),
      body: withDefaultLocale(body),
      ...(authorId
        ? {
            author: withDefaultLocale({
              sys: { type: "Link", linkType: "Entry", id: authorId },
            }),
          }
        : {}),
    },
  });

  const published = await entry.publish();
  res.status(201).json({ post: mapBlogEntry(published) });
};

const handlePut = async (req: NextApiRequest, res: NextApiResponse) => {
  const { id, title, slug, excerpt, body, authorId }: BlogPayload = req.body;
  if (!id) {
    res.status(400).json({ error: "Post id is required" });
    return;
  }

  const environment = await getContentfulEnvironment();
  const entry = await environment.getEntry(id);
  const fields = buildBlogFields({ title, slug, excerpt, body, authorId });

  Object.assign(entry.fields, fields);

  const updated = await entry.update();
  const published = await updated.publish();

  res.status(200).json({ post: mapBlogEntry(published) });
};

const handleDelete = async (req: NextApiRequest, res: NextApiResponse) => {
  const { id }: BlogPayload = req.body;
  if (!id) {
    res.status(400).json({ error: "Post id is required" });
    return;
  }

  const environment = await getContentfulEnvironment();
  const entry = await environment.getEntry(id);

  try {
    await entry.unpublish();
  } catch (error) {
    // entry may already be unpublished
  }

  await entry.delete();
  res.status(204).end();
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (!requireStudioAuthorization(req, res)) {
    return;
  }

  try {
    switch (req.method) {
      case "GET":
        await handleGet(req, res);
        break;
      case "POST":
        await handlePost(req, res);
        break;
      case "PUT":
        await handlePut(req, res);
        break;
      case "DELETE":
        await handleDelete(req, res);
        break;
      default:
        res.setHeader("Allow", "GET,POST,PUT,DELETE");
        res.status(405).json({ error: "Method Not Allowed" });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    res.status(500).json({ error: message });
  }
};

export default handler;
