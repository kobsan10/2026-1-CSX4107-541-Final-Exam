export const X_HEADER_USER_ID = "x-user-id";
export const X_HEADER_USER_NAME = "x-user-username";
export const X_HEADER_USER_EMAIL = "x-user-email";
export const X_HEADER_USER_ROLE = "x-user-role";

export const DB_NAME = process.env.DB_NAME || "wad_final";
export const TOKEN_COOKIE = "token";
export const TOKEN_MAX_AGE = 60 * 60 * 24; // 1 day (seconds)

export const ROLE_STUDENT = "student";
export const ROLE_TEACHER = "teacher";

export const STATUS_OPEN = "Open";
export const STATUS_CLOSE = "Close";
export const STATUS_CANCEL = "Cancel";
export const COURSE_STATUSES = [STATUS_OPEN, STATUS_CLOSE, STATUS_CANCEL];
