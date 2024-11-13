import RedisStoreFactory from "connect-redis";
import Redis from "ioredis";
import type { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";
import nextSession from "next-session";
import { expressSession, promisifyStore } from "next-session/lib/compat";
import passport from "passport";

const redisClient = new Redis(process.env.REDIS_URL as string);

const RedisStore = RedisStoreFactory(expressSession);

const getSession = nextSession({
  store: promisifyStore(
    new RedisStore({
      client: redisClient,
    })
  ),
  name: "sessionID",
  decode: (raw) => raw,
  encode: (sid) => sid,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 86400, // 1 day
  },
});

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user as null);
});

const sessionMiddleware = nc<NextApiRequest, NextApiResponse>()
  .use(async (req, res, next) => {
    await getSession(req, res);
    next();
  })
  .use(passport.initialize())
  .use(passport.session());

export { getSession, sessionMiddleware };

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.writeHead(307, { Location: "/home" }).end();
}
