import { useSecretKey } from "@/contexts/secret-key-context";
import { createClient } from "@/utils/apollo-client";
import { ApolloProvider } from "@apollo/client";
import { useMemo } from "react";

const CustomApolloProvider = ({ children }: { children: React.ReactNode }) => {
  const { secretKey, signedToken } = useSecretKey();

  // Memoize the client to only recreate when `secretKey` changes
  const client = useMemo(
    () => createClient(secretKey, signedToken),
    [secretKey, signedToken]
  );

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};

export default CustomApolloProvider;
