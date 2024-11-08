import { NextApiRequest, NextApiResponse } from "next";
import { Issuer } from "openid-client";
import { getSession } from "../session";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const session = await getSession(req, res);
  const { error, error_description, state, code } = req.query;

  // 1. Check for errors
  if (error) {
    console.error("Auth error:", error, error_description);
    return res.status(400).json({
      error: error,
      description: error_description,
    });
  }

  // 2. Validate state
  if (!state || state !== session.state) {
    console.error("Invalid state parameter");
    return res.status(400).json({
      error: "Invalid state parameter",
      description: "The state parameter does not match the expected value.",
    });
  }

  try {
    // 3. Exchange code for tokens
    const issuer = await Issuer.discover(process.env.OIDC_ISSUER!);
    const client = new issuer.Client({
      client_id: process.env.OIDC_CLIENT_ID!,
      client_secret: process.env.OIDC_CLIENT_SECRET!,
      redirect_uris: [process.env.OIDC_REDIRECT_URI!],
      response_types: ["code"],
    });

    const tokenSet = await client.callback(process.env.OIDC_REDIRECT_URI!, {
      code: code as string,
    });

    const idTokenClaims = tokenSet.claims();

    // 4. Set session with claims
    session.user = {
      name: idTokenClaims.sub,
    };
    session.tokenSet = {
      accessToken: tokenSet.access_token,
      refreshToken: tokenSet.refresh_token,
      idToken: tokenSet.id_token,
    };

    // 5. Set some session data
    session.isAuthenticated = true;
    session.hasExchangedKeys = false;

    return res.redirect("/key-exchange");
  } catch (error) {
    console.error("Callback error:", error);
    return res.redirect("/error");
  }
}

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};
