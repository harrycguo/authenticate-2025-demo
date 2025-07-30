import type { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";
import { getSession, sessionMiddleware } from "../session";

const GET = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession(req, res);

  session.user = { name: "Demo User" };
  session.isAuthenticated = true;

  // Redirect to the key exchange handler.
  return res.redirect("/key-exchange");
};

const handler = nc<NextApiRequest, NextApiResponse>({
  onError: (err, _, res) => {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  },
  onNoMatch: (req, res) => {
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  },
})
  .use(sessionMiddleware)
  .get(GET);

export default handler;

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};
