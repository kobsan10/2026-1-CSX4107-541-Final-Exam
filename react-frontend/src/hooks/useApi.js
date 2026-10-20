//src/hooks/useApi.js

import { useCallback } from "react";
import { apiFetch } from "../lib/api";
import { useUser } from "./useUser";

/**
 * Returns apiFetch that also logs the user out locally when the
 * backend reports the session is no longer valid (401).
 */
export function useApi() {
  const { clearUser } = useUser();

  return useCallback(
    async (path, options) => {
      try {
        return await apiFetch(path, options);
      } catch (err) {
        if (err.status === 401) clearUser();
        throw err;
      }
    },
    [clearUser],
  );
}
