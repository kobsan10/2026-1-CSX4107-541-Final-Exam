//src/components/Layout.jsx

import { AppBar, Box, Button, Chip, Container, Toolbar, Typography } from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useUser } from "../hooks/useUser";

const teacherLinks = [
  { to: "/teacher/courses", label: "My Courses" },
  { to: "/teacher/courses/new", label: "New Course" },
];

const studentLinks = [
  { to: "/courses", label: "Browse Courses" },
  { to: "/my-courses", label: "My Enrolled" },
];

export default function Layout() {
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const links = user?.role === "teacher" ? teacherLinks : studentLinks;

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <Box className="min-h-screen bg-slate-50">
      <AppBar position="static">
        <Toolbar className="gap-2 flex-wrap">
          <SchoolIcon />
          <Typography variant="h6" className="mr-4">
            Online Course
          </Typography>
          {links.map((link) => (
            <Button
              key={link.to}
              component={NavLink}
              to={link.to}
              end
              color="inherit"
              sx={{ "&.active": { textDecoration: "underline" } }}
            >
              {link.label}
            </Button>
          ))}
          <Box className="flex-1" />
          <Typography variant="body2">{user?.username}</Typography>
          <Chip
            label={user?.role}
            size="small"
            sx={{ bgcolor: "white", textTransform: "capitalize" }}
          />
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" className="py-6">
        <Outlet />
      </Container>
    </Box>
  );
}
