//src/app/api/auth/logout/route.js

import { tokenCookieOptions } from "@/lib/auth";
import { TOKEN_COOKIE } from "@/lib/constant";
import { optionsResponse, successResponse } from "@/lib/utils";

export async function OPTIONS() {
  return optionsResponse();
}

/**
 * POST /api/auth/logout — clears the auth cookie
 */
export async function POST() {
  const response = successResponse({ message: "Logout successful" }, 200);
  response.cookies.set(TOKEN_COOKIE, "", tokenCookieOptions(0));
  return response;
}
