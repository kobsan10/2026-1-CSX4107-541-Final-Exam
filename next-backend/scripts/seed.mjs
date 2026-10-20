// scripts/seed.mjs
// Usage: npm run seed   (reads MONGODB_URI / DB_NAME from .env.local)
// Creates 3 teachers, 3 students and a few sample courses. Safe to re-run.

import bcrypt from "bcrypt";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || "wad_final";
const PASSWORD = "password123";

if (!uri) {
  console.error("MONGODB_URI is not set");
  process.exit(1);
}

const users = [
  { username: "teacher1", email: "teacher1@example.com", role: "teacher" },
  { username: "teacher2", email: "teacher2@example.com", role: "teacher" },
  { username: "teacher3", email: "teacher3@example.com", role: "teacher" },
  { username: "student1", email: "student1@example.com", role: "student" },
  { username: "student2", email: "student2@example.com", role: "student" },
  { username: "student3", email: "student3@example.com", role: "student" },
];

const client = new MongoClient(uri);

try {
  await client.connect();
  const db = client.db(dbName);
  const usersCol = db.collection("users");
  const coursesCol = db.collection("courses");

  await usersCol.createIndex({ username: 1 }, { unique: true });
  await usersCol.createIndex({ email: 1 }, { unique: true });
  await coursesCol.createIndex({ teacherId: 1 });
  await coursesCol.createIndex({ "students.studentId": 1 });

  const hash = await bcrypt.hash(PASSWORD, 10);
  for (const u of users) {
    await usersCol.updateOne(
      { username: u.username },
      { $set: { ...u, password: hash } },
      { upsert: true },
    );
  }
  console.log(`Seeded ${users.length} users (password: ${PASSWORD})`);

  const byName = Object.fromEntries(
    (await usersCol.find().toArray()).map((u) => [u.username, u]),
  );

  if ((await coursesCol.countDocuments()) === 0) {
    const now = new Date();
    const course = (teacher, fields) => ({
      ...fields,
      teacherId: byName[teacher]._id,
      teacherName: teacher,
      students: [],
      createdAt: now,
      updatedAt: now,
    });
    await coursesCol.insertMany([
      course("teacher1", {
        name: "Intro to React",
        durationDays: 5,
        topics: ["JSX", "Components", "Hooks"],
        price: 1500,
        maxStudent: 3,
        status: "Open",
      }),
      course("teacher1", {
        name: "Advanced Next.js",
        durationDays: 3,
        topics: ["App Router", "Route Handlers"],
        price: 2500,
        maxStudent: 2,
        status: "Close",
      }),
      course("teacher2", {
        name: "MongoDB Basics",
        durationDays: 2,
        topics: ["CRUD", "Indexes", "Aggregation"],
        price: 990,
        maxStudent: 1,
        status: "Open",
      }),
      course("teacher3", {
        name: "Legacy PHP",
        durationDays: 4,
        topics: ["Syntax"],
        price: 500,
        maxStudent: 10,
        status: "Cancel",
      }),
    ]);
    console.log("Seeded sample courses");
  } else {
    console.log("Courses already exist, skipped sample courses");
  }
} finally {
  await client.close();
}
