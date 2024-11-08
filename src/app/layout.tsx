import { SecretKeyProvider } from "@/contexts/secret-key-context";

const RootLayout = ({ children }: Readonly<{ children: React.ReactNode }>) => (
  <html lang="en">
    <body>
      <SecretKeyProvider>{children}</SecretKeyProvider>
    </body>
  </html>
);

export default RootLayout;
