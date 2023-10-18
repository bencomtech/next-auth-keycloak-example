import NextAuth, { User } from "next-auth";

declare module "next-auth" {
  interface Session {
    access_token: string;
    error: string;
  }

  interface Account {
    refresh_expires_in: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    access_token_expired: number;
    refresh_token_expired: number;
    user: User,
    access_token: string;
    error: string;
  }
}
