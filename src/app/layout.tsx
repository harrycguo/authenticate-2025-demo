"use client";
import CustomApolloProvider from "@/contexts/apollo-provider";
import { SecretKeyProvider } from "@/contexts/secret-key-context";

const RootLayout = ({ children }: { children: React.ReactNode }) => (
  <html lang="en">
    <body>
      <SecretKeyProvider>
        <CustomApolloProvider>{children}</CustomApolloProvider>
      </SecretKeyProvider>
    </body>
  </html>
);

export default RootLayout;
