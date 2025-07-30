import {
  generateSignature,
  generateSignatureBase,
  parseCreatedFromSignatureInput,
} from "@/utils/signature";
import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";
import { getSession } from "../session";

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

  let errorMessage = "";

  const signature = generateSignature(signatureBase, session.secretKey);
  if (req.headers["signature"] !== signature) {
    errorMessage += "Invalid HTTP signature ";
  }

  const requestString = [
    `GET ${req.url} HTTP/1.1`,
    `Host: ${req.headers["authority"]}`,
    `Signature-Input: ${req.headers["signature-input"]}`,
    `Signature: ${signature}`,
  ].join("\n");

  if (errorMessage !== "") {
    return res.status(401).json({
      request: requestString,
      response: {
        status: "error",
        message: `GET - ${errorMessage}`,
        requestSignature: req.headers["signature"],
        calculatedSignature: signature,
      },
    });
  }

  return res.json({
    request: requestString,
    response: {
      status: "success",
      message: "Hello World!",
      requestSignature: req.headers["signature"],
      calculatedSignature: signature,
    },
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

  let errorMessage = "";

  const signature = generateSignature(signatureBase, session.secretKey);
  if (req.headers["signature"] !== signature) {
    errorMessage += "Invalid HTTP signature ";
  }

  const requestString = [
    `POST ${req.url} HTTP/1.1`,
    `Host: ${req.headers["authority"]}`,
    `Content-Type: ${req.headers["content-type"]}`,
    `Content-Length: ${req.headers["content-length"]}`,
    `Digest: ${req.headers["digest"]}`,
    `Signature-Input: ${req.headers["signature-input"]}`,
    `Signature: ${signature}`,
    "",
    `Payload:`,
    JSON.stringify({ hello: "world" }, null, 2),
  ].join("\n");

  if (errorMessage !== "") {
    return res.status(401).json({
      request: requestString,
      response: {
        status: "error",
        message: `${errorMessage}`,
        requestSignature: req.headers["signature"],
        calculatedSignature: signature,
      },
    });
  }

  return res.json({
    request: requestString,
    response: {
      status: "success",
      message: "Hello World!",
      requestSignature: req.headers["signature"],
      calculatedSignature: signature,
    },
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
