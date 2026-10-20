//src/app/api/course/[course_id]/route.js

import { getClientPromise } from "@/lib/mongodb";
import {
  DB_NAME,
  ROLE_STUDENT,
  ROLE_TEACHER,
  STATUS_CANCEL,
} from "@/lib/constant";
import { toCourseResponse, validateCourse } from "@/lib/course";
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
 * GET /api/course/:course_id
 *  - Teacher: own course only (includes enrolled students)
 *  - Student: any course that is not Cancel
 */
export async function GET(request, { params }) {
  const user = getRequestUser(request);
  if (!user) return errorResponse("Unauthorized Request", 401);

  const { course_id } = await params;
  const courseId = toObjectId(course_id);
  if (!courseId) return errorResponse("Invalid course id", 400);

  try {
    const client = await getClientPromise();
    const db = client.db(DB_NAME);
    const course = await db.collection("courses").findOne({ _id: courseId });

    if (!course) return errorResponse("Course not found", 404);

    if (user.role === ROLE_TEACHER) {
      if (course.teacherId.toString() !== user.id)
        return errorResponse("You can only view your own courses", 403);
    } else if (user.role === ROLE_STUDENT) {
      // Cancelled courses are hidden, except from students already enrolled
      const isEnrolled = (course.students || []).some(
        (s) => s.studentId.toString() === user.id,
      );
      if (course.status === STATUS_CANCEL && !isEnrolled)
        return errorResponse("Course not found", 404);
    } else {
      return errorResponse("Forbidden", 403);
    }

    return successResponse({ course: toCourseResponse(course, user) }, 200);
  } catch (error) {
    printExceptionLog("GET /api/course/[course_id]", error);
    return errorResponse("Internal server error", 500);
  }
}

/**
 * PUT /api/course/:course_id — Teacher only, own course only
 */
export async function PUT(request, { params }) {
  const user = getRequestUser(request);
  if (!user) return errorResponse("Unauthorized Request", 401);
  if (user.role !== ROLE_TEACHER)
    return errorResponse("Only teachers can update courses", 403);

  const { course_id } = await params;
  const courseId = toObjectId(course_id);
  if (!courseId) return errorResponse("Invalid course id", 400);

  const { data, error } = validateCourse(await readJsonBody(request));
  if (error) return errorResponse(error, 400);

  try {
    const client = await getClientPromise();
    const db = client.db(DB_NAME);
    const courses = db.collection("courses");

    const course = await courses.findOne({ _id: courseId });
    if (!course) return errorResponse("Course not found", 404);
    if (course.teacherId.toString() !== user.id)
      return errorResponse("You can only update your own courses", 403);

    // Atomic: max student cannot drop below the current enrollment count
    const updated = await courses.findOneAndUpdate(
      {
        _id: courseId,
        teacherId: toObjectId(user.id),
        $expr: { $lte: [{ $size: "$students" }, data.maxStudent] },
      },
      { $set: { ...data, updatedAt: new Date() } },
      { returnDocument: "after" },
    );

    if (!updated) {
      return errorResponse(
        "Max student cannot be lower than the number of enrolled students",
        409,
      );
    }

    return successResponse(
      { message: "Course updated", course: toCourseResponse(updated, user) },
      200,
    );
  } catch (error) {
    printExceptionLog("PUT /api/course/[course_id]", error);
    return errorResponse("Internal server error", 500);
  }
}

/**
 * DELETE /api/course/:course_id — Teacher only, own course only,
 * and only when no student has enrolled
 */
export async function DELETE(request, { params }) {
  const user = getRequestUser(request);
  if (!user) return errorResponse("Unauthorized Request", 401);
  if (user.role !== ROLE_TEACHER)
    return errorResponse("Only teachers can delete courses", 403);

  const { course_id } = await params;
  const courseId = toObjectId(course_id);
  if (!courseId) return errorResponse("Invalid course id", 400);

  try {
    const client = await getClientPromise();
    const db = client.db(DB_NAME);
    const courses = db.collection("courses");

    const course = await courses.findOne({ _id: courseId });
    if (!course) return errorResponse("Course not found", 404);
    if (course.teacherId.toString() !== user.id)
      return errorResponse("You can only delete your own courses", 403);

    // Atomic: only delete when the students array is still empty
    const result = await courses.deleteOne({
      _id: courseId,
      teacherId: toObjectId(user.id),
      students: { $size: 0 },
    });

    if (result.deletedCount === 0) {
      return errorResponse(
        "Cannot delete a course that already has enrolled students",
        409,
      );
    }

    return successResponse({ message: "Course deleted" }, 200);
  } catch (error) {
    printExceptionLog("DELETE /api/course/[course_id]", error);
    return errorResponse("Internal server error", 500);
  }
}
