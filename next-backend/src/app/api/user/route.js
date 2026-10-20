//src/app/api/user/route.js

import { getClientPromise } from "@/lib/mongodb";
import { DB_NAME } from "@/lib/constant";
import {
  errorResponse,
  getRequestUser,
  optionsResponse,
  printExceptionLog,
  successResponse,
  toObjectId,
  toPublicUser,
} from "@/lib/utils";

export async function OPTIONS() {
  return optionsResponse();
}

/**
 * GET /api/user — returns the currently logged-in user (session check)
 */
export async function GET(request) {
  const authUser = getRequestUser(request);
  if (!authUser) return errorResponse("Unauthorized Request", 401);

  try {
    const client = await getClientPromise();
    const db = client.db(DB_NAME);
    const user = await db
      .collection("users")
      .findOne({ _id: toObjectId(authUser.id) });

    if (!user) return errorResponse("User not found", 401);
    return successResponse({ user: toPublicUser(user) }, 200);
  } catch (error) {
    printExceptionLog("GET /api/user", error);
    return errorResponse("Internal server error", 500);
  }
}
