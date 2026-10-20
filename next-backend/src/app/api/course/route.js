//src/app/api/course/route.js

import { getClientPromise } from "@/lib/mongodb";
import {
  DB_NAME,
  ROLE_STUDENT,
  ROLE_TEACHER,
  STATUS_CANCEL,
} from "@/lib/constant";
import { escapeRegex, toCourseResponse, validateCourse } from "@/lib/course";
import {
  errorResponse,
  getRequestUser,
  optionsResponse,
  printExceptionLog,
  readJsonBody,
  successResponse,
  toObjectId,
} from "@/lib/utils";

export async function OPTIONS() {
  return optionsResponse();
}

/**
 * GET /api/course
 *  - Teacher: own courses only
 *  - Student: all courses except Cancel
 *      ?q=<text>        filter by part of course name or teacher name
 *      ?enrolled=true   only courses the student is enrolled in
 */
export async function GET(request) {
  const user = getRequestUser(request);
  if (!user) return errorResponse("Unauthorized Request", 401);

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  const enrolledOnly = searchParams.get("enrolled") === "true";

  let filter;
  if (user.role === ROLE_TEACHER) {
    filter = { teacherId: toObjectId(user.id) };
  } else if (user.role === ROLE_STUDENT) {
    filter = enrolledOnly
      ? { "students.studentId": toObjectId(user.id) }
      : { status: { $ne: STATUS_CANCEL } };
  } else {
    return errorResponse("Forbidden", 403);
  }

  if (q) {
    const regex = { $regex: escapeRegex(q), $options: "i" };
    filter.$or = [{ name: regex }, { teacherName: regex }];
  }

  try {
    const client = await getClientPromise();
    const db = client.db(DB_NAME);
    const courses = await db
      .collection("courses")
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    return successResponse(
      { courses: courses.map((c) => toCourseResponse(c, user)) },
      200,
    );
  } catch (error) {
    printExceptionLog("GET /api/course", error);
    return errorResponse("Internal server error", 500);
  }
}

/**
 * POST /api/course — Teacher only, creates a course owned by the teacher
 */
export async function POST(request) {
  const user = getRequestUser(request);
  if (!user) return errorResponse("Unauthorized Request", 401);
  if (user.role !== ROLE_TEACHER)
    return errorResponse("Only teachers can create courses", 403);

  const { data, error } = validateCourse(await readJsonBody(request));
  if (error) return errorResponse(error, 400);

  try {
    const client = await getClientPromise();
    const db = client.db(DB_NAME);
    const now = new Date();
    const course = {
      ...data,
      teacherId: toObjectId(user.id),
      teacherName: user.username,
      students: [],
      createdAt: now,
      updatedAt: now,
    };
    const result = await db.collection("courses").insertOne(course);

    return successResponse(
      {
        message: "Course created",
        course: toCourseResponse({ ...course, _id: result.insertedId }, user),
      },
      201,
    );
  } catch (error) {
    printExceptionLog("POST /api/course", error);
    return errorResponse("Internal server error", 500);
  }
}
