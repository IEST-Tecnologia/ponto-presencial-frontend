import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// Specify protected and public routes
const publicRoutes = ["/login", "/api/auth"];

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Allow public routes
  const isPublicRoute = publicRoutes.some((route) => path.startsWith(route));

  // Get tokens from cookies
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;
  const refreshToken = cookieStore.get("refresh_token")?.value;

  // If no access token but has refresh token, redirect to refresh endpoint
  if (!isPublicRoute && !accessToken && refreshToken) {
    const refreshUrl = new URL("/api/auth/refresh", req.nextUrl);
    refreshUrl.searchParams.set("returnUrl", path);
    return NextResponse.redirect(refreshUrl);
  }

  // Redirect to /login if the user is not authenticated
  if (!isPublicRoute && !accessToken) {
    const loginUrl = new URL("/login", req.nextUrl);
    loginUrl.searchParams.set("returnUrl", path);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect to / if authenticated user tries to access login
  if (path === "/login" && accessToken) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  return NextResponse.next();
}

// Routes Proxy should not run on
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
