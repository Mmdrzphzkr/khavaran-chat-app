// lib/auth.js
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "./prisma";
import bcrypt from "bcryptjs";

// 1. Define auth options
const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          // Check if user exists
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (user) {
            // Verify password
            const isValid = await bcrypt.compare(
              credentials.password,
              user.password
            );
            return isValid ? user : null;
          } else {
            // Register new user
            if (credentials.password.length < 6) {
              throw new Error("Password must be at least 6 characters");
            }

            const hashedPassword = await bcrypt.hash(credentials.password, 12);
            const newUser = await prisma.user.create({
              data: {
                email: credentials.email,
                password: hashedPassword,
                name: credentials.email.split("@")[0],
              },
            });
            return newUser;
          }
        } catch (error) {
          console.error("Authentication error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.user = user;
      return token;
    },
    async session({ session, token }) {
      session.user = token.user;
      return session;
    },
  },
  debug: process.env.NODE_ENV === "development",
};

// 2. Initialize NextAuth and export everything
const handler = NextAuth(authOptions);

// 3. Proper exports
export {
  handler as GET,
  handler as POST,
  handler as auth,
  handler as signIn,
  handler as signOut,
  authOptions,
};
