// pages/api/auth/[...nextauth].ts
import { NextAuthOptions } from 'next-auth';

export const authOptions: NextAuthOptions = {
    debug: true, // Add this line
    providers: [
        {
            id: "beyondidentity",
            name: "Beyond Identity",
            type: "oauth",
            wellKnown: process.env.OIDC_ISSUER_URL,
            authorization: { params: { scope: "openid" } },
            clientId: process.env.OIDC_CLIENT_ID,
            clientSecret: process.env.OIDC_CLIENT_SECRET,
            idToken: true,
            checks: ["state"],
            allowDangerousEmailAccountLinking: true,
            profile(profile) {
                return {
                    id: profile.sub,
                };
            },
        }

    ],
    callbacks: {
        async session({ session, token }) {
            session.user = {
                ...session.user,
                id: token.sub as string,
                accessToken: token.accessToken,  // Optionally pass the access token to session
            }
            return session
        },
        async jwt({ token, account, user }) {
            if (account) {
                token.accessToken = account.access_token  // Store access token in JWT
                token.idToken = account.id_token          // Store ID token if needed
            }
            if (user) {
                token.sub = user.id  // Ensure `sub` is set to user ID
            }
            return token
        },
    },
    session: {
        strategy: 'database',  // Use JWT strategy for session management
    },
    secret: process.env.NEXTAUTH_SECRET,
}
