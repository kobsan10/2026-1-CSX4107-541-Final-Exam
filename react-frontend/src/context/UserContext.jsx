//src/context/UseContext.jsx

import { createContext, useCallback, useEffect, useRef, useState } from "react";
import { apiFetch } from "../lib/api";

// eslint-disable-next-line react-refresh/only-export-components
export const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const checkedRef = useRef(false);

  // Restore the session from the httpOnly cookie on page load
  useEffect(() => {
    if (checkedRef.current) return; // avoid double call in StrictMode
    checkedRef.current = true;

    apiFetch("/api/user")
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  async function login(username, password) {
    const data = await apiFetch("/api/auth/login", {
      method: "POST",
      body: { username, password },
    });
    setUser(data.user);
    return data.user;
  }

  async function logout() {
    try {
      await apiFetch("/api/auth/logout", { method: "POST" });
    } finally {
      setUser(null);
    }
  }

  // Call when the backend answers 401 (e.g. expired token)
  const clearUser = useCallback(() => setUser(null), []);

  return (
    <UserContext.Provider value={{ user, loading, login, logout, clearUser }}>
      {children}
    </UserContext.Provider>
  );
}
