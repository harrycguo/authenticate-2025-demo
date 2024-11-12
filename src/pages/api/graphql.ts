import {
  generateSignature,
  generateSignatureBase,
  parseCreatedFromSignatureInput,
} from "@/utils/signature";
import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { GraphQLError } from "graphql";
import { gql } from "graphql-tag";
import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "./session";

const GRAPHQL_URL = "/api/graphql";

// Define a simple schema with TypeScript types
const typeDefs = gql`
  type HelloResponse {
    status: String
    message: String
    requestSignature: String
    calculatedSignature: String
  }

  type Query {
    hello: HelloResponse
  }

  type Mutation {
    hello: HelloResponse
  }
`;

// Define resolvers with TypeScript support
const resolvers = {
  Query: {
    hello: (parent: any, args: any, context: any) => {
      return {
        status: "success",
        message: "Hello for query!",
        requestSignature: context.requestSignature,
        calculatedSignature: context.calculatedSignature,
      };
    },
  },
  Mutation: {
    hello: (parent: any, args: any, context: any) => {
      return {
        status: "success",
        message: "Hello from mutation!",
        requestSignature: context.requestSignature,
        calculatedSignature: context.calculatedSignature,
      };
    },
  },
};

// Initialize Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

// Export the API route handler with Apollo integrated for Next.js
const handler = startServerAndCreateNextHandler(server, {
  context: async (req: NextApiRequest, res: NextApiResponse) => {
    // Extract and log the Bearer token
    const session = await getSession(req, res);

    const created = parseCreatedFromSignatureInput(
      req.headers["signature-input"] as string
    );

    const signatureBase = generateSignatureBase(
      req.method as string,
      req.headers["authority"] as string,
      GRAPHQL_URL,
      req.headers["content-type"] as string,
      parseInt(req.headers["content-length"] as string, 10) || undefined,
      req.headers["digest"] as string,
      created || 0
    );

    const signature = generateSignature(signatureBase, session.secretKey);

    // Check if the signature matches, throw an error if it doesn't
    if (req.headers["signature"] !== signature) {
      throw new GraphQLError("Unauthorized - Invalid signature", {
        extensions: {
          code: "UNAUTHORIZED",
          http: { status: 401 },
          status: "error",
          message: "Hello World GET - Invalid signature",
          requestSignature: req.headers["signature"],
          calculatedSignature: signature,
        },
      });
    }

    return {
      requestSignature: req.headers["signature"],
      calculatedSignature: signature,
    };
  },
});

export default handler;
