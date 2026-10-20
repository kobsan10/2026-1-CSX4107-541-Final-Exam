import jwt from "jsonwebtoken";
import { TOKEN_COOKIE, TOKEN_MAX_AGE } from "./constant";

const JWT_SECRET = process.env.JWT_SECRET;

export function verifyJWT(req) {
  try {
    const token = req.cookies.get(TOKEN_COOKIE)?.value;

    if (!token) {
      return null;
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (err) {
    console.log(err);
    return null;
  }
}

export function signJWT(user) {
  return jwt.sign(
    {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: TOKEN_MAX_AGE },
  );
}

// Frontend and backend are on different domains when deployed,
// so the cookie must be SameSite=None + Secure to be sent cross-site.
export function tokenCookieOptions(maxAge = TOKEN_MAX_AGE) {
  const isProduction = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
    maxAge,
  };
}
