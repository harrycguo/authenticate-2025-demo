"use client";
import BusinessIcon from "@mui/icons-material/Business";
import {
  AppBar,
  Box,
  Button,
  Container,
  Toolbar,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface User {
  name: string;
  // add other user properties as needed
}

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetch("/api/auth/status")
      .then((res) => res.json())
      .then((data) => {
        if (!data.user) {
          router.push("/login");
          return;
        }
        setUser(data.user);
      })
      .catch(() => {
        setUser(null);
        router.push("/login");
      });
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <BusinessIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            ACME Corporation
          </Typography>
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Container
        sx={{
          display: "flex",
          minHeight: "calc(100vh - 64px)",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 3,
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <BusinessIcon sx={{ fontSize: 60, color: "primary.main", mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            Welcome back, {user?.name}!
          </Typography>
          <Typography variant="h6" color="primary" gutterBottom>
            Your Workspace
          </Typography>
          <Box
            sx={{
              display: "flex",
              gap: 2,
              justifyContent: "center",
              mb: 3,
            }}
          >
            <Button variant="outlined" onClick={() => router.push("/dashboard")}>
              Dashboard
            </Button>
            <Button variant="outlined" onClick={() => router.push("/profile")}>
              Profile
            </Button>
            <Button variant="outlined" onClick={() => router.push("/settings")}>
              Settings
            </Button>
          </Box>
          <Button
            variant="contained"
            color="error"
            size="large"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Box>
      </Container>
    </>
  );
} 