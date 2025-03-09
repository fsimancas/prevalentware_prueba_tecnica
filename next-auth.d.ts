import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface User extends DefaultUser {
    id: string;
    role: string;
  }

  interface Session extends DefaultSession {
    user: User;
  }

  interface JWT {
    id: string;
    role: string;
    email?: string | null;
  }
}
