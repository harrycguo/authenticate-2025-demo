"use client";
import { createContext, ReactNode, useContext, useState } from "react";

interface SecretKeyContextType {
  secretKey: string;
  setSecretKey: (key: string) => void;
  signedToken: string;
  setSignedToken: (token: string) => void;
}

const SecretKeyContext = createContext<SecretKeyContextType | undefined>(
  undefined
);

interface SecretKeyProviderProps {
  children: ReactNode;
}

export function SecretKeyProvider({ children }: SecretKeyProviderProps) {
  const [secretKey, setSecretKeyState] = useState<string>("no-key");
  const [signedToken, setSignedTokenState] = useState<string>("no-token");

  const setSecretKey = (newKey: string) => {
    setSecretKeyState(newKey);
  };

  const setSignedToken = (newToken: string) => {
    setSignedTokenState(newToken);
  };

  return (
    <SecretKeyContext.Provider
      value={{ secretKey, setSecretKey, signedToken, setSignedToken }}
    >
      {children}
    </SecretKeyContext.Provider>
  );
}

// Custom hook to use the secret key
export function useSecretKey(): SecretKeyContextType {
  const context = useContext(SecretKeyContext);
  if (context === undefined) {
    throw new Error("useSecretKey must be used within a SecretKeyProvider");
  }
  return context;
}
