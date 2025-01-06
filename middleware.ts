import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { Language } from "./lib/types";

const DEFAULT_LOCALE: Language = "en";
const COOKIE_NAME = "NEXT_LOCALE";

export function middleware(request: NextRequest) {
  // Check URL parameter first
  const urlLocale = request.nextUrl.searchParams.get("lang") as Language | null;

  // Then check cookie
  const cookieLocale = request.cookies.get(COOKIE_NAME)
    ?.value as Language | null;

  // Finally check Accept-Language header
  const acceptLocale = request.headers
    .get("Accept-Language")
    ?.split(",")[0]
    .split("-")[0] as Language | null;

  // Use the first available locale, falling back to default
  const locale = urlLocale || cookieLocale || acceptLocale || DEFAULT_LOCALE;

  // Create a response object
  const response = NextResponse.next();

  // Set the locale cookie if it's not already set
  if (!cookieLocale) {
    response.cookies.set(COOKIE_NAME, locale);
  }

  return response;
}

export const config = {
  matcher: "/:path*",
};
