import type { NextApiRequest, NextApiResponse } from "next";

import { getContentfulEnvironment } from "@/lib/contentfulClient";
import { requireStudioAuthorization } from "@/lib/studioAuth";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (!requireStudioAuthorization(req, res)) {
    return;
  }

  try {
    switch (req.method) {
      case "GET": {
        const environment = await getContentfulEnvironment();
        const assets = await environment.getAssets({ limit: 12, order: "-sys.updatedAt" });
        const formatted = assets.items.map((asset: any) => ({
          id: asset?.sys?.id ?? "",
          title: asset?.fields?.title?.["en-US"] ?? "Untitled asset",
          file: asset?.fields?.file?.["en-US"]?.url ?? "",
          updatedAt: asset?.sys?.updatedAt ?? "",
        }));
        res.status(200).json({ assets: formatted });
        break;
      }
      case "POST": {
        res.status(202).json({
          message: "Asset upload endpoint stub. Integrate direct upload workflow in a follow-up iteration.",
        });
        break;
      }
      default:
        res.setHeader("Allow", "GET,POST");
        res.status(405).json({ error: "Method Not Allowed" });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    res.status(500).json({ error: message });
  }
};

export default handler;
