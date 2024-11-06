import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";
import { getSession, sessionMiddleware } from "../session";

const POST = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession(req, res);
  session.destroy();
  res.json({ success: true });
};

// Route handler with error handling
const handler = nc<NextApiRequest, NextApiResponse>({
  onError: (error, _, res) => {
    console.error("ERROR", error);
    return res.status(500).json({ error: "Internal server error" });
  },
  onNoMatch: (req, res) => {
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  },
})
  .use(sessionMiddleware)
  .post(POST);

export default handler;

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};
