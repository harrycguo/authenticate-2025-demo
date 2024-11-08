"use client";
import { createContext, ReactNode, useContext, useState } from "react";

interface SecretKeyContextType {
  secretKey: string;
  setSecretKey: (key: string) => void;
}

const SecretKeyContext = createContext<SecretKeyContextType | undefined>(
  undefined
);

interface SecretKeyProviderProps {
  children: ReactNode;
}

export function SecretKeyProvider({ children }: SecretKeyProviderProps) {
  const [secretKey, setSecretKeyState] = useState<string>("");

  const setSecretKey = (newKey: string) => {
    setSecretKeyState(newKey);
  };

  return (
    <SecretKeyContext.Provider value={{ secretKey, setSecretKey }}>
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
