import { NextResponse } from "next/server";

// The Contentful management SDK depends on Node APIs, so keep this handler on Node.
export const runtime = "nodejs";

import { uploadAsset } from "../../../../lib/contentfulManagement";
import { guardRequest, handleError } from "../utils";

export async function POST(request: Request) {
  const unauthorized = await guardRequest();
  if (unauthorized) {
    return unauthorized;
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing file upload" }, { status: 400 });
    }

    const title = formData.get("title");
    const description = formData.get("description");

    const asset = await uploadAsset({
      file,
      fileName: file.name,
      contentType: file.type || "application/octet-stream",
      title: typeof title === "string" ? title : undefined,
      description: typeof description === "string" ? description : undefined,
    });

    return NextResponse.json(asset, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
