"use client";
import BusinessIcon from "@mui/icons-material/Business";
import { Box, Button, Container, Typography } from "@mui/material";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const Login = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await axios.get("/api/auth/status");
        const data = response.data;

        if (data.user) {
          router.push("/home");
        }
      } catch (error) {
        setUser(null);
        console.error("Error checking auth status:", error);
      }
    };

    checkAuthStatus();
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
};

export default Login;
