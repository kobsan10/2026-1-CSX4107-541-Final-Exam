//src/pages/student/StudentCourseDetail.jsx

import { useEffect, useState } from "react";
import { Alert, Box, Button, CircularProgress } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import CourseInfo from "../../components/CourseInfo";
import { useApi } from "../../hooks/useApi";

function enrollState(course) {
  if (course.isEnrolled) return { can: false, label: "Already Enrolled" };
  if (course.status !== "Open") return { can: false, label: "Not Open for Enrollment" };
  if (course.seatsLeft <= 0) return { can: false, label: "Course Full" };
  return { can: true, label: "Enroll" };
}

export default function StudentCourseDetail() {
  const { id } = useParams();
  const api = useApi();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    api(`/api/course/${id}`)
      .then((data) => setCourse(data.course))
      .catch((err) => setError(err.message));
  }, [api, id]);

  async function handleEnroll() {
    setError("");
    setSuccess("");
    setEnrolling(true);
    try {
      const data = await api(`/api/course/${id}/enroll`, { method: "POST" });
      setCourse(data.course);
      setSuccess(data.message);
    } catch (err) {
      setError(err.message);
      // refresh so seats/status reflect the latest data
      api(`/api/course/${id}`)
        .then((data) => setCourse(data.course))
        .catch(() => {});
    } finally {
      setEnrolling(false);
    }
  }

  if (!course) {
    return error ? (
      <Alert severity="error">{error}</Alert>
    ) : (
      <Box className="flex justify-center p-10">
        <CircularProgress />
      </Box>
    );
  }

  const state = enrollState(course);

  return (
    <Box className="flex flex-col gap-4">
      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}
      <CourseInfo course={course}>
        <Box className="flex gap-2">
          <Button variant="contained" disabled={!state.can || enrolling} onClick={handleEnroll}>
            {enrolling ? "Enrolling..." : state.label}
          </Button>
          <Button onClick={() => navigate(-1)}>Back</Button>
        </Box>
      </CourseInfo>
    </Box>
  );
}
