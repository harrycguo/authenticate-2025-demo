import { createSignedToken } from "@/utils/token";
import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "./session";

// API handler to return the signed token
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const session = await getSession(req, res);
    if (session.user) {
      session.counter += 1;
      console.log("session.counter", session.counter);
      const token = createSignedToken(session.user.name, session.counter);
      res.status(200).json({ token });
    } else {
      res.status(401).json({ error: "Unauthorized" });
    }
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
}
