import { authHandler } from "@/pages/api/auth-handler";
import { getSession } from "../session";

export default authHandler().get(async (req, res) => {
  const session = await getSession(req, res);


  console.log(session);
  console.log("callback");

  return res
    .setHeader("Location", "/")

    .status(307)
    .end();
});

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};
