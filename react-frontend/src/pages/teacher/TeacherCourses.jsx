//src/pages/teacher/TeacherCourses.jsx

import { useEffect, useState } from "react";
import { Alert, Box, Button, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { Link } from "react-router-dom";
import CourseTable from "../../components/CourseTable";
import { useApi } from "../../hooks/useApi";

export default function TeacherCourses() {
  const api = useApi();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api("/api/course")
      .then((data) => setCourses(data.courses))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [api]);

  return (
    <Box className="flex flex-col gap-4">
      <Box className="flex items-center justify-between">
        <Typography variant="h5">My Courses</Typography>
        <Button component={Link} to="/teacher/courses/new" variant="contained" startIcon={<AddIcon />}>
          New Course
        </Button>
      </Box>
      {error && <Alert severity="error">{error}</Alert>}
      <CourseTable
        courses={courses}
        loading={loading}
        detailPath="/teacher/courses"
        showTeacher={false}
      />
    </Box>
  );
}
