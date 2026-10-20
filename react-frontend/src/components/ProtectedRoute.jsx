//src/components/ProtectedRoute.jsx

import { Box, CircularProgress } from "@mui/material";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useUser } from "../hooks/useUser";

/**
 * Guards child routes: requires login, and optionally a specific role.
 * (UI convenience only — the backend enforces the real rules.)
 */
export default function ProtectedRoute({ role }) {
  const { user, loading } = useUser();
  const location = useLocation();

  if (loading) {
    return (
      <Box className="flex justify-center p-10">
        <CircularProgress />
      </Box>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}
