//src/pages/LoginPage.jsx

import { useState } from "react";
import { Alert, Box, Button, Paper, TextField, Typography } from "@mui/material";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useUser } from "../hooks/useUser";

export default function LoginPage() {
  const { user, login } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to="/" replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(username.trim(), password);
      navigate(location.state?.from?.pathname || "/", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Box className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <Paper className="w-full max-w-sm p-8">
        <Typography variant="h5" className="mb-1">
          Online Course Service
        </Typography>
        <Typography color="text.secondary" className="mb-6">
          Sign in to continue
        </Typography>
        <Box component="form" onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            label="Username or Email"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoFocus
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" variant="contained" size="large" disabled={submitting}>
            {submitting ? "Signing in..." : "Login"}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
