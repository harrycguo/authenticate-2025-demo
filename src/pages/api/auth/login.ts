import { authHandler } from "@/pages/api/auth-handler";

export default authHandler();

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};
