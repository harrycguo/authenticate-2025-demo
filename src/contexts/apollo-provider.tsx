import { ApolloProvider } from "@apollo/client";
import { useSecretKey } from "@/contexts/secret-key-context";
import { useMemo } from "react";
import { createClient } from "@/utils/apollo-client";

const CustomApolloProvider = ({ children }: { children: React.ReactNode }) => {
  const { secretKey } = useSecretKey();

  // Memoize the client to only recreate when `secretKey` changes
  const client = useMemo(() => createClient(secretKey), [secretKey]);

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};

export default CustomApolloProvider;
