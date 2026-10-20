//src/components/StatusChip.jsx

import { Chip } from "@mui/material";

const colors = { Open: "success", Close: "warning", Cancel: "error" };

export default function StatusChip({ status }) {
  return <Chip label={status} color={colors[status] || "default"} size="small" />;
}
