import type { NextApiRequest, NextApiResponse } from "next";

import { clearAuthCookie, createAuthCookie } from "@/lib/studioAuth";

const handler = (req: NextApiRequest, res: NextApiResponse) => {
  const adminKey = process.env.STUDIO_ADMIN_KEY;
  if (!adminKey) {
    res.status(500).json({ error: "STUDIO_ADMIN_KEY environment variable is required" });
    return;
  }

  if (req.method === "POST") {
    const { password } = req.body as { password?: string };
    if (!password) {
      res.status(400).json({ error: "Password is required" });
      return;
    }

    if (password !== adminKey) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    res.setHeader("Set-Cookie", createAuthCookie());
    res.status(200).json({ success: true });
    return;
  }

  if (req.method === "DELETE") {
    res.setHeader("Set-Cookie", clearAuthCookie());
    res.status(200).json({ success: true });
    return;
  }

  res.setHeader("Allow", "POST,DELETE");
  res.status(405).json({ error: "Method Not Allowed" });
};

export default handler;
