//src/pages/teacher/CourseForm.jsx

import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { useApi } from "../../hooks/useApi";

const STATUSES = ["Open", "Close", "Cancel"];
const emptyForm = {
  name: "",
  durationDays: "",
  price: "",
  maxStudent: "",
  status: "Open",
  topics: [],
};

/** Create (no :id) or edit (with :id) a course */
export default function CourseForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const api = useApi();
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [topicInput, setTopicInput] = useState("");
  const [enrolledCount, setEnrolledCount] = useState(0);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isEdit) return;
    api(`/api/course/${id}`)
      .then(({ course }) => {
        setForm({
          name: course.name,
          durationDays: course.durationDays,
          price: course.price,
          maxStudent: course.maxStudent,
          status: course.status,
          topics: course.topics,
        });
        setEnrolledCount(course.enrolledCount);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [api, id, isEdit]);

  function setField(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  function addTopic() {
    const topic = topicInput.trim();
    if (topic && !form.topics.includes(topic)) {
      setForm((f) => ({ ...f, topics: [...f.topics, topic] }));
    }
    setTopicInput("");
  }

  function removeTopic(topic) {
    setForm((f) => ({ ...f, topics: f.topics.filter((t) => t !== topic) }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (form.topics.length === 0) {
      setError("Please add at least one topic");
      return;
    }
    setSaving(true);
    try {
      const body = {
        ...form,
        durationDays: Number(form.durationDays),
        price: Number(form.price),
        maxStudent: Number(form.maxStudent),
      };
      const { course } = await api(isEdit ? `/api/course/${id}` : "/api/course", {
        method: isEdit ? "PUT" : "POST",
        body,
      });
      navigate(`/teacher/courses/${course._id}`, { replace: true });
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <Box className="flex justify-center p-10">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper className="p-6 max-w-2xl mx-auto">
      <Typography variant="h5" className="mb-4">
        {isEdit ? "Edit Course" : "Create Course"}
      </Typography>
      <Box component="form" onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && <Alert severity="error">{error}</Alert>}
        <TextField label="Course Name" value={form.name} onChange={setField("name")} required />
        <Box className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <TextField
            label="Duration (days)"
            type="number"
            value={form.durationDays}
            onChange={setField("durationDays")}
            slotProps={{ htmlInput: { min: 1, step: 1 } }}
            required
          />
          <TextField
            label="Price (THB)"
            type="number"
            value={form.price}
            onChange={setField("price")}
            slotProps={{ htmlInput: { min: 0, step: "any" } }}
            required
          />
          <TextField
            label="Max Student"
            type="number"
            value={form.maxStudent}
            onChange={setField("maxStudent")}
            slotProps={{ htmlInput: { min: Math.max(1, enrolledCount), step: 1 } }}
            helperText={isEdit && enrolledCount > 0 ? `${enrolledCount} already enrolled` : ""}
            required
          />
        </Box>
        <TextField select label="Status" value={form.status} onChange={setField("status")}>
          {STATUSES.map((s) => (
            <MenuItem key={s} value={s}>
              {s}
            </MenuItem>
          ))}
        </TextField>

        <Box>
          <Box className="flex gap-2">
            <TextField
              label="Add Topic"
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTopic();
                }
              }}
              size="small"
              className="flex-1"
            />
            <Button variant="outlined" onClick={addTopic}>
              Add
            </Button>
          </Box>
          <Box className="flex gap-1 flex-wrap mt-2">
            {form.topics.map((t) => (
              <Chip key={t} label={t} onDelete={() => removeTopic(t)} />
            ))}
            {form.topics.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                No topics yet
              </Typography>
            )}
          </Box>
        </Box>

        <Box className="flex gap-2 justify-end">
          <Button onClick={() => navigate(-1)}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={saving}>
            {saving ? "Saving..." : isEdit ? "Save Changes" : "Create Course"}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}
