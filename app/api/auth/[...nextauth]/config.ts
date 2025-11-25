import type { NextAuthOptions, Session, User as NextAuthUser } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import GoogleProvider, { type GoogleProfile } from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { verifyPassword } from '@/lib/auth';

type ProviderType = 'credentials' | 'google';

const sanitizeImage = (image?: string | null) => {
  if (!image) return undefined;
  const trimmed = image.trim();
  if (!trimmed) return undefined;
  if (trimmed.startsWith('data:image/')) {
    // Do not store base64 blobs inside JWT cookies; fetch from DB when needed
    return undefined;
  }
  if (trimmed.length > 1024) {
    return undefined;
  }
  return trimmed;
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

        const email = credentials.email.trim().toLowerCase();
        const user = await User.findOne({ email });

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
          provider: 'credentials' as ProviderType,
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
        user.provider = 'google';
        user.image = sanitizeImage(user.image || googleProfile?.picture);

        if (!existingUser) {
          const newUser = await User.create({
            email: user.email,
            name: user.name || googleProfile?.name || 'User',
            image: user.image,
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
        type SessionUserExtras = Session['user'] & { id?: string; provider?: ProviderType };
        type TokenExtras = JWT & { id?: string; provider?: ProviderType };
        const sessionUser = session.user as SessionUserExtras;
        const typedToken = token as TokenExtras;

        if (typedToken.id) {
          sessionUser.id = typedToken.id;
        }
        if (typeof typedToken.name === 'string') {
          sessionUser.name = typedToken.name;
        }
        if (typeof typedToken.email === 'string') {
          sessionUser.email = typedToken.email;
        }
        if (typedToken.provider) {
          sessionUser.provider = typedToken.provider;
        }

        if (typeof typedToken.picture === 'string') {
          sessionUser.image = typedToken.picture;
        } else if (sessionUser.id) {
          await connectDB();
          const freshUser = await User.findById(sessionUser.id).select('image');
          if (freshUser?.image) {
            sessionUser.image = freshUser.image;
          } else {
            sessionUser.image = undefined;
          }
        }
      }
      return session as Session;
    },
    async jwt({ token, user, trigger, account }) {
      const typedToken = token as JWT & { id?: string; provider?: ProviderType };
      const typedUser = user as (NextAuthUser & { provider?: ProviderType }) | undefined;

      if (typedUser) {
        typedToken.id = typedUser.id ?? typedToken.id;
        typedToken.name = typedUser.name;
        typedToken.email = typedUser.email;
        typedToken.picture = sanitizeImage(typedUser.image);
        typedToken.provider = typedUser.provider || (account?.provider === 'google' ? 'google' : 'credentials');
      }

      if (trigger === 'update' && typedToken.id) {
        try {
          await connectDB();
          const freshUser = await User.findById(typedToken.id).select('name email image provider');
          if (freshUser) {
            typedToken.name = freshUser.name;
            typedToken.email = freshUser.email;
            typedToken.picture = sanitizeImage(freshUser.image);
            typedToken.provider = freshUser.provider as ProviderType;
          }
        } catch (error) {
          console.error('Error refreshing token on update:', error);
        }
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