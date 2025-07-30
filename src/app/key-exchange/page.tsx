"use client";
import { useSecretKey } from "@/contexts/secret-key-context";
import { Box, CircularProgress, Container, Typography } from "@mui/material";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { generateECDHKeyPairAndSharedSecret } from "./ecdh";

const KeyExchangePage = () => {
  const router = useRouter();
  const { setSecretKey } = useSecretKey();
  const [error, setError] = useState<string | null>(null);

  const didRun = useRef(false);

  useEffect(() => {
    if (didRun.current) {
      return;
    }

    didRun.current = true;

    const initiateKeyExchange = async () => {
      try {
        // Step 1: Check session status
        const sessionResponse = await axios.get("/api/auth/status");
        const sessionData = sessionResponse.data;

        if (!sessionData.user || !sessionData.isAuthenticated) {
          // If no session, redirect to login
          router.push("/login");
          return;
        }

        // Step 2: Initiate key exchange and get DH parameters and server public key
        const response = await axios.get("/api/key-exchange/init");
        const { serverPublicKey } = response.data;

        const { sharedSecret, clientPublicKeyBase64 } =
          await generateECDHKeyPairAndSharedSecret(serverPublicKey);

        setSecretKey(sharedSecret);

        // Step 5: Send client public key to server
        await axios.post("/api/key-exchange/complete", {
          clientPublicKey: clientPublicKeyBase64,
        });

        router.push("/home");
      } catch (error) {
        console.error("Error during key exchange:", error);
        if (axios.isAxiosError(error) && error.response?.status === 400) {
          setError("Invalid key exchange request. Please try again.");
        } else {
          setError("Error during key exchange!");
        }
      }
    };

    initiateKeyExchange();
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
        <CircularProgress sx={{ mb: 2 }} />
        <Typography variant="h4" gutterBottom>
          Loading ... Key Exchange
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Please wait while we do the key exchange process.
        </Typography>
      </Box>
      {error && (
        <Typography variant="subtitle1" color="error">
          {error}
        </Typography>
      )}
    </Container>
  );
};

export default KeyExchangePage;
