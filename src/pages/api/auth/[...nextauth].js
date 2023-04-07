import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const authOptions = {
  providers: [
    CredentialsProvider({
      id: "lightning",
      name: "lightning",
      credentials: {
        pubkey: { label: "pubkey", type: "text" },
        k1: { label: "k1", type: "text" },
      },
      async authorize(credentials, req) {
        console.log("credentials in authorize", credentials);
        const { k1, pubkey } = credentials;

        return { k1, pubkey };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      console.log("token in jwt", token);
      console.log("user in jwt", user);

      if (user && user.pubkey && user.k1) {
        token.name = user.pubkey;
        token.id = user.k1;
        token.key = user.pubkey;
        token.k1 = user.k1;
      }
      return Promise.resolve(token);
    },
    async session({ session, token }) {
      console.log("session in session", session);
      console.log("token in session", token);
      session.user.id = Number(token.id);

      if (token.key && token.k1) {
        session.user.pubkey = token.key;
        session.user.k1 = token.k1;
        session.user.id = token.k1;
      }

      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: { jwt: true },
  jwt: {
    signingKey: process.env.JWT_SIGNING_PRIVATE_KEY,
  },
  debug: true,
};

export default NextAuth(authOptions);
