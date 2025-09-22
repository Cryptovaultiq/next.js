import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

declare module 'next/server' {
  interface NextRequest {
    ip?: string
  }
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const forwarded = request.headers.get('x-forwarded-for');
  const clientIp = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';

  console.log(`Incoming request from ${clientIp}: ${pathname}${search}`);

  if (pathname.endsWith('.php')) {
    const url = request.nextUrl.clone();
    url.pathname = '/api/secureproxy';
    url.search = search;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/secureproxy.php'],
};