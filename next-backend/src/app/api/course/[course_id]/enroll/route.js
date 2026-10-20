//src/app/api/course/[course_id]/enroll/route.js

import { getClientPromise } from "@/lib/mongodb";
import {
  DB_NAME,
  ROLE_STUDENT,
  STATUS_CANCEL,
  STATUS_OPEN,
} from "@/lib/constant";
import { toCourseResponse } from "@/lib/course";
import {
  errorResponse,
  getRequestUser,
  optionsResponse,
  printExceptionLog,
  successResponse,
  toObjectId,
} from "@/lib/utils";

export async function OPTIONS() {
  return optionsResponse();
}

/**
 * POST /api/course/:course_id/enroll — Student only.
 * Enrolls only when the course is Open, has free seats,
 * and the student is not already enrolled.
 */
export async function POST(request, { params }) {
  const user = getRequestUser(request);
  if (!user) return errorResponse("Unauthorized Request", 401);
  if (user.role !== ROLE_STUDENT)
    return errorResponse("Only students can enroll in courses", 403);

  const { course_id } = await params;
  const courseId = toObjectId(course_id);
  if (!courseId) return errorResponse("Invalid course id", 400);

  const studentId = toObjectId(user.id);

  try {
    const client = await getClientPromise();
    const db = client.db(DB_NAME);
    const courses = db.collection("courses");

    // Single atomic update so concurrent requests cannot over-enroll
    // or enroll the same student twice.
    const updated = await courses.findOneAndUpdate(
      {
        _id: courseId,
        status: STATUS_OPEN,
        "students.studentId": { $ne: studentId },
        $expr: { $lt: [{ $size: "$students" }, "$maxStudent"] },
      },
      {
        $push: {
          students: {
            studentId,
            username: user.username,
            email: user.email,
            enrolledAt: new Date(),
          },
        },
      },
      { returnDocument: "after" },
    );

    if (updated) {
      return successResponse(
        { message: "Enrolled successfully", course: toCourseResponse(updated, user) },
        200,
      );
    }

    // Work out why the enrollment was rejected
    const course = await courses.findOne({ _id: courseId });
    if (!course || course.status === STATUS_CANCEL)
      return errorResponse("Course not found", 404);
    if ((course.students || []).some((s) => s.studentId.equals(studentId)))
      return errorResponse("You are already enrolled in this course", 409);
    if (course.status !== STATUS_OPEN)
      return errorResponse("This course is not open for enrollment", 409);
    return errorResponse("This course is full", 409);
  } catch (error) {
    printExceptionLog("POST /api/course/[course_id]/enroll", error);
    return errorResponse("Internal server error", 500);
  }
}
