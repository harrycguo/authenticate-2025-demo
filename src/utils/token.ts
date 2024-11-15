import jwt, { JwtPayload } from "jsonwebtoken";

// Define the payload type
interface TokenPayload {
  name: string;
  counter: number;
  iat: number;
}

// Function to create and sign a token
const createSignedToken = (name: string, counter: number): string => {
  const privateKey = Buffer.from(
    process.env.PRIVATE_KEY as string,
    "base64"
  ).toString("utf-8");
  const payload: TokenPayload = {
    name,
    counter,
    iat: Math.floor(Date.now() / 1000),
  };

  const token = jwt.sign(payload, privateKey, {
    algorithm: "RS256",
    expiresIn: "15s",
  });

  return token;
};

// Function to verify a token
const verifyToken = (token: string): JwtPayload | string => {
  const publicKey = Buffer.from(
    process.env.PUBLIC_KEY as string,
    "base64"
  ).toString("utf-8");

  try {
    const decoded = jwt.verify(token, publicKey, {
      algorithms: ["RS256"],
    });
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error("Token has expired");
    } else {
      throw new Error("Token verification failed");
    }
  }
};

export { createSignedToken, verifyToken };
