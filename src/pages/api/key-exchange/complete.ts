import crypto from "crypto";
import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";
import { getSession } from "../session";

// Handler functions
const POST = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { clientPublicKey } = req.body;
    if (!clientPublicKey) {
      return res.status(400).json({ error: "clientPublicKey is required" });
    }

    const session = await getSession(req, res);
    if (!session || !session.ecdhPrivateKey) {
      return res.status(400).json({ error: "ECDH session not initialized" });
    }

    // Recreate ECDH instance and set the private key
    const ecdh = crypto.createECDH("prime256v1");
    ecdh.setPrivateKey(session.ecdhPrivateKey, "hex");

    // Decode the client's Base64 public key to a Buffer
    const clientPublicKeyBuffer = Buffer.from(clientPublicKey, "base64");

    // Compute the shared secret using the decoded client public key
    const sharedSecretHex = ecdh.computeSecret(
      clientPublicKeyBuffer.toString("hex"),
      "hex",
      "hex"
    );
    const sharedSecretBuffer = Buffer.from(sharedSecretHex, "hex");
    const sharedSecretBase64 = sharedSecretBuffer.toString("base64");

    console.log("Shared secret:", sharedSecretBase64);

    // Optionally store the shared secret in the session or use it immediately
    session.secretKey = sharedSecretBase64;
    delete session.ecdhPrivateKey;

    res.status(200).json({ message: "Shared secret computed successfully" });
  } catch (error) {
    console.error("Error computing shared secret:", error);
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
}).post(POST);

export default handler;

export const config = {
  api: {
    bodyParser: true, // Enable body parsing for JSON
    externalResolver: true,
  },
};
