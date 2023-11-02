import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    access_token: string;
    error: string;
    branch_code: string;
    role_code: string;
  }

  interface Account {
    refresh_expires_in: number;
  }

  interface Profile {
    branch_code: string;
    role_code: string;
    employee_code: string;
  }

  interface User {
    employee_code: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    access_token_expired: number;
    refresh_token_expired: number;
    user: User,
    access_token: string;
    error: string;
    branch_code: string;
    role_code: string;
  }
}
