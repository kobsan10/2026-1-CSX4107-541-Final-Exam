# How to Test the App

Online Course Service: Next.js API backend, React (Vite) frontend, MongoDB.

## Student Information

- **Student Name:** <!-- TODO -->
- **Student ID:** <!-- TODO -->

## Deployed URLs

- **Frontend:** https://2026-1-csx-4107-541-final-exam-3qsp.vercel.app
- **Backend:** https://2026-1-csx-4107-541-final-exam.vercel.app

### Deployment notes (Vercel)

- **Backend project** (Root Directory `next-backend`) env vars: `MONGODB_URI`, `DB_NAME`, `JWT_SECRET`, `FRONTEND_URL` (the frontend domain).
- **Frontend project** (Root Directory `react-frontend`): [`react-frontend/vercel.json`](react-frontend/vercel.json) forwards `/api/*` to the backend. The browser therefore calls the API on the frontend's own domain, and the httpOnly auth cookie works in every browser, including Safari and Incognito, which block cross-site cookies. `VITE_API_URL` is left unset in production; for local development it is `http://localhost:3000`.

## Test Credentials

All test users have the password **`password123`**. You can log in with either the username or the email.

| Role    | Username   | Email                  | Password      |
| ------- | ---------- | ---------------------- | ------------- |
| Teacher | `teacher1` | `teacher1@example.com` | `password123` |
| Teacher | `teacher2` | `teacher2@example.com` | `password123` |
| Teacher | `teacher3` | `teacher3@example.com` | `password123` |
| Student | `student1` | `student1@example.com` | `password123` |
| Student | `student2` | `student2@example.com` | `password123` |
| Student | `student3` | `student3@example.com` | `password123` |

The seed script also creates sample courses:

| Course           | Teacher  | Status | Max Student |
| ---------------- | -------- | ------ | ----------- |
| Intro to React   | teacher1 | Open   | 3           |
| Advanced Next.js | teacher1 | Close  | 2           |
| MongoDB Basics   | teacher2 | Open   | 1           |
| Legacy PHP       | teacher3 | Cancel | 10          |

## Prerequisites

- Node.js 20.6 or newer
- A MongoDB database (MongoDB Atlas or local)

## How to Run & Test

### 1. Backend Setup (`next-backend/`)

```bash
cd next-backend
npm install
cp .env.example .env.local   # then fill in the values
npm run seed                 # creates the 6 test users + sample courses
npm run dev                  # http://localhost:3000
```

| Variable       | Description                                                                 |
| -------------- | --------------------------------------------------------------------------- |
| `MONGODB_URI`  | MongoDB connection string                                                   |
| `DB_NAME`      | Database name (default `wad_final`)                                         |
| `JWT_SECRET`   | Secret used to sign the JWT                                                 |
| `FRONTEND_URL` | Exact origin of the frontend for CORS, no trailing slash (e.g. `http://localhost:5173`) |

### 2. Frontend Setup (`react-frontend/`)

```bash
cd react-frontend
npm install
cp .env.example .env         # VITE_API_URL=http://localhost:3000
npm run dev                  # http://localhost:5173
```

| Variable       | Description                             |
| -------------- | --------------------------------------- |
| `VITE_API_URL` | Backend base URL, no trailing slash     |

### 3. Testing Walkthrough

**Teacher**

1. Log in as `teacher1`. You are taken to **My Courses**, which lists only teacher1's courses.
2. Click **New Course**, fill in the name, duration, price, max student and status, add one or more topics, then click **Create Course**.
3. Click a course row to open its details, including the **Enrolled Students** table.
4. Click **Edit** to change any field or the status (Open / Close / Cancel). Max Student cannot be set below the number of students already enrolled.
5. **Delete** works only while no student is enrolled. The backend returns 409 otherwise.

**Student**

1. Log in as `student1`. **Browse Courses** shows every course except cancelled ones ("Legacy PHP" is hidden).
2. Type in the search box (e.g. `react` or `teacher2`) to filter by part of the course name or the teacher's name.
3. Open "Intro to React" and click **Enroll**. Clicking again is blocked ("Already Enrolled").
4. "Advanced Next.js" is **Close**: visible, but enrollment is rejected.
5. "MongoDB Basics" has 1 seat: enroll as `student1`, then log in as `student2`. The course is now **Full**.
6. **My Enrolled** lists the courses this student has joined.
7. Log back in as the teacher and open the course to see the enrolled students.

## API Overview

Every endpoint except login and logout requires the `token` cookie (an httpOnly JWT). `src/proxy.js` rejects requests without a valid token with **401**. Role, ownership, enrollment and status rules are checked inside each route.

| Method | Endpoint                         | Access                                                                    |
| ------ | -------------------------------- | ------------------------------------------------------------------------- |
| POST   | `/api/auth/login`                | Public. Body `{ username, password }`; sets the cookie                     |
| POST   | `/api/auth/logout`               | Public. Clears the cookie                                                  |
| GET    | `/api/user`                      | Current logged-in user                                                    |
| GET    | `/api/user/:user_id`             | Own profile only (403 otherwise)                                          |
| GET    | `/api/course`                    | Teacher: own courses. Student: all except Cancel; `?q=` filters by course or teacher name; `?enrolled=true` returns my enrolled courses |
| POST   | `/api/course`                    | Teacher only                                                              |
| GET    | `/api/course/:course_id`         | Teacher: own course with enrolled students. Student: not Cancel (unless enrolled) |
| PUT    | `/api/course/:course_id`         | Owner teacher only                                                        |
| DELETE | `/api/course/:course_id`         | Owner teacher only, and only if no students are enrolled (409)            |
| POST   | `/api/course/:course_id/enroll`  | Student only. Course must be Open, have free seats, and the student must not already be enrolled (409 otherwise) |

Enrollment is a single atomic MongoDB update, so two students enrolling at the same moment cannot exceed Max Student or enroll the same student twice.
