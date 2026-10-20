//src/components/CourseTable.jsx

import { DataGrid } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import StatusChip from "./StatusChip";

/** Course list grid; clicking a row opens `${detailPath}/${id}` */
export default function CourseTable({ courses, loading, detailPath, showTeacher = true }) {
  const navigate = useNavigate();

  const columns = [
    { field: "name", headerName: "Course", flex: 1, minWidth: 180 },
    ...(showTeacher
      ? [{ field: "teacherName", headerName: "Teacher", width: 130 }]
      : []),
    { field: "durationDays", headerName: "Days", width: 80, type: "number" },
    {
      field: "topics",
      headerName: "Topics",
      flex: 1,
      minWidth: 160,
      valueGetter: (value) => value?.join(", "),
    },
    { field: "price", headerName: "Price", width: 100, type: "number" },
    {
      field: "seats",
      headerName: "Enrolled",
      width: 100,
      valueGetter: (_, row) => `${row.enrolledCount} / ${row.maxStudent}`,
    },
    {
      field: "status",
      headerName: "Status",
      width: 110,
      renderCell: (params) => <StatusChip status={params.value} />,
    },
  ];

  return (
    <DataGrid
      rows={courses}
      columns={columns}
      getRowId={(row) => row._id}
      loading={loading}
      onRowClick={(params) => navigate(`${detailPath}/${params.id}`)}
      disableRowSelectionOnClick
      autoHeight
      initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
      pageSizeOptions={[10, 25]}
      sx={{ bgcolor: "white", "& .MuiDataGrid-row": { cursor: "pointer" } }}
    />
  );
}
