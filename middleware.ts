export { default } from 'next-auth/middleware';

export const config = {
  matcher: ['/my-events/:path*', '/events/create/:path*', '/events/:path*/edit'],
};

