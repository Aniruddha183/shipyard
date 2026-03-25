import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email:    { label: "Email",    type: "email"    },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        await connectDB();
        const user = await User.findOne({
          email: (credentials.email as string).toLowerCase(),
        });

        if (!user || !user.password) return null;

        const isPasswordCorrect = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordCorrect) return null;

        return {
          id:    user._id.toString(),
          name:  user.username,
          email: user.email,
          image: user.avatar,
        };
      },
    }),
  ],

  callbacks: {
    // ── 1. signIn ──────────────────────────────────────────────────────────
    async signIn({ user, account, profile }) {
      if (account?.provider === "github" && profile) {
        try {
          await connectDB();
          const githubId = String(profile.id);
          const existingUser = await User.findOne({ githubId });

          if (!existingUser) {
            const email =
              user.email ||
              (profile as Record<string, unknown>).email as string ||
              `${githubId}@users.noreply.github.com`;

            const baseUsername =
              (profile as Record<string, unknown>).login as string ||
              user.name ||
              `shipbuilder_${githubId.slice(-4)}`;

            let username = baseUsername;
            const taken = await User.findOne({ username });
            if (taken) username = `${baseUsername}_${githubId.slice(-4)}`;

            await User.create({
              githubId,
              username,
              avatar:         user.image || "",
              email,
              streak:         0,
              lastActiveDate: null,
              totalPoints:    0,
              rank:           0,
            });
          }
        } catch (error) {
          console.error("Error during sign in:", error);
          return false;
        }
      }
      return true;
    },

    // ── 2. jwt ─────────────────────────────────────────────────────────────
    async jwt({ token, user, account, profile }) {
      // Initial GitHub sign-in: look up the MongoDB _id and store it
      if (account?.provider === "github" && profile) {
        try {
          await connectDB();
          const githubId = String((profile as any).id);
          const dbUser = await User.findOne({ githubId });
          if (dbUser) {
            token.mongoId  = dbUser._id.toString();
            token.username = dbUser.username;
          }
        } catch {
          // non-fatal
        }
      } else if (account?.provider === "credentials" && user?.id) {
        token.mongoId = user.id;
      }

      // Safety net for old cookies: resolve mongoId from DB
      if (!token.mongoId && token.sub) {
        try {
          await connectDB();
          let dbUser = await User.findOne({ githubId: token.sub });
          if (!dbUser) {
            dbUser = await User.findOne({ email: token.email });
          }
          if (dbUser) {
            token.mongoId = dbUser._id.toString();
          }
        } catch {
          // non-fatal
        }
      }

      return token;
    },

    // ── 3. session ─────────────────────────────────────────────────────────
    async session({ session, token }) {
      if (token.mongoId) {
        if (session.user) {
          (session.user as any).id = token.mongoId as string;
        }

        try {
          await connectDB();
          const dbUser = await User.findById(token.mongoId).lean();
          if (dbUser && session.user) {
            (session.user as any).username    = dbUser.username;
            (session.user as any).streak      = dbUser.streak;
            (session.user as any).totalPoints = dbUser.totalPoints;
            (session.user as any).rank        = dbUser.rank;
          }
        } catch {
          // non-fatal
        }
      }
      return session;
    },
  },

  pages: {
    signIn: "/signin",
  },
  session: {
    strategy: "jwt",
  },
});
