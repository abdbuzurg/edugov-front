import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextRequest, NextResponse } from 'next/server';
import { jwtDecode } from 'jwt-decode';

// Define the shape of your JWT payload
interface DecodedToken {
  exp: number;
  userID: number
  role: string
}

/**
 * Handles the authentication logic.
 * It will return a response to stop the chain if an action is taken (e.g., refresh, redirect).
 * It will return undefined if the request should proceed to the next middleware.
 */
async function handleAuth(request: NextRequest): Promise<NextResponse | undefined> {
  const accessToken = request.cookies.get('accessToken')?.value;

  // If the user is a guest, do nothing and proceed to the i18n middleware.
  if (!accessToken) {
    return undefined;
  }

  try {
    const decoded = jwtDecode<DecodedToken>(accessToken);
    const isExpired = Date.now() >= decoded.exp * 1000;

    if (isExpired) {
      // If the token is expired, we must try to refresh it.
      // The refreshToken function will return a response that either contains
      // the new cookie or redirects to login.
      return await refreshToken(request);
    }

    // Token is valid, proceed to the i18n middleware.
    return undefined;

  } catch (error) {
    // This means the token is malformed. This is a bad state.
    // Force a logout by clearing cookies and redirecting to the login page.
    console.error('Auth Middleware: Malformed token found. Logging out.');
    const response = NextResponse.redirect(new URL('/login', request.url)); // Adjust '/login' as needed
    response.cookies.delete('accessToken');
    response.cookies.delete('refreshToken');
    return response;
  }
}

/**
 * This function handles the actual token refresh logic.
 * It is only called when a token is present and expired.
 * It ALWAYS returns a NextResponse.
 */
async function refreshToken(request: NextRequest): Promise<NextResponse> {
  const refreshToken = request.cookies.get('refreshToken')?.value;

  if (!refreshToken) {
    console.log('Auth Middleware: Expired token with no refresh token. Logging out.');
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('accessToken');
    return response;
  }

  console.log('Auth Middleware: Access token expired, attempting to refresh...');

  try {
    // Call your EXTERNAL backend to get a new token
    const response = await fetch(`${process.env.NEXT_PUBLIC_NEXT_JS_BACKEND_URL}api/auth/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      console.error('Auth Middleware: Backend failed to refresh token. Logging out.');
      const logoutResponse = NextResponse.redirect(new URL('/login', request.url));
      logoutResponse.cookies.delete('accessToken');
      logoutResponse.cookies.delete('refreshToken');
      return logoutResponse;
    }

    const data = await response.json();
    const newAccessToken = data.accessToken;
    const newRefreshToken = data.refreshToken

    // Create a response to pass down to the next middleware (next-intl)
    // while attaching the new cookie to it.
    const nextResponse = NextResponse.next({
      request: { headers: request.headers },
    });

    console.log('Auth Middleware: Token refreshed. Setting new cookie for the browser.');

    nextResponse.cookies.set({
      name: "accessToken",
      value: data.accessToken,
      httpOnly: true, // NOT HttpOnly, accessible by client-side JS and server components
      secure: false,
      sameSite: 'lax',
      maxAge: newAccessToken,
      path: '/',
    });

    nextResponse.cookies.set({
      name: "refreshToken",
      value: data.refreshToken,
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: newRefreshToken, // Example: one hour
      path: '/',
    });

    return nextResponse;

  } catch (error) {
    console.error('Auth Middleware: Error during token refresh. Logging out.', error);
    const logoutResponse = NextResponse.redirect(new URL('/login', request.url));
    logoutResponse.cookies.delete('accessToken');
    logoutResponse.cookies.delete('refreshToken');
    return logoutResponse;
  }
}


// The main middleware that orchestrates the two parts.
export default async function middleware(request: NextRequest) {
  // 1. Run the authentication logic first.
  const authResponse = await handleAuth(request);

  // If the auth logic returned a response (e.g., a redirect or a new cookie),
  // return it immediately and stop the chain.
  if (authResponse) {
    return authResponse;
  }

  // 2. If auth logic did nothing, proceed with the i18n logic.
  return createMiddleware(routing)(request);
}


// The config from your original file.
export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/trpc`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)',
};