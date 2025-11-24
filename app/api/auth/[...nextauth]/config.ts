import type { NextAuthOptions, Session } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import GoogleProvider, { type GoogleProfile } from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { verifyPassword } from '@/lib/auth';

const sanitizeImage = (image?: string | null) => {
  if (!image) return undefined;
  if (image.startsWith('data:')) {
    return undefined;
  }
  if (image.length > 1024) {
    return undefined;
  }
  return image;
};

const authConfig: NextAuthOptions = {
  debug: false,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        await connectDB();

        const user = await User.findOne({ email: credentials.email });

        if (!user || !user.password) {
          return null;
        }

        const isValid = await verifyPassword(credentials.password, user.password);

        if (!isValid) {
          return null;
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        await connectDB();

        const existingUser = await User.findOne({ email: user.email });
        const googleProfile = profile as GoogleProfile | undefined;

        if (!existingUser) {
          const newUser = await User.create({
            email: user.email,
            name: user.name || googleProfile?.name || 'User',
            image: sanitizeImage(user.image || googleProfile?.picture),
            provider: 'google',
            providerId: account.providerAccountId,
          });
          user.id = newUser._id.toString();
        } else if (existingUser.provider !== 'google') {
          existingUser.provider = 'google';
          existingUser.providerId = account.providerAccountId;
          existingUser.image = user.image || existingUser.image;
          await existingUser.save();
          user.id = existingUser._id.toString();
        } else {
          user.id = existingUser._id.toString();
        }
      }

      return true;
    },
    async session({ session, token }) {
      if (session.user) {
        type SessionUserWithId = Session['user'] & { id?: string };
        type TokenWithId = JWT & { id?: string };
        const sessionUser = session.user as SessionUserWithId;
        const typedToken = token as TokenWithId;

        if (typedToken.id) {
          sessionUser.id = typedToken.id;
        }
        if (typeof typedToken.name === 'string') {
          session.user.name = typedToken.name;
        }
        if (typeof typedToken.email === 'string') {
          session.user.email = typedToken.email;
        }
        if (typeof typedToken.picture === 'string' || typeof typedToken.picture === 'undefined') {
          session.user.image = typedToken.picture as string | undefined;
        }
      }
      return session;
    },
    async jwt({ token, user }) {
      type TokenWithId = JWT & { id?: string };
      const typedToken = token as TokenWithId;
      if (user) {
        typedToken.id = user.id;
        typedToken.name = user.name;
        typedToken.email = user.email;
        typedToken.picture = sanitizeImage(user.image);
      }
      return typedToken;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default authConfig;