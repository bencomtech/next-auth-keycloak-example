import NextAuth from "next-auth";
import { JWT } from "next-auth/jwt";
import KeycloakProvider from "next-auth/providers/keycloak";

const refreshAccessToken = async (token: JWT) => {
  try {
    if (Date.now() > token.refresh_token_expired) throw Error;

    const details = {
      client_id: process.env.AUTH_CLIENT_ID,
      grant_type: ["refresh_token"],
      refresh_token: token.refresh_token,
    };
    const formBody: string[] = [];

    Object.entries(details).forEach(([key, value]: [string, any]) => {
      const encodedKey = encodeURIComponent(key);
      const encodedValue = encodeURIComponent(value);

      formBody.push(encodedKey + "=" + encodedValue);
    });

    const formData = formBody.join("&");
    const url = `${process.env.AUTH_ISSUER}/token`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      },
      body: formData,
    });
    const refreshedTokens = await response.json();

    if (!response.ok) throw refreshedTokens;

    return {
      ...token,
      access_token: refreshedTokens.access_token,
      access_token_expired:
        Date.now() + (refreshedTokens.expires_at - 15) * 1000,
      refresh_token: refreshedTokens.refresh_token ?? token.refresh_token,
      refresh_token_expired:
        Date.now() + (refreshedTokens.refresh_expires_in - 15) * 1000,
    };
  } catch (error) {
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
};

export default NextAuth({
  providers: [
    KeycloakProvider({
      clientId: process.env.AUTH_CLIENT_ID!,
      clientSecret: process.env.AUTH_CLIENT_SECRET!,
      issuer: process.env.AUTH_ISSUER,
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user = token.user;
        session.error = token.error;
        session.access_token = token.access_token;
        session.branch_code = token.branch_code;
        session.role_code = token.role_code;
      }

      return session;
    },
    async jwt({ token, user, account, profile }) {
      if (account && user && profile) {
        token.access_token = account.access_token!;
        token.refresh_token = account.refresh_token!;
        token.access_token_expired =
          Date.now() + (account.expires_at! - 15) * 1000;
        token.refresh_token_expired =
          Date.now() + (account.refresh_expires_in! - 15) * 1000;
        token.branch_code = profile.branch_code;
        token.role_code = profile.role_code;

        user.employee_code = profile.employee_code;
        token.user = user;
      }

      if (Date.now() < token.access_token_expired) {
        return token;
      }

      return refreshAccessToken(token);
    },
  },
});
