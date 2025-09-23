import type { NextApiRequest, NextApiResponse } from "next";

import { getContentfulEnvironment, withDefaultLocale } from "@/lib/contentfulClient";
import { requireStudioAuthorization } from "@/lib/studioAuth";

const DEFAULT_LOCALE = "en-US";

interface AuthorPayload {
  id?: string;
  name?: string;
  bio?: string;
}

const mapAuthorEntry = (entry: any) => ({
  id: entry?.sys?.id ?? "",
  name: entry?.fields?.name?.[DEFAULT_LOCALE] ?? "",
  bio: entry?.fields?.bio?.[DEFAULT_LOCALE] ?? "",
});

const handleGet = async (res: NextApiResponse) => {
  const environment = await getContentfulEnvironment();
  const entries = await environment.getEntries({
    content_type: "author",
    order: "fields.name",
  });

  const authors = entries.items.map(mapAuthorEntry);
  res.status(200).json({ authors });
};

const handlePost = async (req: NextApiRequest, res: NextApiResponse) => {
  const { name, bio }: AuthorPayload = req.body;

  if (!name) {
    res.status(400).json({ error: "Name is required" });
    return;
  }

  const environment = await getContentfulEnvironment();
  const entry = await environment.createEntry("author", {
    fields: {
      name: withDefaultLocale(name),
      bio: withDefaultLocale(bio ?? ""),
    },
  });

  const published = await entry.publish();
  res.status(201).json({ author: mapAuthorEntry(published) });
};

const handlePut = async (req: NextApiRequest, res: NextApiResponse) => {
  const { id, name, bio }: AuthorPayload = req.body;
  if (!id) {
    res.status(400).json({ error: "Author id is required" });
    return;
  }

  const environment = await getContentfulEnvironment();
  const entry = await environment.getEntry(id);

  if (name !== undefined) {
    entry.fields.name = withDefaultLocale(name);
  }

  if (bio !== undefined) {
    entry.fields.bio = withDefaultLocale(bio);
  }

  const updated = await entry.update();
  const published = await updated.publish();

  res.status(200).json({ author: mapAuthorEntry(published) });
};

const handleDelete = async (req: NextApiRequest, res: NextApiResponse) => {
  const { id }: AuthorPayload = req.body;
  if (!id) {
    res.status(400).json({ error: "Author id is required" });
    return;
  }

  const environment = await getContentfulEnvironment();
  const entry = await environment.getEntry(id);

  try {
    await entry.unpublish();
  } catch (error) {
    // entry might already be unpublished
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
        await handleGet(res);
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
