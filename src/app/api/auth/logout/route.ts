// app/api/auth/logout/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers'; // To clear cookies

// Replace with the actual URL of your backend's logout/token invalidation endpoint
const BACKEND_LOGOUT_URL = process.env.BACKEND_LOGOUT_URL;

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('refreshToken')?.value; // Get refresh token to invalidate on backend

  console.log(refreshToken)
  try {
    // 1. Call your actual backend to invalidate the refresh token
    // This is important to prevent a compromised refresh token from being used.
    if (refreshToken) {
      await fetch(BACKEND_LOGOUT_URL!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Your backend might expect the refresh token in the body or a specific header for logout
        },
        body: JSON.stringify({ refreshToken }), // Send refresh token to backend for invalidation
      });
      // Note: We don't await the backend response strictly here, as client-side logout should proceed
      // even if backend invalidation has a transient issue. Log errors if needed.
    }

  } catch (backendError: any) {
    console.error('Backend logout/invalidation failed:', backendError.message);
    // Continue with client-side cookie clearing even if backend call fails
  } finally {
    // 2. Clear authentication cookies from the browser
    // This ensures the user is logged out client-side immediately.
    cookieStore.delete('accessToken');  // Clear the non-HttpOnly access token
    cookieStore.delete('refreshToken');  // Clear the non-HttpOnly access token

    // 3. Return a success response
    return NextResponse.json({ message: 'Logged out successfully.' }, { status: 200 });
  }
}
