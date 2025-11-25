import type { NextAuthOptions, Profile, Session, User as NextAuthUser } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { verifyPassword } from '@/lib/auth';

type ProviderType = 'credentials' | 'google';

const sanitizeImage = (image?: string | null) => {
  if (!image) return undefined;
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
          provider: user.provider,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        await connectDB();

        const existingUser = await User.findOne({ email: user.email });
        const profileData = profile as (Profile & { picture?: string | null; name?: string | null }) | null;
        const profileName = profileData?.name || 'User';
        const profileImage = sanitizeImage(user.image || profileData?.picture);

        if (!existingUser) {
          const newUser = await User.create({
            email: user.email,
            name: user.name || profileName,
            image: profileImage,
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
      const typedToken = token as JWT & { provider?: ProviderType };
      if (session.user) {
        if (typeof typedToken.id === 'string') {
          session.user.id = typedToken.id;
        }
        if (typeof typedToken.name === 'string') {
          session.user.name = typedToken.name;
        }
        if (typeof typedToken.email === 'string') {
          session.user.email = typedToken.email;
        }
        session.user.image = typeof typedToken.picture === 'string' ? typedToken.picture : session.user.image;
        session.user.provider = typedToken.provider;
      }
      return session as Session;
    },
    async jwt({ token, user, trigger, account }) {
      const typedToken = token as JWT & { provider?: ProviderType };
      const typedUser = user as (NextAuthUser & { provider?: ProviderType }) | undefined;

      if (typedUser) {
        typedToken.id = typedUser.id ?? typedToken.id;
        typedToken.name = typedUser.name;
        typedToken.email = typedUser.email;
        typedToken.picture = sanitizeImage(typedUser.image);
        typedToken.provider = typedUser.provider || (account?.provider === 'google' ? 'google' : 'credentials');
      }
      
      // When session is updated (e.g., after profile update), fetch latest data from database
      if (trigger === 'update' && typedToken.id) {
        try {
          await connectDB();
          const freshUser = await User.findById(typedToken.id).select('name image email provider');
          if (freshUser) {
            typedToken.name = freshUser.name;
            typedToken.email = freshUser.email;
            typedToken.picture = sanitizeImage(freshUser.image);
            typedToken.provider = freshUser.provider;
          }
        } catch (error) {
          console.error('Error fetching user in jwt callback:', error);
        }
      }
      
      return typedToken as JWT;
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
