import CryptoJS from "crypto-js";
import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";
import { getSession } from "../session";

const generateSignatureBase = (
  method: string,
  authority: string,
  path: string,
  contentType: string | undefined,
  contentLength: number | undefined,
  digest: string | undefined,
  now: number
): string => {
  if (method === "GET") {
    return (
      `"@method": ${method.toUpperCase()}\n` +
      `"@authority": ${authority}\n` +
      `"@path": ${path}\n` +
      `"@signature-params": ("@method" "@authority" "@path");created=${now}`
    );
  } else if (method === "POST") {
    return (
      `"@method": ${method.toUpperCase()}\n` +
      `"@authority": ${authority}\n` +
      `"@path": ${path}\n` +
      `"content-type": ${contentType}\n` +
      `"content-length": ${contentLength}\n` +
      `"digest": ${digest}\n` +
      `"@signature-params": ("@method" "@authority" "@path" "content-type" "content-length" "digest");created=${now}`
    );
  }
  return "";
};

const generateSignature = (
  signatureBase: string,
  secretKey: string
): string => {
  const signature = CryptoJS.HmacSHA256(signatureBase, secretKey).toString(
    CryptoJS.enc.Base64
  );
  return `sig-1=:${signature}:`;
};

const parseCreatedFromSignatureInput = (
  signatureInput: string
): number | null => {
  const createdMatch = signatureInput.match(/;created=(\d+)/);
  if (createdMatch && createdMatch[1]) {
    return parseInt(createdMatch[1], 10);
  }
  return null;
};

// Handler functions
const GET = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession(req, res);
  const created = parseCreatedFromSignatureInput(
    req.headers["signature-input"] as string
  );

  const signatureBase = generateSignatureBase(
    req.method as string,
    req.headers["authority"] as string,
    req.url as string,
    req.headers["content-type"] as string,
    parseInt(req.headers["content-length"] as string, 10) || undefined,
    req.headers["Digest"] as string,
    created || 0
  );
  const signature = generateSignature(signatureBase, session.secretKey);

  if (req.headers["signature"] !== signature) {
    return res.status(401).json({
      status: "error",
      message: "Hello World GET - Invalid signature",
      requestSignature: req.headers["signature"],
      calculatedSignature: signature,
    });
  }

  return res.json({
    status: "success",
    message: "Hello World GET - success",
    requestSignature: req.headers["signature"],
    calculatedSignature: signature,
  });
};

const POST = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession(req, res);
  const created = parseCreatedFromSignatureInput(
    req.headers["signature-input"] as string
  );

  const signatureBase = generateSignatureBase(
    req.method as string,
    req.headers["authority"] as string,
    req.url as string,
    req.headers["content-type"] as string,
    parseInt(req.headers["content-length"] as string, 10) || undefined,
    req.headers["digest"] as string,
    created || 0
  );

  console.log("Signature Base:", signatureBase);

  const signature = generateSignature(signatureBase, session.secretKey);

  if (req.headers["signature"] !== signature) {
    return res.status(401).json({
      status: "error",
      message: "Hello World POST - Invalid signature",
      requestSignature: req.headers["signature"],
      calculatedSignature: signature,
    });
  }

  return res.json({
    status: "success",
    message: "Hello World POST - success",
    requestSignature: req.headers["signature"],
    calculatedSignature: signature,
  });
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
})
  .get(GET)
  .post(POST);

export default handler;

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};
