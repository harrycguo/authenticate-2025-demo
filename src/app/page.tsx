'use client'
import BusinessIcon from '@mui/icons-material/Business';
import { AppBar, Box, Button, Container, Toolbar, Typography } from "@mui/material";
import { signIn, signOut, useSession } from 'next-auth/react';

export default function Home() {
  const { data: session } = useSession();


  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <BusinessIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            ACME Corporation
          </Typography>
          {session && (
            <Button color="inherit" onClick={() => signOut()}>
              Logout
            </Button>
          )}
        </Toolbar>
      </AppBar>
      <Container
        sx={{
          display: "flex",
          minHeight: "calc(100vh - 64px)", // Subtract AppBar height
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 3
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <BusinessIcon sx={{ fontSize: 60, color: "primary.main", mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            {session ? `Welcome, ${session.user?.name}` : "Welcome to ACME"}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            {session ? "You are logged in." : "Please login to continue"}
          </Typography>
          {session ? (
            <Button variant="contained" size="large" onClick={() => signOut()}>
              Logout
            </Button>
          ) : (
            <Button variant="contained" size="large" onClick={() => signIn('oidc')}>
              Login
            </Button>
          )}
        </Box>
      </Container>
    </>
  );
}
