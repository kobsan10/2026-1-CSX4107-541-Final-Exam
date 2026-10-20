//src/components/CourseInfo.jsx

import { Box, Chip, Paper, Typography } from "@mui/material";
import StatusChip from "./StatusChip";

/** Shared read-only course detail block used by teacher and student pages */
export default function CourseInfo({ course, children }) {
  const rows = [
    ["Teacher", course.teacherName],
    ["Duration", `${course.durationDays} day(s)`],
    ["Price", `${Number(course.price).toLocaleString()} THB`],
    ["Seats", `${course.enrolledCount} / ${course.maxStudent} enrolled (${course.seatsLeft} left)`],
  ];

  return (
    <Paper className="p-6">
      <Box className="flex items-center gap-3 flex-wrap mb-4">
        <Typography variant="h5">{course.name}</Typography>
        <StatusChip status={course.status} />
      </Box>
      <Box className="grid grid-cols-[120px_1fr] gap-y-2 mb-4">
        {rows.map(([label, value]) => (
          <Box key={label} className="contents">
            <Typography color="text.secondary">{label}</Typography>
            <Typography>{value}</Typography>
          </Box>
        ))}
        <Typography color="text.secondary">Topics</Typography>
        <Box className="flex gap-1 flex-wrap">
          {course.topics.map((t) => (
            <Chip key={t} label={t} size="small" variant="outlined" />
          ))}
        </Box>
      </Box>
      {children}
    </Paper>
  );
}
