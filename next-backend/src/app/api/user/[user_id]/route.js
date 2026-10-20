//src/app/api/user/[user_id]/route.js

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
 * GET /api/user/:user_id — a user may only read their own profile
 */
export async function GET(request, { params }) {
  const authUser = getRequestUser(request);
  if (!authUser) return errorResponse("Unauthorized Request", 401);

  const { user_id } = await params;
  const userId = toObjectId(user_id);
  if (!userId) return errorResponse("Invalid user id", 400);
  if (user_id !== authUser.id) return errorResponse("Forbidden", 403);

  try {
    const client = await getClientPromise();
    const db = client.db(DB_NAME);
    const user = await db.collection("users").findOne({ _id: userId });

    if (!user) return errorResponse("User not found", 404);
    return successResponse({ user: toPublicUser(user) }, 200);
  } catch (error) {
    printExceptionLog("GET /api/user/[user_id]", error);
    return errorResponse("Internal server error", 500);
  }
}
