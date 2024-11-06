"use client";
import BusinessIcon from "@mui/icons-material/Business";
import { Box, Button, Container, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Login() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch("/api/auth/status")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          router.push("/home");
        }
      })
      .catch(() => setUser(null));
  }, [router]);

  return (
    <Container
      sx={{
        display: "flex",
        minHeight: "100vh",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 3,
      }}
    >
      <Box sx={{ textAlign: "center" }}>
        <BusinessIcon sx={{ fontSize: 60, color: "primary.main", mb: 2 }} />
        <Typography variant="h4" gutterBottom>
          Welcome to ACME
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
          Join ACME Corporation to access your personalized dashboard, manage
          your profile, and more.
        </Typography>
        <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => router.push("/api/auth/login")}
          >
            Login
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
