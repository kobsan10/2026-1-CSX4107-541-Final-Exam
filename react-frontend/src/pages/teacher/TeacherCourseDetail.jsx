//src/pages/teacher/TeacherCourseDetail.jsx

import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { Link, useNavigate, useParams } from "react-router-dom";
import CourseInfo from "../../components/CourseInfo";
import { useApi } from "../../hooks/useApi";

export default function TeacherCourseDetail() {
  const { id } = useParams();
  const api = useApi();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [error, setError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    api(`/api/course/${id}`)
      .then((data) => setCourse(data.course))
      .catch((err) => setError(err.message));
  }, [api, id]);

  async function handleDelete() {
    setDeleting(true);
    try {
      await api(`/api/course/${id}`, { method: "DELETE" });
      navigate("/teacher/courses", { replace: true });
    } catch (err) {
      setError(err.message);
      setConfirmOpen(false);
      setDeleting(false);
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

  const hasStudents = course.students.length > 0;

  return (
    <Box className="flex flex-col gap-4">
      {error && <Alert severity="error">{error}</Alert>}
      <CourseInfo course={course}>
        <Box className="flex gap-2">
          <Button component={Link} to={`/teacher/courses/${id}/edit`} variant="contained" startIcon={<EditIcon />}>
            Edit
          </Button>
          <Tooltip title={hasStudents ? "Courses with enrolled students cannot be deleted" : ""}>
            <span>
              <Button
                color="error"
                variant="outlined"
                startIcon={<DeleteIcon />}
                disabled={hasStudents}
                onClick={() => setConfirmOpen(true)}
              >
                Delete
              </Button>
            </span>
          </Tooltip>
        </Box>
      </CourseInfo>

      <Box>
        <Typography variant="h6" className="mb-2">
          Enrolled Students ({course.students.length})
        </Typography>
        <Table size="small" sx={{ bgcolor: "white" }}>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Enrolled At</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {course.students.map((s, i) => (
              <TableRow key={s.studentId}>
                <TableCell>{i + 1}</TableCell>
                <TableCell>{s.username}</TableCell>
                <TableCell>{s.email}</TableCell>
                <TableCell>{new Date(s.enrolledAt).toLocaleString()}</TableCell>
              </TableRow>
            ))}
            {!hasStudents && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No students enrolled yet
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Delete course?</DialogTitle>
        <DialogContent>“{course.name}” will be permanently deleted.</DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button color="error" onClick={handleDelete} disabled={deleting}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
