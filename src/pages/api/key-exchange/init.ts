import crypto from "crypto";
import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";
import { getSession } from "../session";

// Handler function
const GET = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession(req, res);

  if (session.hasExchangedKeys) {
    return res.status(400).json({ error: "Keys already exchanged" });
  }

  try {
    // Generate ECDH key pair using curve 'P-256'
    const ecdh = crypto.createECDH("prime256v1"); // 'prime256v1' matches 'P-256'
    const serverPublicKeyHex = ecdh.generateKeys("hex"); // Public key in hex format
    const serverPrivateKeyHex = ecdh.getPrivateKey("hex"); // Private key in hex format

    // Store ECDH private key in the session for later retrieval
    session.ecdhPrivateKey = serverPrivateKeyHex;
    session.hasExchangedKeys = true;

    // Respond with server public key in hex format
    res.status(200).json({ serverPublicKey: serverPublicKeyHex });
  } catch (error) {
    console.error("Error generating ECDH parameters:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Route handler with error handling
const handler = nc<NextApiRequest, NextApiResponse>({
  onError: (error, _, res) => {
    console.error("ERROR", error);
    return res.status(500).json({ error: "Internal server error" });
  },
  onNoMatch: (req, res) => {
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  },
}).get(GET);

export default handler;

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};
