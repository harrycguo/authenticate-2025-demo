import crypto from "crypto";
import type { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";
import { Issuer, Strategy } from "openid-client";
import passport from "passport";

import { getSession, sessionMiddleware } from "./session";

/**
 * Generates a secure, random state string for OAuth requests.
 */
function generateRandomState() {
  return crypto.randomBytes(16).toString("hex"); // 32-character hexadecimal string
}

/**
 * OAuth route middleware
 * Creates an OAuth2 strategy based on a provided org ID.
 * The strategy can then be used to retrieve an access token than can then be attributed to the current session.
 */
export const authHandler = () =>
  nc<NextApiRequest, NextApiResponse>({
    onError: (error, _, res) => {
      console.log("ERROR", error);
      return res.status(307).end();
    },
  })
    .use(sessionMiddleware)
    .get(async (req, res, next) => {
      const session = await getSession(req, res);

      // Generate and store a random state in the session
      const state = generateRandomState();
      session.state = state; // Store the state in the session for later verification

      const issuer = await Issuer.discover(process.env.OIDC_ISSUER!);

      const client = new issuer.Client({
        client_id: process.env.OIDC_CLIENT_ID!,
        client_secret: process.env.OIDC_CLIENT_SECRET!,
        redirect_uris: [process.env.OIDC_REDIRECT_URI!],
        response_types: ["code"],
      });

      passport.use(
        "oidc",
        new Strategy(
          {
            client,
            passReqToCallback: true,
            usePKCE: false,
            params: {
              scope: "openid",
            },
          },
          (req, tokenSet, userinfo, done) => {
            return done(null, userinfo);
          }
        )
      );

      await passport.authenticate("oidc", {
        state: session.state, // Pass the generated state to Passport
      })(req, res, next);
    });
