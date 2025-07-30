"use client";
import { useSecretKey } from "@/contexts/secret-key-context";
import axiosClient from "@/utils/axios-client";
import {
  AppBar,
  Box,
  Button,
  Container,
  Toolbar,
  Typography,
} from "@mui/material";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { generateSharedSecret } from "./ecdh";

interface User {
  name: string;
}

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [httpRequest, setHttpRequest] = useState<string | null>(null);
  const [httpResponse, setHttpResponse] = useState<string | null>(null);
  const { secretKey, setSecretKey, signedToken } = useSecretKey();

  useEffect(() => {
    axios
      .get("/api/auth/status")
      .then((response) => {
        const data = response.data;
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

  useEffect(() => {
    const generateSecret = async () => {
      const secret = await generateSharedSecret();
      setSecretKey(secret);
    };
    generateSecret();
  }, [secretKey]);

  const handleLogout = async () => {
    await axios.post("/api/auth/logout");
    router.push("/login");
  };

  const makeAxiosGet = async () => {
    try {
      const response = await axiosClient(secretKey, signedToken).get(
        "/api/http/hello-world"
      );
      setHttpRequest(response.data.request);
      setHttpResponse(JSON.stringify(response.data.response, null, 2));
    } catch (error) {
      setHttpRequest((error as any).response.data.request);
      if ((error as any).response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        setHttpResponse(
          JSON.stringify((error as any).response.data.response, null, 2)
        );
      } else if ((error as any).request) {
        // The request was made but no response was received
        setHttpResponse("No response received from server.");
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Error in setting up the request.", error);
        setHttpResponse("Error in setting up the request");
      }
    }
  };

  const makeAxiosPost = async () => {
    try {
      const response = await axiosClient(secretKey, signedToken).post(
        "/api/http/hello-world",
        {
          hello: "world",
        }
      );
      setHttpRequest(response.data.request);
      setHttpResponse(JSON.stringify(response.data.response, null, 2));
    } catch (error) {
      setHttpRequest((error as any).response.data.request);
      if ((error as any).response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        setHttpResponse(
          JSON.stringify((error as any).response.data.response, null, 2)
        );
      } else if ((error as any).request) {
        // The request was made but no response was received
        setHttpResponse("No response received from server.");
      } else {
        console.error("Error in setting up the request.", error);
        setHttpResponse("Error in setting up the request");
      }
    }
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, fontWeight: 550 }}
          >
            Authenticate 2025 Demo
          </Typography>
          <Button
            variant="contained"
            color="error"
            size="medium"
            onClick={handleLogout}
          >
            <Typography fontSize={14} fontWeight={550}>
              LOGOUT
            </Typography>
          </Button>
        </Toolbar>
      </AppBar>
      <Container
        sx={{
          display: "flex",
          marginTop: 10,
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 3,
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <img
            src="https://authenticatecon.com/wp-content/uploads/2021/04/logo-main.svg"
            alt="Authenticate 2025 Logo"
            width={280}
            style={{ marginBottom: "12px" }}
          />
          <Typography variant="h4" gutterBottom>
            Welcome, {user?.name}!
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Click on any of the buttons to see examples of signed HTTP requests
            and responses.
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            width: "800px",
            gap: 4,
            mb: 3,
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: 1,
              width: "50%",
            }}
          >
            <Typography variant="h6" color="primary.dark" gutterBottom>
              Request
            </Typography>
            <Button
              variant="outlined"
              color="primary"
              onClick={makeAxiosGet}
              sx={{
                color: "primary.dark",
                borderColor: "primary.dark",
                fontWeight: 500,
                "&:hover": {
                  borderColor: "primary.dark",
                  backgroundColor: "rgba(23, 162, 184, 0.2)", // subtle blue
                },
              }}
            >
              GET
            </Button>

            <Button
              variant="outlined"
              color="primary"
              onClick={makeAxiosPost}
              sx={{
                color: "primary.dark",
                borderColor: "primary.dark",
                fontWeight: 500,
                "&:hover": {
                  borderColor: "primary.dark",
                  backgroundColor: "rgba(23, 162, 184, 0.2)", // subtle blue
                },
              }}
            >
              POST
            </Button>
            {httpRequest && (
              <pre
                style={{
                  whiteSpace: "pre-wrap",
                  fontFamily: "monospace",
                  background: "#f7f7f7",
                  padding: "10px",
                  borderRadius: "6px",
                  width: "100%",
                  fontSize: "12px",
                }}
              >
                {httpRequest}
              </pre>
            )}
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: 1,
              width: "50%",
            }}
          >
            <Typography variant="h6" color="primary.dark" gutterBottom>
              Response
            </Typography>
            <pre
              style={{
                fontFamily: "Roboto, sans-serif",
                textAlign: "left",
                fontSize: "16px",
                color: httpResponse?.includes("error")
                  ? "darkred"
                  : "darkgreen",
                whiteSpace: "pre-wrap", // Preserve whitespace and wrap lines
                overflowWrap: "break-word", // Break long words if needed
                maxWidth: "100%", // Make sure the <pre> respects parent width
                boxSizing: "border-box", // Include padding/border in width calculation
              }}
            >
              {httpResponse}
            </pre>
          </Box>
        </Box>
      </Container>
    </>
  );
}
