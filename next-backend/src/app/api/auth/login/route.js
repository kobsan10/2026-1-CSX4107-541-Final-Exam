//src/app/api/auth/login/route.js

import bcrypt from "bcrypt";
import { getClientPromise } from "@/lib/mongodb";
import { signJWT, tokenCookieOptions } from "@/lib/auth";
import { DB_NAME, TOKEN_COOKIE } from "@/lib/constant";
import {
  errorResponse,
  optionsResponse,
  printExceptionLog,
  readJsonBody,
  successResponse,
  toPublicUser,
} from "@/lib/utils";

export async function OPTIONS() {
  return optionsResponse();
}

/**
 * POST /api/auth/login
 * body: { username, password } — username may also be the email
 */
export async function POST(request) {
  const body = await readJsonBody(request);
  const login = body?.username?.trim();
  const password = body?.password;

  if (!login || !password) {
    return errorResponse("Username and password are required", 400);
  }

  try {
    const client = await getClientPromise();
    const db = client.db(DB_NAME);
    const user = await db
      .collection("users")
      .findOne({ $or: [{ username: login }, { email: login.toLowerCase() }] });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return errorResponse("Invalid username or password", 401);
    }

    const response = successResponse(
      { message: "Login successful", user: toPublicUser(user) },
      200,
    );
    response.cookies.set(TOKEN_COOKIE, signJWT(user), tokenCookieOptions());
    return response;
  } catch (error) {
    printExceptionLog("POST /api/auth/login", error);
    return errorResponse("Internal server error", 500);
  }
}
