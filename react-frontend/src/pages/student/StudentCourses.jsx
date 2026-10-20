//src/pages/student/StudentCourses.jsx

import { useEffect, useState } from "react";
import { Alert, Box, InputAdornment, TextField, Typography } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CourseTable from "../../components/CourseTable";
import { useApi } from "../../hooks/useApi";

export default function StudentCourses() {
  const api = useApi();
  const [query, setQuery] = useState("");
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Debounced server-side filter by course name or teacher name
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      const q = query.trim();
      api(`/api/course${q ? `?q=${encodeURIComponent(q)}` : ""}`)
        .then((data) => {
          setCourses(data.courses);
          setError("");
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [api, query]);

  return (
    <Box className="flex flex-col gap-4">
      <Typography variant="h5">Browse Courses</Typography>
      <TextField
        placeholder="Search by course name or teacher name"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        sx={{ bgcolor: "white" }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          },
        }}
      />
      {error && <Alert severity="error">{error}</Alert>}
      <CourseTable courses={courses} loading={loading} detailPath="/courses" />
    </Box>
  );
}
