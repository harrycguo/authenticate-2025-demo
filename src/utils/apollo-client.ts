import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache,
} from "@apollo/client";
import { print } from "graphql";
import {
  calculateDigest,
  generateSignature,
  generateSignatureBase,
  generateSignatureInput,
} from "./signature";

const GRAPHQL_URL = "/api/graphql";

// Middleware link function that takes `secretKey` as an argument
const createClient = (secretKey: string) => {
  const middlewareLink = new ApolloLink((operation, forward) => {
    const body = JSON.stringify({
      operationName: operation.operationName,
      variables: operation.variables,
      query: print(operation.query),
    });

    const method = "POST";
    const contentType = "application/json";
    const path = GRAPHQL_URL;

    console.log("Request body:", body);

    // Calculate Content-Length and Digest synchronously
    const contentLength = Buffer.byteLength(body, "utf-8"); // Accurate content length in bytes
    const digest = calculateDigest(body);
    const digestHeader = `SHA-256=${digest}`;
    const now = Math.floor(Date.now() / 1000);

    // Generate the signature details
    const signatureBase = generateSignatureBase(
      method,
      process.env.NEXT_PUBLIC_API_URL as string,
      path,
      contentType,
      contentLength,
      digestHeader,
      now
    );
    const signatureInput = generateSignatureInput(method, now);
    const signature = generateSignature(signatureBase, secretKey);

    // Setting headers in setContext (without async handling)
    operation.setContext(({ headers = {} }) => ({
      headers: {
        ...headers,
        Authority: process.env.NEXT_PUBLIC_API_URL as string,
        "Content-Type": contentType,
        "Content-Length": contentLength.toString(),
        Digest: digestHeader,
        "Signature-Input": signatureInput,
        Signature: signature,
      },
    }));

    // Forward the operation to continue processing
    return forward(operation);
  });

  const httpLink = new HttpLink({ uri: GRAPHQL_URL });
  const link = ApolloLink.from([middlewareLink, httpLink]);

  return new ApolloClient({
    link,
    cache: new InMemoryCache(),
  });
};

export { createClient };
