// src/lib/mongodb.js

import { MongoClient } from "mongodb";

const options = {};
let globalClientPromise;

export function getClientPromise() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      "Please add your Mongo URI to .env.local or set MONGODB_URI env variable",
    );
  }
  // Reuse one connection per server instance (also on Vercel, where
  // a new client per request would quickly exhaust Atlas connections)
  if (!globalClientPromise) {
    const client = new MongoClient(uri, options);
    globalClientPromise = client.connect().catch((err) => {
      globalClientPromise = undefined;
      throw err;
    });
  }
  return globalClientPromise;
}
