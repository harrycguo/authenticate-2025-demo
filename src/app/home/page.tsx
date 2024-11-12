"use client";
import { useSecretKey } from "@/contexts/secret-key-context";
import axiosClient from "@/utils/axios-client";
import BusinessIcon from "@mui/icons-material/Business";
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
  // add other user properties as needed
}

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [httpRequest, setHttpRequest] = useState<string | null>(null);
  const [httpResponse, setHttpResponse] = useState<string | null>(null);
  const { secretKey, setSecretKey } = useSecretKey();

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
      console.log("Shared secret:", secret);
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
      const response = await axiosClient(secretKey).get(
        "/api/http/hello-world"
      );
      setHttpResponse(JSON.stringify(response.data, null, 2));
    } catch (error) {
      if ((error as any).response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        setHttpResponse(JSON.stringify((error as any).response.data, null, 2));
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
      const response = await axiosClient(secretKey).post(
        "/api/http/hello-world",
        {
          hello: "world",
        }
      );
      setHttpResponse(JSON.stringify(response.data, null, 2));
    } catch (error) {
      if ((error as any).response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        setHttpResponse(JSON.stringify((error as any).response.data, null, 2));
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
          <BusinessIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Beyond Identity
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
            Welcome back, {user?.name}! Secret key: {secretKey}
          </Typography>
        </Box>

        <Box>
          <Box
            sx={{
              display: "flex",
              gap: 4,
              justifyContent: "center",
              mb: 3,
            }}
          >
            <Box
              sx={{
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: 1,
              }}
            >
              <Typography variant="h6" color="primary" gutterBottom>
                HTTP Axios
              </Typography>
              <Button variant="outlined" onClick={makeAxiosGet}>
                GET
              </Button>
              <Button variant="outlined" onClick={makeAxiosPost}>
                POST
              </Button>
              <Button
                variant="outlined"
                onClick={() => console.log("GraphQL GET Request")}
              >
                GET w/ Signed Token
              </Button>
              <Button
                variant="outlined"
                onClick={() => console.log("GraphQL POST Request")}
              >
                POST w/ Signed Token
              </Button>
            </Box>
            <Box
              sx={{
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: 1,
              }}
            >
              <Typography variant="h6" color="primary" gutterBottom>
                GraphQL
              </Typography>
              <Button variant="outlined" onClick={makeAxiosGet}>
                GET
              </Button>
              <Button variant="outlined" onClick={makeAxiosPost}>
                POST
              </Button>
              <Button
                variant="outlined"
                onClick={() => console.log("GraphQL GET Request")}
              >
                GET w/ Signed Token
              </Button>
              <Button
                variant="outlined"
                onClick={() => console.log("GraphQL POST Request")}
              >
                POST w/ Signed Token
              </Button>
            </Box>
          </Box>
        </Box>

        <Box
          sx={{
            minWidth: "700px",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: 1,
          }}
        >
          <Box
            marginBottom={3}
            sx={{
              fontFamily: "Roboto, sans-serif",
              textAlign: "left",
            }}
          >
            Request:
            <pre
              style={{
                fontFamily: "Roboto, sans-serif",
                textAlign: "left",
                fontSize: "16px",
                color: httpResponse?.includes("error")
                  ? "darkred"
                  : "darkgreen",
              }}
            >
              {httpRequest}
            </pre>
          </Box>
          <Box
            marginBottom={3}
            sx={{
              fontFamily: "Roboto, sans-serif",
              textAlign: "left",
            }}
          >
            Response:
            <pre
              style={{
                fontFamily: "Roboto, sans-serif",
                textAlign: "left",
                fontSize: "16px",
                color: httpResponse?.includes("error")
                  ? "darkred"
                  : "darkgreen",
              }}
            >
              {httpResponse}
            </pre>
          </Box>
        </Box>
        <Button
          variant="contained"
          color="error"
          size="large"
          onClick={handleLogout}
        >
          Logout
        </Button>
      </Container>
    </>
  );
}
