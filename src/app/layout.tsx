"use client";
import CustomApolloProvider from "@/contexts/apollo-provider";
import { SecretKeyProvider } from "@/contexts/secret-key-context";
import { theme } from "@/theme/theme";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";

const RootLayout = ({ children }: { children: React.ReactNode }) => (
  <html lang="en">
    <body>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SecretKeyProvider>
          <CustomApolloProvider>{children}</CustomApolloProvider>
        </SecretKeyProvider>
      </ThemeProvider>
    </body>
  </html>
);

export default RootLayout;
