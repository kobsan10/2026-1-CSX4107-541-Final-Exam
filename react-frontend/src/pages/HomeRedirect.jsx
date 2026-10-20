//src/pages/HomeRedirect.jsx

import { Navigate } from "react-router-dom";
import { useUser } from "../hooks/useUser";

export default function HomeRedirect() {
  const { user } = useUser();
  return <Navigate to={user?.role === "teacher" ? "/teacher/courses" : "/courses"} replace />;
}
