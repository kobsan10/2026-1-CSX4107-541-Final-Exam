//src/pages/student/MyCourses.jsx

import { useEffect, useState } from "react";
import { Alert, Box, Typography } from "@mui/material";
import CourseTable from "../../components/CourseTable";
import { useApi } from "../../hooks/useApi";

export default function MyCourses() {
  const api = useApi();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api("/api/course?enrolled=true")
      .then((data) => setCourses(data.courses))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [api]);

  return (
    <Box className="flex flex-col gap-4">
      <Typography variant="h5">My Enrolled Courses</Typography>
      {error && <Alert severity="error">{error}</Alert>}
      <CourseTable courses={courses} loading={loading} detailPath="/courses" />
    </Box>
  );
}
