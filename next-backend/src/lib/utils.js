// src/lib/utils.js

import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import corsHeaders from "./cors";
import {
  X_HEADER_USER_EMAIL,
  X_HEADER_USER_ID,
  X_HEADER_USER_NAME,
  X_HEADER_USER_ROLE,
} from "./constant";

export function printExceptionLog(logMessage, error) {
  console.log(`==>${logMessage} Exception`);
  console.log(error);
}

export function errorResponse(message, status) {
  return NextResponse.json(
    {
      message: message,
    },
    {
      status: status,
      headers: corsHeaders,
    },
  );
}

export function successResponse(jsonData, status) {
  return NextResponse.json(jsonData, {
    status: status,
    headers: corsHeaders,
  });
}

export function optionsResponse() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

// The proxy verifies the JWT and forwards the user via request headers
export function getRequestUser(request) {
  const id = request.headers.get(X_HEADER_USER_ID);
  if (!id) return null;
  return {
    id,
    username: request.headers.get(X_HEADER_USER_NAME),
    email: request.headers.get(X_HEADER_USER_EMAIL),
    role: request.headers.get(X_HEADER_USER_ROLE),
  };
}

export function toObjectId(id) {
  return ObjectId.isValid(id) && String(new ObjectId(id)) === id
    ? new ObjectId(id)
    : null;
}

export function toPublicUser(user) {
  return {
    _id: user._id,
    username: user.username,
    email: user.email,
    role: user.role,
  };
}

export async function readJsonBody(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}
