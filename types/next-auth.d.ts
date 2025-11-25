import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      image?: string | null;
      provider?: 'credentials' | 'google';
      createdAt?: string;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    image?: string | null;
    provider?: 'credentials' | 'google';
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    provider?: 'credentials' | 'google';
    picture?: string | null;
  }
}

