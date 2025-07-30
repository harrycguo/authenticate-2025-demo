"use client";
import BusinessIcon from "@mui/icons-material/Business";
import { Box, Button, Container, Typography } from "@mui/material";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const Login = () => {
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
      <Box sx={{ textAlign: "center", maxWidth: 750 }}>
        <img
          src="https://authenticatecon.com/wp-content/uploads/2021/04/logo-main.svg"
          alt="Authenticate 2025 Logo"
          width={280}
          style={{ marginBottom: "12px" }}
        />
        <Typography variant="h3" gutterBottom>
          Browser Bound Sessions with HTTP Message Signatures Demo
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
          Authenticate 2025 Demo
        </Typography>
        <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => router.push("/api/auth/login")}
          >
            <Typography
              variant="button"
              color="primary.contrastText"
              sx={{ fontWeight: 500 }}
            >
              LOGIN
            </Typography>
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Login;
