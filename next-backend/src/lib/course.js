// src/lib/course.js

import { COURSE_STATUSES, ROLE_TEACHER } from "./constant";

/**
 * Validates a course payload from the client.
 * Returns { error } or { data } with normalized fields.
 */
export function validateCourse(body) {
  if (!body || typeof body !== "object") {
    return { error: "Invalid request body" };
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const durationDays = Number(body.durationDays);
  const price = Number(body.price);
  const maxStudent = Number(body.maxStudent);
  const status = body.status;
  const topics = Array.isArray(body.topics)
    ? body.topics
        .filter((t) => typeof t === "string")
        .map((t) => t.trim())
        .filter((t) => t.length > 0)
    : [];

  if (!name) return { error: "Course name is required" };
  if (!Number.isInteger(durationDays) || durationDays < 1)
    return { error: "Duration must be a whole number of days (at least 1)" };
  if (topics.length === 0) return { error: "At least one topic is required" };
  if (!Number.isFinite(price) || price < 0)
    return { error: "Price must be a number of 0 or more" };
  if (!Number.isInteger(maxStudent) || maxStudent < 1)
    return { error: "Max student must be a whole number (at least 1)" };
  if (!COURSE_STATUSES.includes(status))
    return { error: `Status must be one of: ${COURSE_STATUSES.join(", ")}` };

  return { data: { name, durationDays, topics, price, maxStudent, status } };
}

/**
 * Shapes a course document for the response.
 * Only the owning teacher sees the enrolled student list.
 */
export function toCourseResponse(course, user) {
  const students = course.students || [];
  const isOwner =
    user.role === ROLE_TEACHER && course.teacherId.toString() === user.id;

  const result = {
    _id: course._id,
    name: course.name,
    durationDays: course.durationDays,
    topics: course.topics,
    price: course.price,
    maxStudent: course.maxStudent,
    status: course.status,
    teacherId: course.teacherId,
    teacherName: course.teacherName,
    enrolledCount: students.length,
    seatsLeft: Math.max(course.maxStudent - students.length, 0),
    createdAt: course.createdAt,
    updatedAt: course.updatedAt,
  };

  if (isOwner) {
    result.students = students;
  } else {
    result.isEnrolled = students.some(
      (s) => s.studentId.toString() === user.id,
    );
  }
  return result;
}

export function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
